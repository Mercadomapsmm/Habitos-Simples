import { AppState, WaterData, ExerciseData, SleepData, MedicationData } from '../types';

export const STORAGE_KEY = 'habitos_simples_app_state_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

export function getFormattedDatePtBR(dateStr?: string): string {
  const date = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  const day = date.getDate();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekdayNames = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];
  return `${weekdayNames[date.getDay()]}, ${day} de ${monthNames[date.getMonth()]}`;
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

export function getWeekdayShort(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const names = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return names[d.getDay()];
}

export function calculateExerciseStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;
  const dateSet = new Set(completedDates);
  const today = getTodayDateString();
  
  // Check if completed today or yesterday
  let checkDate = new Date();
  const todayStr = getTodayDateString();
  
  let streak = 0;
  // If not completed today, start checking from yesterday
  if (!dateSet.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (!dateSet.has(yStr)) {
      return 0; // Streak broken
    }
  }

  // Count backwards
  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;
    if (dateSet.has(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export const INITIAL_STATE: AppState = {
  water: {
    weightKg: 70,
    dailyGoalMl: 2450, // 70 * 35 ml
    consumedByDate: {
      [getTodayDateString()]: 500,
    },
    reminders: ['08:00', '10:30', '13:00', '15:30', '18:00', '20:30'],
    soundEnabled: true,
    vibrateEnabled: true,
    quickSizes: [200, 300, 500],
  },
  exercise: {
    type: 'caminhada',
    targetDays: [1, 2, 3, 4, 5], // Seg a Sex
    reminderTime: '07:30',
    completedDates: [
      // Pre-seed yesterday for immediate positive reinforcement
      (() => {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        return `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      })(),
    ],
    soundEnabled: true,
    vibrateEnabled: true,
  },
  sleep: {
    targetBedtime: '22:30',
    targetWakeTime: '06:30',
    windDownNoticeMin: 30,
    soundEnabled: true,
    vibrateEnabled: true,
    records: {
      // Pre-seed some recent records for immediate visual chart
      [getTodayDateString()]: {
        quality: 'bem',
        bedTime: '22:45',
        wakeTime: '06:35',
        recordedAt: Date.now(),
      },
    },
  },
  medication: {
    items: [
      {
        id: 'med-vit-d',
        name: 'Vitamina D',
        dosage: '1 cápsula (2.000 UI)',
        frequency: 'diario',
        times: ['08:00'],
        note: 'Tomar junto ao café da manhã',
        color: 'amber',
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'med-omega',
        name: 'Ômega 3',
        dosage: '1 cápsula',
        frequency: 'diario',
        times: ['12:30'],
        note: 'Tomar durante o almoço',
        color: 'sky',
        createdAt: Date.now() - 86400000,
      },
    ],
    logs: [
      {
        id: 'log-1',
        medicationId: 'med-vit-d',
        medicationName: 'Vitamina D',
        dosage: '1 cápsula (2.000 UI)',
        date: getTodayDateString(),
        time: '08:10',
        timestamp: Date.now() - 7200000,
      },
    ],
    soundEnabled: true,
    vibrateEnabled: true,
  },
  hasSeenWelcome: true,
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      water: { ...INITIAL_STATE.water, ...(parsed.water || {}) },
      exercise: { ...INITIAL_STATE.exercise, ...(parsed.exercise || {}) },
      sleep: { ...INITIAL_STATE.sleep, ...(parsed.sleep || {}) },
      medication: { ...INITIAL_STATE.medication, ...(parsed.medication || {}) },
    };
  } catch (err) {
    console.error('Erro ao ler estado do localStorage:', err);
    return INITIAL_STATE;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Erro ao salvar estado no localStorage:', err);
  }
}

export function exportAppDataJson(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importAppDataJson(jsonString: string): AppState | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && parsed.water && parsed.exercise && parsed.sleep && parsed.medication) {
      saveAppState(parsed);
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}
