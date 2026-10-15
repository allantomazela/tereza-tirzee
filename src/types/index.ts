export type PinkTheme = 'classic' | 'peach' | 'lavender'

export interface UserProfile {
  name: string
  heightCm: number
  age: number
  gender: 'female' | 'male' | 'other'
  initialWeight: number
  targetWeight: number
  pinkTheme: PinkTheme
  waterUnit: 'ml' | 'L'
  weightUnit: 'kg' | 'lb'
}

export type InjectionSite = 'Braço' | 'Barriga' | 'Coxa'

export interface DoseRecord {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  units: number // 0-60
  site: InjectionSite
  mgDose?: number
  notes?: string
  createdAt: string
}

export interface MeasurementRecord {
  id: string
  date: string // YYYY-MM-DD
  weightKg: number
  fatPercentage?: number
  waistCm?: number
  imc: number
  createdAt: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'
export type MealQuality = 'healthy' | 'moderate' | 'excessive'

export interface MealRecord {
  type: MealType
  quality?: MealQuality
  satiety?: number // 1 to 5
  notes?: string
}

export interface DayNutrition {
  date: string // YYYY-MM-DD
  waterMl: number
  waterGoalMl: number
  lastWaterLogTime?: string
  meals: {
    breakfast?: MealRecord
    lunch?: MealRecord
    dinner?: MealRecord
    snacks?: MealRecord
  }
}

export type SymptomType =
  | 'nausea'
  | 'headache'
  | 'fatigue'
  | 'no_appetite'
  | 'wellbeing'
  | 'constipation'
  | 'insomnia'
  | 'dizziness'

export interface DiaryEntry {
  id: string
  date: string // YYYY-MM-DD
  symptoms: SymptomType[]
  notes: string
  createdAt: string
}

export interface ReminderSettings {
  medicationEnabled: boolean
  medicationTime: string // HH:mm
  medicationDays: number[] // 0=dom, 1=seg, ..., 6=sab
  intervalDays: number // default 7
  waterEnabled: boolean
  waterIntervalMinutes: number // default 90
  waterStartTime: string // 08:00
  waterEndTime: string // 22:00
}

export interface WeeklySummary {
  year: number
  weekNumber: number
  startDate: string
  endDate: string
  doses: DoseRecord[]
  symptoms: SymptomType[]
  weightChangeKg: number | null
  currentWeightKg: number | null
}
