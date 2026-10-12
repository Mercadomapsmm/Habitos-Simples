import React from 'react';
import { AppState, MedicationItem } from '../types';
import { getTodayDateString } from '../utils/storage';
import { Bell, Check, Droplets, Pill, Activity, Moon, X } from 'lucide-react';
import { playCelebrationSound, playWaterDropSound, triggerVibration } from '../utils/audioHaptics';

interface ActiveReminderBannerProps {
  state: AppState;
  onDrinkWater: (amountMl: number) => void;
  onCompleteExercise: () => void;
  onTakeMedication: (med: MedicationItem) => void;
}

export const ActiveReminderBanner: React.FC<ActiveReminderBannerProps> = ({
  state,
  onDrinkWater,
  onCompleteExercise,
  onTakeMedication,
}) => {
  const [dismissedKey, setDismissedKey] = React.useState<string | null>(null);
  const today = getTodayDateString();

  // Find any pending medication that was scheduled for today and hasn't been taken
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeNumber = currentHour * 60 + currentMinutes;

  // 1. Pending medication check
  const pendingMed = state.medication.items.find((item) => {
    // Check if taken today already
    const takenToday = state.medication.logs.some(
      (log) => log.medicationId === item.id && log.date === today
    );
    if (takenToday) return false;

    // Check if scheduled time has passed or is within 15 min
    return item.times.some((timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      const targetTimeNum = h * 60 + m;
      return currentTimeNumber >= targetTimeNum - 5;
    });
  });

  // 2. Water check if consumed is less than 50% and afternoon
  const waterConsumed = state.water.consumedByDate[today] || 0;
  const waterGoal = state.water.dailyGoalMl;
  const isAfternoon = currentHour >= 14;
  const needsWaterPrompt = waterConsumed < waterGoal && (isAfternoon || waterConsumed === 0);

  // 3. Exercise check if planned for today and not completed
  const currentDayOfWeek = now.getDay();
  const isExercisePlannedToday = state.exercise.targetDays.includes(currentDayOfWeek);
  const isExerciseDoneToday = state.exercise.completedDates.includes(today);
  const [exH, exM] = state.exercise.reminderTime.split(':').map(Number);
  const exerciseTimeNum = exH * 60 + exM;
  const isExerciseDue = isExercisePlannedToday && !isExerciseDoneToday && currentTimeNumber >= exerciseTimeNum;

  if (pendingMed && dismissedKey !== `med-${pendingMed.id}`) {
    return (
      <div className="bg-rose-50 border-l-4 border-rose-500 p-3.5 mx-4 mt-3 rounded-r-xl shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                  Lembrete de Remédio
                </span>
                <span className="text-xs text-rose-600 font-medium">Agora</span>
              </div>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                Hora de tomar: <span className="text-rose-700">{pendingMed.name}</span> ({pendingMed.dosage})
              </p>
              {pendingMed.note && (
                <p className="text-xs text-slate-600 mt-0.5">💡 {pendingMed.note}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissedKey(`med-${pendingMed.id}`)}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Fechar aviso temporariamente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2.5 flex items-center gap-2 pl-10">
          <button
            onClick={() => onTakeMedication(pendingMed)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-xs transition"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Confirmar: Já tomei!
          </button>
          <button
            onClick={() => setDismissedKey(`med-${pendingMed.id}`)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-800 py-1.5 px-2.5 rounded-lg hover:bg-rose-100/50"
          >
            Lembrar depois
          </button>
        </div>
      </div>
    );
  }

  if (isExerciseDue && dismissedKey !== 'exercise-due') {
    return (
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 mx-4 mt-3 rounded-r-xl shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Hora de se Mexer! 💪
              </span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                Lembrete de {state.exercise.type}: Vai fazer bem para seu corpo e mente!
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissedKey('exercise-due')}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2.5 flex items-center gap-2 pl-10">
          <button
            onClick={onCompleteExercise}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-xs transition"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Fiz hoje!
          </button>
          <button
            onClick={() => setDismissedKey('exercise-due')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-800 py-1.5 px-2.5 rounded-lg hover:bg-emerald-100/50"
          >
            Fazer mais tarde
          </button>
        </div>
      </div>
    );
  }

  return null;
};
