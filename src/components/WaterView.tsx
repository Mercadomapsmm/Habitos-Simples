import React, { useState } from 'react';
import { WaterData } from '../types';
import { getTodayDateString, getLast7Days, getWeekdayShort } from '../utils/storage';
import {
  Droplets,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Vibrate,
  RotateCcw,
  Sparkles,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playWaterDropSound,
  playCelebrationSound,
  triggerVibration,
} from '../utils/audioHaptics';
import { sendBrowserNotification } from '../utils/notifications';

interface WaterViewProps {
  water: WaterData;
  onChange: (newWater: WaterData) => void;
}

export const WaterView: React.FC<WaterViewProps> = ({ water, onChange }) => {
  const today = getTodayDateString();
  const consumedToday = water.consumedByDate[today] || 0;
  const goal = water.dailyGoalMl;
  const percent = Math.min(100, Math.round((consumedToday / goal) * 100));
  const isGoalReached = consumedToday >= goal;

  const [newReminderTime, setNewReminderTime] = useState('11:00');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [tempWeight, setTempWeight] = useState(water.weightKg.toString());
  const [customMl, setCustomMl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Drink water action
  const handleDrink = (amount: number) => {
    const updatedAmount = consumedToday + amount;
    const newConsumed = {
      ...water.consumedByDate,
      [today]: updatedAmount,
    };

    if (water.soundEnabled) playWaterDropSound();
    if (water.vibrateEnabled) triggerVibration(70);

    // If reaching goal right now
    if (updatedAmount >= goal && consumedToday < goal) {
      if (water.soundEnabled) {
        setTimeout(() => playCelebrationSound(), 180);
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      sendBrowserNotification('💧 Meta de Água Concluída!', {
        body: 'Parabéns! Você bebeu toda a água programada para hoje!',
      });
    }

    onChange({
      ...water,
      consumedByDate: newConsumed,
    });
  };

  const handleResetToday = () => {
    if (window.confirm('Deseja zerar o registro de água de hoje?')) {
      onChange({
        ...water,
        consumedByDate: {
          ...water.consumedByDate,
          [today]: 0,
        },
      });
    }
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(tempWeight);
    if (!isNaN(w) && w > 20 && w < 300) {
      // 35 ml per kg is the WHO standard hydration guideline
      const newGoal = Math.round(w * 35);
      onChange({
        ...water,
        weightKg: w,
        dailyGoalMl: newGoal,
      });
      setShowWeightModal(false);
    }
  };

  const handleAddReminder = () => {
    if (newReminderTime && !water.reminders.includes(newReminderTime)) {
      const sorted = [...water.reminders, newReminderTime].sort();
      onChange({
        ...water,
        reminders: sorted,
      });
    }
  };

  const handleRemoveReminder = (time: string) => {
    onChange({
      ...water,
      reminders: water.reminders.filter((t) => t !== time),
    });
  };

  const handleTestSound = () => {
    playWaterDropSound();
    triggerVibration([100, 50, 100]);
    sendBrowserNotification('💧 Teste de Lembrete de Água', {
      body: 'Hora de dar um gole! Mantenha seu corpo hidratado.',
    });
  };

  const last7Days = getLast7Days();

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner / Goal Info */}
      <div className="bg-white border border-sky-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black text-sky-800 uppercase tracking-wider bg-sky-100 px-2.5 py-1 rounded-full">
              Hidratação Diária
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1.5">
              Meta: {goal} ml
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              Baseado no seu peso de {water.weightKg} kg (35 ml / kg)
            </p>
          </div>
          <button
            onClick={() => setShowWeightModal(true)}
            className="text-xs font-black text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            Alterar Peso
          </button>
        </div>

        {/* Big Visual Progress Indicator */}
        <div className="mt-6 flex flex-col items-center">
          <div className="relative w-48 h-48 rounded-full bg-sky-50 border-4 border-sky-200 flex flex-col items-center justify-center overflow-hidden shadow-inner">
            {/* Water Fill Effect */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-500 to-sky-400 transition-all duration-700 ease-out"
              style={{ height: `${percent}%` }}
            />
            
            {/* Overlay Text */}
            <div className="relative z-10 text-center">
              <Droplets className={`w-8 h-8 mx-auto mb-1 transition-colors ${percent > 55 ? 'text-white' : 'text-sky-500'}`} />
              <div className={`text-3xl font-black tracking-tight ${percent > 55 ? 'text-white' : 'text-slate-800'}`}>
                {consumedToday}
                <span className="text-base font-bold ml-0.5">ml</span>
              </div>
              <div className={`text-xs font-black ${percent > 55 ? 'text-sky-100' : 'text-sky-600'}`}>
                {percent}% concluído
              </div>
            </div>
          </div>

          {/* Goal reached congratulation banner */}
          {isGoalReached && (
            <div className="mt-4 w-full bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-center animate-in fade-in zoom-in-95">
              <p className="text-sm font-black text-emerald-800 flex items-center justify-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                Parabéns! Meta diária concluída! 🎉
              </p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">
                Você cuidou da sua saúde hoje com sucesso. Continue assim amanhã!
              </p>
            </div>
          )}
        </div>

        {/* Big Action Drink Buttons */}
        <div className="mt-6">
          <p className="text-center text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
            Toque para registrar o que você bebeu:
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleDrink(200)}
              className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white py-3.5 px-2 rounded-2xl font-black text-sm shadow-sm flex flex-col items-center justify-center transition cursor-pointer"
            >
              <span className="text-lg">🥤</span>
              <span>+200 ml</span>
              <span className="text-[10px] font-semibold text-sky-100">Copo pequeno</span>
            </button>

            <button
              onClick={() => handleDrink(300)}
              className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white py-3.5 px-2 rounded-2xl font-black text-sm shadow-sm flex flex-col items-center justify-center transition cursor-pointer"
            >
              <span className="text-lg">🥛</span>
              <span>+300 ml</span>
              <span className="text-[10px] font-semibold text-sky-100">Copo grande</span>
            </button>

            <button
              onClick={() => handleDrink(500)}
              className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white py-3.5 px-2 rounded-2xl font-black text-sm shadow-sm flex flex-col items-center justify-center transition cursor-pointer"
            >
              <span className="text-lg">🍶</span>
              <span>+500 ml</span>
              <span className="text-[10px] font-semibold text-sky-100">Garrafinha</span>
            </button>
          </div>

          {/* Custom amount or Reset */}
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-600">
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-sky-700 hover:text-sky-900 underline py-1"
            >
              {showCustomInput ? 'Fechar valor personalizado' : '+ Outro volume (ml)'}
            </button>

            {consumedToday > 0 && (
              <button
                onClick={handleResetToday}
                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Zerar hoje
              </button>
            )}
          </div>

          {showCustomInput && (
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                placeholder="Ex: 250"
                value={customMl}
                onChange={(e) => setCustomMl(e.target.value)}
                className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
              />
              <button
                onClick={() => {
                  const val = parseInt(customMl, 10);
                  if (val > 0) {
                    handleDrink(val);
                    setCustomMl('');
                    setShowCustomInput(false);
                  }
                }}
                className="bg-sky-500 text-white font-black text-xs px-4 py-2 rounded-xl"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 7-day intake history chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <h3 className="text-sm font-black text-slate-800 mb-3">
          Histórico dos Últimos 7 Dias
        </h3>
        <div className="flex items-end justify-between gap-1.5 h-28 pt-2">
          {last7Days.map((dStr) => {
            const amount = water.consumedByDate[dStr] || 0;
            const barHeightPercent = Math.min(100, Math.round((amount / goal) * 100));
            const isToday = dStr === today;
            const hit = amount >= goal;

            return (
              <div key={dStr} className="flex-1 flex flex-col items-center h-full justify-end">
                <span className="text-[10px] font-bold text-slate-500 mb-1">
                  {amount > 0 ? (amount >= 1000 ? `${(amount / 1000).toFixed(1)}L` : `${amount}`) : '0'}
                </span>
                <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg h-20 flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      hit
                        ? 'bg-emerald-500'
                        : isToday
                        ? 'bg-sky-500'
                        : amount > 0
                        ? 'bg-sky-300'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${barHeightPercent}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] font-black mt-1.5 ${
                    isToday ? 'text-sky-700 font-black' : 'text-slate-600'
                  }`}
                >
                  {getWeekdayShort(dStr)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Horários dos Lembretes */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" /> Horários dos Lembretes
            </h3>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              Defina os momentos do dia para o app te avisar
            </p>
          </div>
        </div>

        {/* Reminders List */}
        <div className="flex flex-wrap gap-2">
          {water.reminders.map((timeStr) => (
            <div
              key={timeStr}
              className="bg-sky-50 border border-sky-200 text-sky-900 rounded-xl px-3 py-1.5 text-xs font-black flex items-center gap-2"
            >
              <span>{timeStr}</span>
              <button
                onClick={() => handleRemoveReminder(timeStr)}
                className="text-sky-600 hover:text-rose-600 p-0.5"
                title="Remover horário"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Reminder */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <input
            type="time"
            value={newReminderTime}
            onChange={(e) => setNewReminderTime(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
          />
          <button
            onClick={handleAddReminder}
            className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-black px-3.5 py-2.5 rounded-xl flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Adicionar Horário
          </button>
        </div>
      </div>

      {/* Configurações: Som e Vibração */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-800">
          Avisos e Notificações
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-sky-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">Som do Aviso</p>
              <p className="text-xs text-slate-500">Tocar som suave de gota ao lembrar</p>
            </div>
          </div>
          <button
            onClick={() => onChange({ ...water, soundEnabled: !water.soundEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              water.soundEnabled ? 'bg-sky-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                water.soundEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-5 h-5 text-sky-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">Vibração</p>
              <p className="text-xs text-slate-500">Vibrar o aparelho no momento do aviso</p>
            </div>
          </div>
          <button
            onClick={() => onChange({ ...water, vibrateEnabled: !water.vibrateEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              water.vibrateEnabled ? 'bg-sky-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                water.vibrateEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleTestSound}
            className="w-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-black py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Testar Aviso Sonoro e Vibração Agora
          </button>
        </div>
      </div>

      {/* Modal Alterar Peso */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-lg font-black text-slate-800">
              Calcular Meta por Peso
            </h3>
            <p className="text-xs font-bold text-slate-600">
              A recomendação padrão de saúde é ingerir 35 ml de água para cada 1 kg de peso corporal por dia.
            </p>

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Seu peso atual (kg):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={tempWeight}
                  onChange={(e) => setTempWeight(e.target.value)}
                  className="w-full border-2 border-sky-200 focus:border-sky-500 rounded-xl p-3 text-lg font-black text-slate-800 outline-none"
                  autoFocus
                />
                <p className="text-xs font-bold text-sky-700 mt-1">
                  Meta calculada: {Math.round((parseFloat(tempWeight) || 0) * 35)} ml por dia
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 text-white font-black text-xs py-3 rounded-xl hover:bg-sky-700 shadow-sm"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
