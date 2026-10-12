/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppState,
  ScreenType,
  MedicationItem,
  WaterData,
  ExerciseData,
  SleepData,
  MedicationData,
} from './types';
import {
  loadAppState,
  saveAppState,
  getTodayDateString,
} from './utils/storage';
import {
  playWaterDropSound,
  playExerciseSound,
  playSleepSound,
  playMedicationSound,
  playCelebrationSound,
  triggerVibration,
} from './utils/audioHaptics';
import {
  sendBrowserNotification,
  requestNotificationPermission,
} from './utils/notifications';

import { Header } from './components/Header';
import { ActiveReminderBanner } from './components/ActiveReminderBanner';
import { HomeDashboard } from './components/HomeDashboard';
import { WaterView } from './components/WaterView';
import { ExerciseView } from './components/ExerciseView';
import { SleepView } from './components/SleepView';
import { MedicationView } from './components/MedicationView';
import { AboutModal } from './components/AboutModal';

import {
  Home,
  Droplets,
  Activity,
  Moon,
  Pill,
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Request browser notification permission once politely on first user interaction
  useEffect(() => {
    const handleFirstTouch = () => {
      requestNotificationPermission();
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
    window.addEventListener('click', handleFirstTouch);
    window.addEventListener('touchstart', handleFirstTouch);

    return () => {
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
  }, []);

  // Periodic reminder checking routine
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = getTodayDateString();

      // Check water reminder
      if (state.water.reminders.includes(timeStr)) {
        if (state.water.soundEnabled) playWaterDropSound();
        if (state.water.vibrateEnabled) triggerVibration([80, 50, 80]);
        sendBrowserNotification('💧 Hora de Beber Água!', {
          body: 'Mantenha seu corpo hidratado. Tome um copo de água agora!',
        });
      }

      // Check exercise reminder
      const dayOfWeek = now.getDay();
      if (
        state.exercise.targetDays.includes(dayOfWeek) &&
        state.exercise.reminderTime === timeStr &&
        !state.exercise.completedDates.includes(todayStr)
      ) {
        if (state.exercise.soundEnabled) playExerciseSound();
        if (state.exercise.vibrateEnabled) triggerVibration([100, 60, 100]);
        sendBrowserNotification('🏃 Hora de se mexer!', {
          body: 'Hora de se mexer! Vai fazer bem 💪',
        });
      }

      // Check sleep wind-down
      const [bedH, bedM] = state.sleep.targetBedtime.split(':').map(Number);
      let windMin = bedH * 60 + bedM - state.sleep.windDownNoticeMin;
      if (windMin < 0) windMin += 24 * 60;
      const windTimeStr = `${String(Math.floor(windMin / 60)).padStart(2, '0')}:${String(windMin % 60).padStart(2, '0')}`;

      if (windTimeStr === timeStr) {
        if (state.sleep.soundEnabled) playSleepSound();
        if (state.sleep.vibrateEnabled) triggerVibration([60, 40, 60]);
        sendBrowserNotification('😴 Hora de Desacelerar', {
          body: 'Faltam 30 minutos para dormir. Desligue as telas para descansar melhor!',
        });
      }

      // Check medication reminders
      state.medication.items.forEach((item) => {
        if (item.times.includes(timeStr)) {
          const alreadyTaken = state.medication.logs.some(
            (log) => log.medicationId === item.id && log.date === todayStr
          );
          if (!alreadyTaken) {
            if (state.medication.soundEnabled) playMedicationSound();
            if (state.medication.vibrateEnabled) triggerVibration([120, 60, 120]);
            sendBrowserNotification(`💊 Hora do Remédio: ${item.name}`, {
              body: `Dose: ${item.dosage}. ${item.note || 'Não se esqueça de confirmar que tomou!'}`,
            });
          }
        }
      });
    }, 45000); // Check every 45s

    return () => clearInterval(checkInterval);
  }, [state]);

  // Quick Action Handlers
  const handleDrinkWater = (amountMl: number) => {
    const today = getTodayDateString();
    const current = state.water.consumedByDate[today] || 0;
    setState((prev) => ({
      ...prev,
      water: {
        ...prev.water,
        consumedByDate: {
          ...prev.water.consumedByDate,
          [today]: current + amountMl,
        },
      },
    }));
  };

  const handleToggleExercise = () => {
    const today = getTodayDateString();
    const exists = state.exercise.completedDates.includes(today);
    setState((prev) => ({
      ...prev,
      exercise: {
        ...prev.exercise,
        completedDates: exists
          ? prev.exercise.completedDates.filter((d) => d !== today)
          : [...prev.exercise.completedDates, today],
      },
    }));
  };

  const handleQuickSleepRecord = (quality: 'bem' | 'mal') => {
    const today = getTodayDateString();
    setState((prev) => ({
      ...prev,
      sleep: {
        ...prev.sleep,
        records: {
          ...prev.sleep.records,
          [today]: {
            quality,
            bedTime: prev.sleep.targetBedtime,
            wakeTime: prev.sleep.targetWakeTime,
            recordedAt: Date.now(),
          },
        },
      },
    }));
  };

  const handleTakeMedication = (item: MedicationItem) => {
    const today = getTodayDateString();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (state.medication.soundEnabled) playCelebrationSound();
    if (state.medication.vibrateEnabled) triggerVibration([100, 50, 100]);

    const newLog = {
      id: `log-${Date.now()}`,
      medicationId: item.id,
      medicationName: item.name,
      dosage: item.dosage,
      date: today,
      time: timeStr,
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      medication: {
        ...prev.medication,
        logs: [newLog, ...prev.medication.logs],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Active Urgent Reminder Banner (if any item is overdue) */}
      <div className="max-w-xl mx-auto w-full">
        <ActiveReminderBanner
          state={state}
          onDrinkWater={handleDrinkWater}
          onCompleteExercise={handleToggleExercise}
          onTakeMedication={handleTakeMedication}
        />
      </div>

      {/* Main Screen Router */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-3 pb-24">
        {currentScreen === 'home' && (
          <HomeDashboard
            state={state}
            onNavigate={setCurrentScreen}
            onQuickDrink={handleDrinkWater}
            onToggleExercise={handleToggleExercise}
            onQuickSleepRecord={handleQuickSleepRecord}
            onQuickTakeMedication={handleTakeMedication}
          />
        )}

        {currentScreen === 'water' && (
          <WaterView
            water={state.water}
            onChange={(newWater: WaterData) =>
              setState((prev) => ({ ...prev, water: newWater }))
            }
          />
        )}

        {currentScreen === 'exercise' && (
          <ExerciseView
            exercise={state.exercise}
            onChange={(newExercise: ExerciseData) =>
              setState((prev) => ({ ...prev, exercise: newExercise }))
            }
          />
        )}

        {currentScreen === 'sleep' && (
          <SleepView
            sleep={state.sleep}
            onChange={(newSleep: SleepData) =>
              setState((prev) => ({ ...prev, sleep: newSleep }))
            }
          />
        )}

        {currentScreen === 'medication' && (
          <MedicationView
            medication={state.medication}
            onChange={(newMed: MedicationData) =>
              setState((prev) => ({ ...prev, medication: newMed }))
            }
            onTakeMedication={handleTakeMedication}
          />
        )}
      </main>

      {/* Bottom 1-Tap Navigation Bar for Easy Mobile Thumb Access */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
              currentScreen === 'home'
                ? 'text-sky-700 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">Início</span>
          </button>

          <button
            onClick={() => setCurrentScreen('water')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
              currentScreen === 'water'
                ? 'text-sky-700 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <Droplets className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">Água</span>
          </button>

          <button
            onClick={() => setCurrentScreen('exercise')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
              currentScreen === 'exercise'
                ? 'text-emerald-700 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">Exercício</span>
          </button>

          <button
            onClick={() => setCurrentScreen('sleep')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
              currentScreen === 'sleep'
                ? 'text-indigo-700 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <Moon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">Sono</span>
          </button>

          <button
            onClick={() => setCurrentScreen('medication')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
              currentScreen === 'medication'
                ? 'text-rose-700 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <Pill className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">Remédios</span>
          </button>
        </div>
      </nav>

      {/* Modal Sobre o App / Ajuda / Instalação */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        state={state}
        onStateImported={(importedState) => setState(importedState)}
      />
    </div>
  );
}
