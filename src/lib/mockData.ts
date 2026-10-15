import {
  UserProfile,
  DoseRecord,
  MeasurementRecord,
  DayNutrition,
  DiaryEntry,
  ReminderSettings,
} from '@/types'

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Tereza Maria',
  heightCm: 165,
  age: 38,
  gender: 'female',
  initialWeight: 84.5,
  targetWeight: 68.0,
  pinkTheme: 'classic',
  waterUnit: 'L',
  weightUnit: 'kg',
}

// 4 semanas de dados realistas para o usuário ver gráficos e agrupamento semanal funcionando de imediato
export const INITIAL_DOSES: DoseRecord[] = [
  {
    id: 'dose-1',
    date: '2025-02-13',
    time: '20:00',
    units: 10,
    site: 'Barriga',
    mgDose: 2.5,
    createdAt: '2025-02-13T20:00:00.000Z',
  },
  {
    id: 'dose-2',
    date: '2025-02-20',
    time: '20:15',
    units: 10,
    site: 'Coxa',
    mgDose: 2.5,
    createdAt: '2025-02-20T20:15:00.000Z',
  },
  {
    id: 'dose-3',
    date: '2025-02-27',
    time: '19:45',
    units: 20,
    site: 'Barriga',
    mgDose: 5.0,
    createdAt: '2025-02-27T19:45:00.000Z',
  },
  {
    id: 'dose-4',
    date: '2025-03-06',
    time: '20:00',
    units: 20,
    site: 'Braço',
    mgDose: 5.0,
    createdAt: '2025-03-06T20:00:00.000Z',
  },
]

export const INITIAL_MEASUREMENTS: MeasurementRecord[] = [
  {
    id: 'meas-1',
    date: '2025-02-13',
    weightKg: 84.5,
    fatPercentage: 35.2,
    waistCm: 98,
    imc: 31.0,
    createdAt: '2025-02-13T08:00:00.000Z',
  },
  {
    id: 'meas-2',
    date: '2025-02-20',
    weightKg: 83.1,
    fatPercentage: 34.6,
    waistCm: 96,
    imc: 30.5,
    createdAt: '2025-02-20T08:00:00.000Z',
  },
  {
    id: 'meas-3',
    date: '2025-02-27',
    weightKg: 81.4,
    fatPercentage: 33.9,
    waistCm: 94,
    imc: 29.9,
    createdAt: '2025-02-27T08:00:00.000Z',
  },
  {
    id: 'meas-4',
    date: '2025-03-06',
    weightKg: 79.8,
    fatPercentage: 33.0,
    waistCm: 92,
    imc: 29.3,
    createdAt: '2025-03-06T08:00:00.000Z',
  },
  {
    id: 'meas-5',
    date: '2025-03-12',
    weightKg: 78.5,
    fatPercentage: 32.4,
    waistCm: 90,
    imc: 28.8,
    createdAt: '2025-03-12T08:00:00.000Z',
  },
]

export const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: 'diary-1',
    date: '2025-03-07',
    symptoms: ['nausea', 'no_appetite'],
    notes:
      'Dia seguinte à dose de 5mg. Leve enjoo pela manhã, mas muita saciedade durante o dia todo.',
    createdAt: '2025-03-07T21:00:00.000Z',
  },
  {
    id: 'diary-2',
    date: '2025-03-09',
    symptoms: ['wellbeing'],
    notes:
      'Muita disposição hoje para a caminhada matinal de 40 minutos. Bebendo bastante água conforme prescrito.',
    createdAt: '2025-03-09T18:30:00.000Z',
  },
  {
    id: 'diary-3',
    date: '2025-03-12',
    symptoms: ['wellbeing', 'no_appetite'],
    notes:
      'Peso caiu para 78,5 kg! Roupas visivelmente mais folgadas. Sensação ótima de controle alimentar.',
    createdAt: '2025-03-12T19:00:00.000Z',
  },
]

export const INITIAL_REMINDERS: ReminderSettings = {
  medicationEnabled: true,
  medicationTime: '20:00',
  medicationDays: [4], // Quinta-feira (padrão)
  intervalDays: 7,
  waterEnabled: true,
  waterIntervalMinutes: 90,
  waterStartTime: '08:00',
  waterEndTime: '22:00',
}

export const MOTIVATIONAL_PHRASES: string[] = [
  'Cada passo conta. Você vai conseguir!',
  'Constância é a chave para a sua transformação.',
  'Celebre pequenas vitórias diárias!',
  'Cuidar de você é o seu maior ato de amor-próprio.',
  'Sua saúde e seu bem-estar merecem toda a sua dedicação.',
  'Um dia de cada vez, com carinho e paciência.',
  'O processo é único, e seus resultados já estão acontecendo.',
]
