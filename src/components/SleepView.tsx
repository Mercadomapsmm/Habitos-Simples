import React, { useState } from 'react';
import { SleepData, SleepQuality, SleepRecord } from '../types';
import {
  getTodayDateString,
  getLast7Days,
  getWeekdayShort,
} from '../utils/storage';
import {
  Moon,
  Sun,
  Bed,
  Sparkles,
  Volume2,
  Vibrate,
  Clock,
  CheckCircle2,
  Lightbulb,
  Smile,
  Frown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playSleepSound,
  playCelebrationSound,
  triggerVibration,
} from '../utils/audioHaptics';
import { sendBrowserNotification } from '../utils/notifications';

interface SleepViewProps {
  sleep: SleepData;
  onChange: (newSleep: SleepData) => void;
}

const SLEEP_TIPS = [
  'Desligue telas de celular e TV 20 minutos antes de dormir.',
  'Mantenha o quarto escuro, silencioso e fresco para relaxar.',
  'Evite café e bebidas com cafeína após as 16h.',
  'Tome um copo de água morna ou chá de camomila para desacelerar.',
  'Procure acordar no mesmo horário todos os dias, até no fim de semana.',
];

export const SleepView: React.FC<SleepViewProps> = ({ sleep, onChange }) => {
  const today = getTodayDateString();
  const todayRecord = sleep.records[today];
  const [tipIndex, setTipIndex] = useState(0);

  // Calculate wind-down time (e.g. 30 mins before targetBedtime)
  const calculateWindDownTime = (bedtimeStr: string, minutesBefore: number): string => {
    const [h, m] = bedtimeStr.split(':').map(Number);
    let totalMin = h * 60 + m - minutesBefore;
    if (totalMin < 0) totalMin += 24 * 60;
    const windH = Math.floor(totalMin / 60);
    const windM = totalMin % 60;
    return `${String(windH).padStart(2, '0')}:${String(windM).padStart(2, '0')}`;
  };

  const windDownTime = calculateWindDownTime(sleep.targetBedtime, sleep.windDownNoticeMin);

  // Calculate target hours
  const calculateSleepDuration = (bed: string, wake: string) => {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let diff = (wh * 60 + wm) - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  const targetDuration = calculateSleepDuration(sleep.targetBedtime, sleep.targetWakeTime);

  const handleRecordSleep = (quality: SleepQuality) => {
    const newRecord: SleepRecord = {
      quality,
      bedTime: sleep.targetBedtime,
      wakeTime: sleep.targetWakeTime,
      recordedAt: Date.now(),
    };

    if (sleep.soundEnabled) playSleepSound();
    if (sleep.vibrateEnabled) triggerVibration([80, 50, 80]);

    if (quality === 'bem') {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    }

    onChange({
      ...sleep,
      records: {
        ...sleep.records,
        [today]: newRecord,
      },
    });
  };

  const handleTestWindDown = () => {
    playSleepSound();
    triggerVibration([100, 50, 100]);
    sendBrowserNotification('😴 Hora de Desacelerar!', {
      body: 'Desligue telas 20 min antes de dormir. Prepare seu corpo para uma noite tranquila.',
    });
  };

  const last7Days = getLast7Days();

  return (
    <div className="space-y-5 pb-16">
      {/* Target Bedtime & Wake Time Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-700/50">
            Higiene do Sono
          </span>
          <span className="text-xs font-bold text-indigo-200">
            Meta: {targetDuration} de descanso
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
          Durma bem, acorde renovado
        </h2>

        {/* Schedule Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold mb-1">
              <Moon className="w-4 h-4" /> Horário de Dormir
            </div>
            <input
              type="time"
              value={sleep.targetBedtime}
              onChange={(e) => onChange({ ...sleep, targetBedtime: e.target.value })}
              className="w-full bg-transparent text-xl font-black text-white outline-none cursor-pointer"
            />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
              <Sun className="w-4 h-4" /> Horário de Acordar
            </div>
            <input
              type="time"
              value={sleep.targetWakeTime}
              onChange={(e) => onChange({ ...sleep, targetWakeTime: e.target.value })}
              className="w-full bg-transparent text-xl font-black text-white outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Wind-down alert badge */}
        <div className="mt-4 pt-3 border-t border-indigo-700/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-indigo-200 font-bold">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Aviso de Desaceleração:</span>
            <span className="text-amber-300 font-black">{windDownTime}</span>
            <span className="text-indigo-300 font-normal">(30 min antes)</span>
          </div>
        </div>
      </div>

      {/* Registro Rápido ao Acordar */}
      <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 shadow-xs">
        <h3 className="text-sm font-black text-slate-800 text-center">
          Como você dormiu essa noite?
        </h3>
        <p className="text-xs font-semibold text-slate-500 text-center mt-0.5">
          Registro rápido em 1 toque ao acordar:
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => handleRecordSleep('bem')}
            className={`py-4 px-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
              todayRecord?.quality === 'bem'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-2 ring-emerald-200'
                : 'bg-slate-50 border-slate-200 hover:border-emerald-300 text-slate-800'
            }`}
          >
            <span className="text-3xl">😊</span>
            <span className="font-black text-sm">Dormi bem!</span>
            <span className="text-[10px] font-bold text-emerald-700">Disposição total</span>
          </button>

          <button
            onClick={() => handleRecordSleep('mal')}
            className={`py-4 px-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
              todayRecord?.quality === 'mal'
                ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-2 ring-amber-200'
                : 'bg-slate-50 border-slate-200 hover:border-amber-300 text-slate-800'
            }`}
          >
            <span className="text-3xl">🥱</span>
            <span className="font-black text-sm">Dormi mal</span>
            <span className="text-[10px] font-bold text-amber-700">Cansaço / acordei</span>
          </button>
        </div>

        {todayRecord && (
          <div className="mt-3 text-center">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registrado hoje: {todayRecord.quality === 'bem' ? 'Dormiu bem 😊' : 'Dormiu mal 🥱'}
            </span>
          </div>
        )}
      </div>

      {/* Gráfico Simples dos Últimos 7 Dias */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <h3 className="text-sm font-black text-slate-800 mb-3">
          Qualidade do Sono nos Últimos 7 Dias
        </h3>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {last7Days.map((dStr) => {
            const rec = sleep.records[dStr];
            const isToday = dStr === today;

            return (
              <div
                key={dStr}
                className={`py-3 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  rec?.quality === 'bem'
                    ? 'bg-emerald-50 border-emerald-300'
                    : rec?.quality === 'mal'
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className={`text-[11px] font-black ${isToday ? 'text-indigo-700' : 'text-slate-600'}`}>
                  {getWeekdayShort(dStr)}
                </span>
                <span className="text-xl">
                  {rec?.quality === 'bem' ? '😊' : rec?.quality === 'mal' ? '🥱' : '—'}
                </span>
                <span className="text-[9px] font-bold text-slate-500">
                  {rec?.quality === 'bem' ? 'Bem' : rec?.quality === 'mal' ? 'Mal' : 'Sem reg.'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card de Dica Curta em Destaque */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 fill-amber-950" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-900">
              Dica de Ouro para o Sono
            </span>
          </div>

          <button
            onClick={() => setTipIndex((prev) => (prev + 1) % SLEEP_TIPS.length)}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
          >
            Outra dica
          </button>
        </div>

        <p className="text-sm font-black text-slate-800 mt-2.5">
          "{SLEEP_TIPS[tipIndex]}"
        </p>
      </div>

      {/* Configurações: Som e Vibração */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-800">
          Avisos e Desaceleração
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">Som de Desacelerar</p>
              <p className="text-xs text-slate-500">Tocar som calmo de sino 30 min antes</p>
            </div>
          </div>
          <button
            onClick={() => onChange({ ...sleep, soundEnabled: !sleep.soundEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              sleep.soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                sleep.soundEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">Vibração Suave</p>
              <p className="text-xs text-slate-500">Vibrar calmamente ao avisar</p>
            </div>
          </div>
          <button
            onClick={() => onChange({ ...sleep, vibrateEnabled: !sleep.vibrateEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              sleep.vibrateEnabled ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                sleep.vibrateEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleTestWindDown}
            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Testar Aviso de "Hora de Desacelerar" Agora
          </button>
        </div>
      </div>
    </div>
  );
};
