export type ScreenType = 'home' | 'water' | 'exercise' | 'sleep' | 'medication';

export interface WaterData {
  weightKg: number;
  dailyGoalMl: number;
  consumedByDate: Record<string, number>; // 'YYYY-MM-DD' -> ml
  reminders: string[]; // e.g. ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  quickSizes: number[]; // [200, 300, 500]
}

export type ExerciseType = 'caminhada' | 'alongamento' | 'academia' | 'corrida' | 'outro';

export interface ExerciseData {
  type: ExerciseType;
  customType?: string;
  targetDays: number[]; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  reminderTime: string; // '07:30'
  completedDates: string[]; // array of 'YYYY-MM-DD'
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

export type SleepQuality = 'bem' | 'mal';

export interface SleepRecord {
  quality: SleepQuality;
  bedTime?: string;
  wakeTime?: string;
  note?: string;
  recordedAt: number;
}

export interface SleepData {
  targetBedtime: string; // '22:30'
  targetWakeTime: string; // '06:30'
  windDownNoticeMin: number; // 30 minutes before bedtime
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  records: Record<string, SleepRecord>; // 'YYYY-MM-DD' -> SleepRecord
}

export type MedicationFrequency = 'diario' | 'dias_especificos' | 'intervalo_horas';

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  specificDays?: number[]; // [1, 3, 5] (Seg, Qua, Sex)
  intervalHours?: number; // 8
  times: string[]; // ['08:00', '20:00']
  note: string; // 'Tomar com água após o almoço'
  color: string; // Tailwind color token or hex
  createdAt: number;
}

export interface TakenMedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // '08:15'
  timestamp: number;
}

export interface MedicationData {
  items: MedicationItem[];
  logs: TakenMedicationLog[];
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

export interface AppState {
  water: WaterData;
  exercise: ExerciseData;
  sleep: SleepData;
  medication: MedicationData;
  hasSeenWelcome: boolean;
}
