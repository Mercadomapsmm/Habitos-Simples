import React from 'react';
import { AppState, ScreenType, MedicationItem } from '../types';
import {
  getTodayDateString,
  getFormattedDatePtBR,
  calculateExerciseStreak,
} from '../utils/storage';
import {
  Droplets,
  Activity,
  Moon,
  Pill,
  CheckCircle2,
  ChevronRight,
  Flame,
  Plus,
  Smile,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playWaterDropSound,
  playExerciseSound,
  playCelebrationSound,
  playSleepSound,
  triggerVibration,
} from '../utils/audioHaptics';

interface HomeDashboardProps {
  state: AppState;
  onNavigate: (screen: ScreenType) => void;
  onQuickDrink: (amountMl: number) => void;
  onToggleExercise: () => void;
  onQuickSleepRecord: (quality: 'bem' | 'mal') => void;
  onQuickTakeMedication: (med: MedicationItem) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  state,
  onNavigate,
  onQuickDrink,
  onToggleExercise,
  onQuickSleepRecord,
  onQuickTakeMedication,
}) => {
  const today = getTodayDateString();

  // Water calculations
  const waterConsumed = state.water.consumedByDate[today] || 0;
  const waterGoal = state.water.dailyGoalMl;
  const waterPercent = Math.min(100, Math.round((waterConsumed / waterGoal) * 100));
  const waterGoalReached = waterConsumed >= waterGoal;

  // Exercise calculations
  const isExerciseDoneToday = state.exercise.completedDates.includes(today);
  const exerciseStreak = calculateExerciseStreak(state.exercise.completedDates);

  // Sleep calculations
  const todaySleepRecord = state.sleep.records[today];

  // Medication calculations
  const pendingMeds = state.medication.items.filter((item) => {
    return !state.medication.logs.some(
      (log) => log.medicationId === item.id && log.date === today
    );
  });
  const allMedsTakenToday = state.medication.items.length > 0 && pendingMeds.length === 0;

  // Total daily habits completed (out of 4)
  let completedCount = 0;
  if (waterGoalReached) completedCount++;
  if (isExerciseDoneToday) completedCount++;
  if (todaySleepRecord) completedCount++;
  if (allMedsTakenToday || state.medication.items.length === 0) completedCount++;

  const handleQuickWaterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state.water.soundEnabled) playWaterDropSound();
    if (state.water.vibrateEnabled) triggerVibration(60);
    onQuickDrink(250);

    if (waterConsumed + 250 >= waterGoal && !waterGoalReached) {
      if (state.water.soundEnabled) playCelebrationSound();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleQuickExerciseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExerciseDoneToday) {
      if (state.exercise.soundEnabled) playExerciseSound();
      if (state.exercise.vibrateEnabled) triggerVibration([80, 50, 100]);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    }
    onToggleExercise();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Friendly Date & Motivational Summary Banner */}
      <div className="bg-gradient-to-br from-white to-sky-50/60 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100/80 px-2.5 py-1 rounded-full">
                {getFormattedDatePtBR()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-2">
              Olá! Como estão seus hábitos hoje?
            </h2>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              {completedCount === 4
                ? '🎉 Incrível! Você completou todos os 4 hábitos hoje!'
                : completedCount === 0
                ? 'Comece dando um primeiro passo. Seu corpo agradece!'
                : `Você já completou ${completedCount} de 4 hábitos do dia. Continue assim!`}
            </p>
          </div>
          <img
            src="/icon.svg"
            alt="Logotipo Hábitos Simples"
            className="w-14 h-14 rounded-2xl shadow-sm border border-slate-100 object-contain shrink-0 hidden sm:block"
          />
        </div>

        {/* Overall progress indicator bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span>Progresso do Dia</span>
            <span className="text-sky-700">{completedCount} de 4 concluídos</span>
          </div>
          <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden flex gap-1 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                waterGoalReached ? 'bg-sky-500' : 'bg-slate-300'
              }`}
              style={{ width: '25%' }}
              title="Água"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExerciseDoneToday ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              style={{ width: '25%' }}
              title="Exercício"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                todaySleepRecord ? 'bg-indigo-500' : 'bg-slate-300'
              }`}
              style={{ width: '25%' }}
              title="Sono"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allMedsTakenToday ? 'bg-rose-500' : 'bg-slate-300'
              }`}
              style={{ width: '25%' }}
              title="Remédios"
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          THE 4 MAIN HABIT BUTTONS (GRANDES, CLAROS E ROBUSTOS)
          ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* 1️⃣ 💧 ÁGUA */}
        <div
          onClick={() => onNavigate('water')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('water')}
          className="group relative bg-white hover:bg-sky-50/50 border-2 border-sky-200 hover:border-sky-400 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Droplets className="w-8 h-8 fill-sky-200 stroke-white" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  1️⃣ Água
                </span>
                <span className="text-xs font-extrabold text-sky-600 mt-1">
                  {waterPercent}% da meta
                </span>
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-800 group-hover:text-sky-900 transition-colors">
              Lembrete de Água
            </h3>
            
            <p className="text-sm font-bold text-slate-600 mt-0.5">
              {waterConsumed} / {waterGoal} ml
            </p>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden p-0.5 border border-sky-100">
              <div
                className="bg-gradient-to-r from-sky-400 to-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={handleQuickWaterClick}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-black text-xs py-2 px-3 rounded-xl shadow-xs transition"
              title="Registrar um copo de 250ml agora"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              +250 ml (Já bebi!)
            </button>
            <span className="text-xs font-bold text-sky-700 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              Ver horários <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* 2️⃣ 🏃 EXERCÍCIO */}
        <div
          onClick={() => onNavigate('exercise')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('exercise')}
          className="group relative bg-white hover:bg-emerald-50/50 border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-8 h-8 stroke-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  2️⃣ Exercício
                </span>
                {exerciseStreak > 0 && (
                  <span className="text-xs font-black text-amber-600 flex items-center gap-0.5 mt-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500 animate-bounce" />
                    {exerciseStreak} {exerciseStreak === 1 ? 'dia' : 'dias'}
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-800 group-hover:text-emerald-900 transition-colors capitalize">
              {state.exercise.type === 'outro' ? state.exercise.customType || 'Exercício' : state.exercise.type}
            </h3>

            <p className="text-sm font-bold text-slate-600 mt-0.5">
              Lembrete às {state.exercise.reminderTime}
            </p>

            <div className="mt-3">
              {isExerciseDoneToday ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Feito hoje! Parabéns 💪
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  <span>⏱️</span> Pendente hoje
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={handleQuickExerciseClick}
              className={`flex items-center gap-1.5 font-black text-xs py-2 px-3 rounded-xl shadow-xs transition active:scale-95 ${
                isExerciseDoneToday
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              {isExerciseDoneToday ? 'Feito hoje ✓' : 'Fiz hoje! 💪'}
            </button>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              Configurar <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* 3️⃣ 😴 SONO */}
        <div
          onClick={() => onNavigate('sleep')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('sleep')}
          className="group relative bg-white hover:bg-indigo-50/50 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Moon className="w-8 h-8 fill-indigo-200 stroke-white" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  3️⃣ Sono
                </span>
                <span className="text-xs font-extrabold text-indigo-600 mt-1">
                  Meta: {state.sleep.targetBedtime}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-900 transition-colors">
              Hábito de Sono
            </h3>

            <p className="text-sm font-bold text-slate-600 mt-0.5">
              Dormir {state.sleep.targetBedtime} • Acordar {state.sleep.targetWakeTime}
            </p>

            <div className="mt-3">
              {todaySleepRecord ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black">
                  <span>{todaySleepRecord.quality === 'bem' ? '😊 Dormiu bem' : '🥱 Dormiu mal'}</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-500">
                  Como acordou hoje? Toque para registrar.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {!todaySleepRecord ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    if (state.sleep.soundEnabled) playSleepSound();
                    onQuickSleepRecord('bem');
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold py-1.5 px-2.5 rounded-lg active:scale-95 transition"
                >
                  😊 Dormi bem
                </button>
                <button
                  onClick={() => {
                    onQuickSleepRecord('mal');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-2.5 rounded-lg active:scale-95 transition"
                >
                  🥱 Mal
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-indigo-700">Registrado hoje</span>
            )}
            <span className="text-xs font-bold text-indigo-700 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform ml-auto">
              Gráfico <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* 4️⃣ 💊 REMÉDIOS */}
        <div
          onClick={() => onNavigate('medication')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('medication')}
          className="group relative bg-white hover:bg-rose-50/50 border-2 border-rose-200 hover:border-rose-400 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <Pill className="w-8 h-8 stroke-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  4️⃣ Remédios
                </span>
                <span className="text-xs font-extrabold text-rose-600 mt-1">
                  {state.medication.items.length} cadastrados
                </span>
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-800 group-hover:text-rose-900 transition-colors">
              Lembrete de Remédio
            </h3>

            <p className="text-sm font-bold text-slate-600 mt-0.5">
              {pendingMeds.length === 0
                ? 'Todos tomados hoje! ✅'
                : `${pendingMeds.length} ${pendingMeds.length === 1 ? 'pendente' : 'pendentes'} hoje`}
            </p>

            <div className="mt-3">
              {pendingMeds.length > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black animate-pulse">
                  <span>🔔</span> {pendingMeds[0].name} ({pendingMeds[0].times[0] || 'Hoje'})
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Em dia hoje!
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {pendingMeds.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickTakeMedication(pendingMeds[0]);
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black py-2 px-3 rounded-xl shadow-xs active:scale-95 transition"
                title={`Confirmar que tomou ${pendingMeds[0].name}`}
              >
                Tomei {pendingMeds[0].name} ✓
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-500">Histórico de 7 dias</span>
            )}
            <span className="text-xs font-bold text-rose-700 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform ml-auto">
              Gerenciar <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>

      </div>

      {/* Quick reassurance card at bottom */}
      <div className="bg-slate-100/90 rounded-2xl p-4 text-center text-slate-600 border border-slate-200/80">
        <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Seus dados nunca saem do seu celular. Tudo salvo localmente e sem anúncios.
        </p>
      </div>
    </div>
  );
};
