import React, { useState } from 'react';
import {
  MedicationData,
  MedicationItem,
  MedicationFrequency,
  TakenMedicationLog,
} from '../types';
import {
  getTodayDateString,
  getLast7Days,
  getWeekdayShort,
} from '../utils/storage';
import {
  Pill,
  Plus,
  Check,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  Volume2,
  Vibrate,
  Calendar,
  Sparkles,
  Info,
  X,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playMedicationSound,
  playCelebrationSound,
  triggerVibration,
} from '../utils/audioHaptics';
import { sendBrowserNotification } from '../utils/notifications';

interface MedicationViewProps {
  medication: MedicationData;
  onChange: (newMed: MedicationData) => void;
  onTakeMedication: (item: MedicationItem) => void;
}

const COLOR_OPTIONS = ['rose', 'sky', 'emerald', 'amber', 'purple'];

export const MedicationView: React.FC<MedicationViewProps> = ({
  medication,
  onChange,
  onTakeMedication,
}) => {
  const today = getTodayDateString();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicationItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<MedicationFrequency>('diario');
  const [timesString, setTimesString] = useState('08:00');
  const [note, setNote] = useState('');
  const [color, setColor] = useState('rose');
  const [intervalHours, setIntervalHours] = useState('8');

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setDosage('');
    setFrequency('diario');
    setTimesString('08:00');
    setNote('');
    setColor('rose');
    setIntervalHours('8');
    setShowModal(true);
  };

  const openEditModal = (item: MedicationItem) => {
    setEditingItem(item);
    setName(item.name);
    setDosage(item.dosage);
    setFrequency(item.frequency);
    setTimesString(item.times.join(', '));
    setNote(item.note);
    setColor(item.color || 'rose');
    setIntervalHours(item.intervalHours?.toString() || '8');
    setShowModal(true);
  };

  const handleDeleteMedication = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lembrete de remédio?')) {
      onChange({
        ...medication,
        items: medication.items.filter((m) => m.id !== id),
        logs: medication.logs.filter((l) => l.medicationId !== id),
      });
    }
  };

  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Parse times
    const times = timesString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t));

    const finalTimes = times.length > 0 ? times : ['08:00'];

    if (editingItem) {
      // Edit existing
      const updated = medication.items.map((m) =>
        m.id === editingItem.id
          ? {
              ...m,
              name: name.trim(),
              dosage: dosage.trim() || '1 dose',
              frequency,
              times: finalTimes,
              note: note.trim(),
              color,
              intervalHours: frequency === 'intervalo_horas' ? parseInt(intervalHours, 10) : undefined,
            }
          : m
      );
      onChange({ ...medication, items: updated });
    } else {
      // Create new
      const newItem: MedicationItem = {
        id: `med-${Date.now()}`,
        name: name.trim(),
        dosage: dosage.trim() || '1 dose',
        frequency,
        times: finalTimes,
        note: note.trim(),
        color,
        intervalHours: frequency === 'intervalo_horas' ? parseInt(intervalHours, 10) : undefined,
        createdAt: Date.now(),
      };
      onChange({ ...medication, items: [...medication.items, newItem] });
    }

    setShowModal(false);
  };

  const handleConfirmTaken = (item: MedicationItem) => {
    onTakeMedication(item);
  };

  const handleTestAlert = () => {
    playMedicationSound();
    triggerVibration([120, 60, 120]);
    sendBrowserNotification('💊 Lembrete de Remédio', {
      body: 'Hora de tomar sua medicação! Não se esqueça.',
    });
  };

  const last7Days = getLast7Days();

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner & Add Button */}
      <div className="bg-white border border-rose-200 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full">
            Controle de Medicamentos
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1.5">
            Seus Remédios
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            Lembretes pontuais para você nunca esquecer uma dose.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-sm transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Remédio</span>
        </button>
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        {medication.items.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">
              Nenhum remédio cadastrado
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              Cadastre seu primeiro remédio, dosagem e horário para receber avisos.
            </p>
            <button
              onClick={openAddModal}
              className="bg-rose-500 text-white font-black text-xs py-2 px-4 rounded-xl"
            >
              + Adicionar Remédio Agora
            </button>
          </div>
        ) : (
          medication.items.map((item) => {
            const takenToday = medication.logs.some(
              (log) => log.medicationId === item.id && log.date === today
            );

            return (
              <div
                key={item.id}
                className={`bg-white border-2 rounded-3xl p-5 shadow-xs transition-all ${
                  takenToday
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                        item.color === 'emerald'
                          ? 'bg-emerald-500'
                          : item.color === 'sky'
                          ? 'bg-sky-500'
                          : item.color === 'amber'
                          ? 'bg-amber-500'
                          : item.color === 'purple'
                          ? 'bg-purple-500'
                          : 'bg-rose-500'
                      }`}
                    >
                      <Pill className="w-6 h-6 stroke-[2.5]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-800">
                          {item.name}
                        </h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.dosage}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3.5 h-3.5 text-rose-600" />
                          {item.times.join(' • ')}
                        </span>

                        <span className="text-slate-400">•</span>
                        <span className="capitalize">
                          {item.frequency === 'diario'
                            ? 'Diário'
                            : item.frequency === 'intervalo_horas'
                            ? `A cada ${item.intervalHours}h`
                            : 'Dias específicos'}
                        </span>
                      </div>

                      {item.note && (
                        <p className="text-xs font-semibold text-slate-500 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          💡 <span className="font-bold text-slate-700">Observação:</span> {item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                      title="Editar remédio"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedication(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Excluir remédio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {takenToday ? (
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                      <Check className="w-4 h-4 stroke-[3]" />
                      Já tomei hoje! Dose confirmada
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConfirmTaken(item)}
                      className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs py-2 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      Confirmar que tomei agora
                    </button>
                  )}

                  <span className="text-[11px] font-bold text-slate-400">
                    {takenToday ? 'Parabéns!' : 'Aguardando confirmação'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Histórico dos Últimos 7 Dias */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <History className="w-4 h-4 text-rose-600" /> Histórico dos Últimos 7 Dias
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {medication.logs.length} doses registradas
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {last7Days.map((dStr) => {
            const count = medication.logs.filter((l) => l.date === dStr).length;
            const isToday = dStr === today;
            return (
              <div
                key={dStr}
                className={`py-3 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1 ${
                  count > 0
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span className={`text-[11px] font-black ${isToday ? 'text-rose-700' : 'text-slate-600'}`}>
                  {getWeekdayShort(dStr)}
                </span>
                <span className="text-base font-black">{count > 0 ? '💊' : '—'}</span>
                <span className="text-[9px] font-bold">
                  {count > 0 ? `${count} ${count === 1 ? 'dose' : 'doses'}` : 'Nenhuma'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configurações: Som e Vibração */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-800">
          Avisos e Confirmação
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-rose-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">Som do Lembrete</p>
              <p className="text-xs text-slate-500">Tocar alerta suave ao dar o horário</p>
            </div>
          </div>
          <button
            onClick={() => onChange({ ...medication, soundEnabled: !medication.soundEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              medication.soundEnabled ? 'bg-rose-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                medication.soundEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-5 h-5 text-rose-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">Vibração</p>
              <p className="text-xs text-slate-500">Vibrar no momento da dose</p>
            </div>
          </div>
          <button
            onClick={() => onChange({ ...medication, vibrateEnabled: !medication.vibrateEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              medication.vibrateEnabled ? 'bg-rose-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                medication.vibrateEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleTestAlert}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-black py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Testar Alarme de Remédio Agora
          </button>
        </div>
      </div>

      {/* Modal Adicionar / Editar Medicamento */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-800">
                {editingItem ? 'Editar Remédio' : 'Novo Lembrete de Remédio'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedication} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Nome do Remédio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Losartana, Dipirona, Vitamina C"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-rose-500 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Dosagem
                </label>
                <input
                  type="text"
                  placeholder="Ex: 500mg, 1 comprimido, 20 gotas"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-rose-500 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Repetição
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFrequency('diario')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                      frequency === 'diario'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-black'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    Todo dia
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('intervalo_horas')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                      frequency === 'intervalo_horas'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-black'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    A cada X horas
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('dias_especificos')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                      frequency === 'dias_especificos'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-black'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    Dias específicos
                  </button>
                </div>
              </div>

              {frequency === 'intervalo_horas' && (
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Intervalo de quantas horas?
                  </label>
                  <select
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(e.target.value)}
                    className="w-full border-2 border-slate-200 focus:border-rose-500 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none"
                  >
                    <option value="4">A cada 4 horas</option>
                    <option value="6">A cada 6 horas</option>
                    <option value="8">A cada 8 horas (3x ao dia)</option>
                    <option value="12">A cada 12 horas (2x ao dia)</option>
                    <option value="24">A cada 24 horas (1x ao dia)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Horário(s) do Lembrete (HH:MM)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 08:00 ou 08:00, 20:00"
                  value={timesString}
                  onChange={(e) => setTimesString(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-rose-500 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none"
                />
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                  Para mais de um horário, separe por vírgula (ex: 08:00, 14:00, 20:00).
                </p>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Observação / Como Tomar
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tomar após o almoço, com bastante água..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-rose-500 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs py-3 rounded-xl shadow-sm transition"
                >
                  {editingItem ? 'Salvar Alterações' : 'Cadastrar Remédio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
