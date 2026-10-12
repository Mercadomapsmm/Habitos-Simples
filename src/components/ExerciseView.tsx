import React, { useState } from 'react';
import { ExerciseData, ExerciseType } from '../types';
import {
  getTodayDateString,
  getLast7Days,
  getWeekdayShort,
  calculateExerciseStreak,
} from '../utils/storage';
import {
  Activity,
  Flame,
  CheckCircle2,
  Volume2,
  Vibrate,
  Calendar,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playExerciseSound,
  playCelebrationSound,
  triggerVibration,
} from '../utils/audioHaptics';
import { sendBrowserNotification } from '../utils/notifications';

interface ExerciseViewProps {
  exercise: ExerciseData;
  onChange: (newExercise: ExerciseData) => void;
}

const EXERCISE_OPTIONS: { id: ExerciseType; label: string; icon: string }[] = [
  { id: 'caminhada', label: 'Caminhada', icon: '🚶‍♂️' },
  { id: 'alongamento', label: 'Alongamento', icon: '🧘‍♀️' },
  { id: 'academia', label: 'Academia', icon: '🏋️‍♂️' },
  { id: 'corrida', label: 'Corrida', icon: '🏃‍♂️' },
  { id: 'outro', label: 'Outro', icon: '⚽' },
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
  { id: 0, label: 'Dom' },
];

export const ExerciseView: React.FC<ExerciseViewProps> = ({
  exercise,
  onChange,
}) => {
  const today = getTodayDateString();
  const isDoneToday = exercise.completedDates.includes(today);
  const streak = calculateExerciseStreak(exercise.completedDates);

  const [customName, setCustomName] = useState(exercise.customType || '');

  const handleToggleToday = () => {
    let updatedDates: string[];
    if (isDoneToday) {
      // Uncheck if clicked by accident
      updatedDates = exercise.completedDates.filter((d) => d !== today);
    } else {
      updatedDates = [...exercise.completedDates, today];
      if (exercise.soundEnabled) playExerciseSound();
      if (exercise.vibrateEnabled) triggerVibration([100, 50, 100]);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
      });
      sendBrowserNotification('🏃 Exercício Concluído!', {
        body: 'Parabéns por se exercitar hoje! Você está de parabéns 💪',
      });
    }

    onChange({
      ...exercise,
      completedDates: updatedDates,
    });
  };

  const handleSelectType = (type: ExerciseType) => {
    onChange({
      ...exercise,
      type,
    });
  };

  const handleToggleDay = (dayId: number) => {
    const exists = exercise.targetDays.includes(dayId);
    let newDays: number[];
    if (exists) {
      if (exercise.targetDays.length === 1) return; // Keep at least 1 day
      newDays = exercise.targetDays.filter((d) => d !== dayId);
    } else {
      newDays = [...exercise.targetDays, dayId].sort();
    }
    onChange({
      ...exercise,
      targetDays: newDays,
    });
  };

  const handleTestNotice = () => {
    playExerciseSound();
    triggerVibration([80, 40, 80]);
    sendBrowserNotification('🏃 Hora de se mexer!', {
      body: 'Hora de se mexer! Vai fazer bem para o seu dia 💪',
    });
  };

  const last7Days = getLast7Days();

  return (
    <div className="space-y-5 pb-16">
      {/* Motivational Notice Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-md shadow-emerald-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
            Lembrete de Saúde Física
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Hora de se mexer! Vai fazer bem 💪
        </h2>
        <p className="text-xs font-semibold text-emerald-100 mt-1">
          Mesmo 15 minutos de atividade leve já melhoram a circulação, humor e sono.
        </p>

        {/* Streak Highlight */}
        <div className="mt-4 pt-3 border-t border-emerald-400/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Flame className="w-6 h-6 text-amber-300 fill-amber-300 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-100">Sequência Atual</p>
              <p className="text-lg font-black text-white leading-tight">
                {streak} {streak === 1 ? 'dia consecutivo' : 'dias consecutivos'}
              </p>
            </div>
          </div>

          {streak >= 3 && (
            <div className="flex items-center gap-1 bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-1 rounded-full shadow-xs">
              <Trophy className="w-3.5 h-3.5" />
              Ritmo Forte!
            </div>
          )}
        </div>
      </div>

      {/* Big Action Button "Fiz hoje!" */}
      <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 text-center shadow-xs">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
          Atividade de Hoje
        </h3>

        <div className="mb-4">
          <p className="text-2xl font-black text-slate-800 capitalize">
            {exercise.type === 'outro' ? exercise.customType || 'Atividade Física' : exercise.type}
          </p>
          <p className="text-xs font-bold text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" /> Horário programado: {exercise.reminderTime}
          </p>
        </div>

        <button
          onClick={handleToggleToday}
          className={`w-full max-w-sm mx-auto py-5 px-6 rounded-2xl font-black text-base shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 ${
            isDoneToday
              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-2 border-emerald-400'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
          }`}
        >
          <CheckCircle2 className={`w-7 h-7 stroke-[2.5] ${isDoneToday ? 'text-emerald-700' : 'text-white'}`} />
          <span>{isDoneToday ? 'Concluído hoje! Parabéns ✓' : 'Fiz hoje! 💪'}</span>
        </button>

        {isDoneToday && (
          <p className="text-xs font-bold text-slate-500 mt-2">
            Toque novamente caso queira desmarcar.
          </p>
        )}
      </div>

      {/* Escolha de Tipo de Exercício */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-800">
          Escolha seu tipo de exercício:
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EXERCISE_OPTIONS.map((opt) => {
            const isSelected = exercise.type === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectType(opt.id)}
                className={`p-3 rounded-2xl font-bold text-xs flex items-center gap-2 border-2 transition active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-black'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {exercise.type === 'outro' && (
          <div className="pt-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nome do seu exercício:
            </label>
            <input
              type="text"
              placeholder="Ex: Dança, Natação, Pilates, Ciclismo"
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                onChange({ ...exercise, customType: e.target.value });
              }}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
            />
          </div>
        )}
      </div>

      {/* Dias da Semana e Horário do Lembrete */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" /> Dias para Lembrar
          </h3>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            Selecione em quais dias você pretende se exercitar:
          </p>
        </div>

        <div className="flex justify-between gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const active = exercise.targetDays.includes(day.id);
            return (
              <button
                key={day.id}
                onClick={() => handleToggleDay(day.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  active
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        {/* Reminder Time */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">Horário do Aviso</p>
              <p className="text-xs text-slate-500">Hora que o app deve te lembrar</p>
            </div>
          </div>
          <input
            type="time"
            value={exercise.reminderTime}
            onChange={(e) => onChange({ ...exercise, reminderTime: e.target.value })}
            className="border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-sm font-black text-slate-800 outline-none"
          />
        </div>
      </div>

      {/* Histórico dos Últimos 7 Dias */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <h3 className="text-sm font-black text-slate-800 mb-3">
          Histórico dos Últimos 7 Dias
        </h3>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {last7Days.map((dStr) => {
            const done = exercise.completedDates.includes(dStr);
            const isToday = dStr === today;
            return (
              <div
                key={dStr}
                className={`py-3 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1 ${
                  done
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span className={`text-[11px] font-black ${isToday ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {getWeekdayShort(dStr)}
                </span>
                <span className="text-base">{done ? '✅' : '⚪'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configurações: Som e Vibração */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-800">
          Avisos e Sons
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">Som do Lembrete</p>
              <p className="text-xs text-slate-500">Tocar toque animador</p>
            </div>
          </div>
          <button
            onClick={() => onChange({ ...exercise, soundEnabled: !exercise.soundEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              exercise.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                exercise.soundEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">Vibração</p>
              <p className="text-xs text-slate-500">Vibrar ao lembrar</p>
            </div>
          </div>
          <button
            onClick={() => onChange({ ...exercise, vibrateEnabled: !exercise.vibrateEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              exercise.vibrateEnabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                exercise.vibrateEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleTestNotice}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Testar Aviso de Exercício Agora
          </button>
        </div>
      </div>
    </div>
  );
};
