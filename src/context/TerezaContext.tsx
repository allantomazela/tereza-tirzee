import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import {
  UserProfile,
  DoseRecord,
  MeasurementRecord,
  DayNutrition,
  DiaryEntry,
  ReminderSettings,
  WeeklySummary,
  MealRecord,
  MealType,
  PinkTheme,
  GenderType,
  ColorFamily,
} from '@/types'
import {
  DEFAULT_PROFILE,
  INITIAL_DOSES,
  INITIAL_MEASUREMENTS,
  INITIAL_DIARY,
  INITIAL_REMINDERS,
} from '@/lib/mockData'
import { getISOWeek, getTodayDateString, calculateIMC } from '@/lib/formatters'
import { convertUnitsToMgOfficial, convertMgToUnitsOfficial } from '@/lib/fractionation'

export interface ThemePalette {
  name: string
  colorFamily: ColorFamily
  primary: string // CTA vibrante (#F43F8E, #2563EB, #D97706 etc.)
  hover: string
  light: string
  subtle: string // Fundo suave cards/chips (#FCE4EC, #EFF6FF, #FEF3C7)
  subtleBorder: string
  glow: string
  liquidStart: string
  liquidMiddle: string
  liquidEnd: string
  // HSL para shadcn
  primaryHsl: string
  secondaryHsl: string
  accentHsl: string
  ringHsl: string
}

export const GENDER_THEME_MAP: Record<GenderType, ColorFamily> = {
  female: 'pink',
  male: 'blue',
  non_binary: 'yellow',
  agender: 'yellow',
  prefer_not_to_say: 'yellow',
}

export const THEME_PALETTES: Record<ColorFamily, Record<string, ThemePalette>> = {
  pink: {
    classic: {
      name: 'Rosa Choque Clássico',
      colorFamily: 'pink',
      primary: '#F43F8E',
      hover: '#D63370',
      light: '#F9A8C9',
      subtle: '#FCE4EC',
      subtleBorder: 'rgba(249, 168, 201, 0.45)',
      glow: 'rgba(244, 63, 142, 0.28)',
      liquidStart: '#F43F8E',
      liquidMiddle: '#FDA4AF',
      liquidEnd: '#BE123C',
      primaryHsl: '333 89% 60%',
      secondaryHsl: '336 60% 96%',
      accentHsl: '336 60% 95%',
      ringHsl: '333 89% 60%',
    },
    peach: {
      name: 'Pêssego Delicado',
      colorFamily: 'pink',
      primary: '#FF6B9A',
      hover: '#E85282',
      light: '#FFB6C1',
      subtle: '#FFF0F3',
      subtleBorder: 'rgba(255, 182, 193, 0.5)',
      glow: 'rgba(255, 107, 154, 0.28)',
      liquidStart: '#FF6B9A',
      liquidMiddle: '#FFC0CB',
      liquidEnd: '#E85282',
      primaryHsl: '341 100% 71%',
      secondaryHsl: '348 100% 97%',
      accentHsl: '348 100% 96%',
      ringHsl: '341 100% 71%',
    },
    lavender: {
      name: 'Lavanda & Rosa',
      colorFamily: 'pink',
      primary: '#D36B9B',
      hover: '#BA5284',
      light: '#E8B4CC',
      subtle: '#F7EDF3',
      subtleBorder: 'rgba(232, 180, 204, 0.5)',
      glow: 'rgba(211, 107, 155, 0.28)',
      liquidStart: '#D36B9B',
      liquidMiddle: '#F2D3E3',
      liquidEnd: '#BA5284',
      primaryHsl: '332 53% 62%',
      secondaryHsl: '325 36% 95%',
      accentHsl: '325 36% 94%',
      ringHsl: '332 53% 62%',
    },
  },
  blue: {
    classic: {
      name: 'Azul Real Vibrante',
      colorFamily: 'blue',
      primary: '#2563EB',
      hover: '#1D4ED8',
      light: '#93C5FD',
      subtle: '#EFF6FF',
      subtleBorder: 'rgba(147, 197, 253, 0.5)',
      glow: 'rgba(37, 99, 235, 0.28)',
      liquidStart: '#2563EB',
      liquidMiddle: '#93C5FD',
      liquidEnd: '#1E40AF',
      primaryHsl: '221 83% 53%',
      secondaryHsl: '214 100% 97%',
      accentHsl: '214 100% 96%',
      ringHsl: '221 83% 53%',
    },
    cyan: {
      name: 'Azul Celeste & Ciano',
      colorFamily: 'blue',
      primary: '#0284C7',
      hover: '#0369A1',
      light: '#7DD3FC',
      subtle: '#F0F9FF',
      subtleBorder: 'rgba(125, 211, 252, 0.5)',
      glow: 'rgba(2, 132, 199, 0.28)',
      liquidStart: '#0284C7',
      liquidMiddle: '#BAE6FD',
      liquidEnd: '#075985',
      primaryHsl: '199 89% 48%',
      secondaryHsl: '204 100% 97%',
      accentHsl: '204 100% 96%',
      ringHsl: '199 89% 48%',
    },
    indigo: {
      name: 'Índigo Profundo',
      colorFamily: 'blue',
      primary: '#4F46E5',
      hover: '#4338CA',
      light: '#A5B4FC',
      subtle: '#EEF2FF',
      subtleBorder: 'rgba(165, 180, 252, 0.5)',
      glow: 'rgba(79, 70, 229, 0.28)',
      liquidStart: '#4F46E5',
      liquidMiddle: '#C7D2FE',
      liquidEnd: '#3730A3',
      primaryHsl: '243 75% 59%',
      secondaryHsl: '226 100% 97%',
      accentHsl: '226 100% 96%',
      ringHsl: '243 75% 59%',
    },
  },
  yellow: {
    classic: {
      name: 'Dourado Âmbar (Alto Contraste)',
      colorFamily: 'yellow',
      primary: '#D97706',
      hover: '#B45309',
      light: '#FCD34D',
      subtle: '#FFFBEB',
      subtleBorder: 'rgba(252, 211, 77, 0.55)',
      glow: 'rgba(217, 119, 6, 0.28)',
      liquidStart: '#D97706',
      liquidMiddle: '#FDE68A',
      liquidEnd: '#92400E',
      primaryHsl: '38 92% 50%',
      secondaryHsl: '48 100% 96%',
      accentHsl: '48 100% 95%',
      ringHsl: '38 92% 50%',
    },
    gold: {
      name: 'Amarelo Mostarda Seguro',
      colorFamily: 'yellow',
      primary: '#CA8A04',
      hover: '#A16207',
      light: '#FDE047',
      subtle: '#FEFCE8',
      subtleBorder: 'rgba(253, 224, 71, 0.55)',
      glow: 'rgba(202, 138, 4, 0.28)',
      liquidStart: '#CA8A04',
      liquidMiddle: '#FEF08A',
      liquidEnd: '#854D0E',
      primaryHsl: '42 93% 47%',
      secondaryHsl: '55 100% 97%',
      accentHsl: '55 100% 96%',
      ringHsl: '42 93% 47%',
    },
    sun: {
      name: 'Sol Alaranjado Quente',
      colorFamily: 'yellow',
      primary: '#EA580C',
      hover: '#C2410C',
      light: '#FDBA74',
      subtle: '#FFF7ED',
      subtleBorder: 'rgba(253, 186, 116, 0.55)',
      glow: 'rgba(234, 88, 12, 0.28)',
      liquidStart: '#EA580C',
      liquidMiddle: '#FED7AA',
      liquidEnd: '#9A3412',
      primaryHsl: '21 90% 48%',
      secondaryHsl: '34 100% 96%',
      accentHsl: '34 100% 95%',
      ringHsl: '21 90% 48%',
    },
  },
}

export function resolveCurrentPalette(profile: UserProfile): ThemePalette {
  const gender = profile.gender || 'female'
  const baseFamily: ColorFamily = profile.colorFamily || GENDER_THEME_MAP[gender] || 'pink'

  const familyPalettes = THEME_PALETTES[baseFamily] || THEME_PALETTES.pink
  const subTone = profile.pinkTheme || 'classic'
  return familyPalettes[subTone] || familyPalettes.classic
}

interface TerezaContextType {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  currentPalette: ThemePalette
  activeColorFamily: ColorFamily
  addTitrationStep: (step: Omit<import('@/types').TitrationStep, 'id'>) => void
  deleteTitrationStep: (id: string) => void
  concentrationMgMl: number // Concentração efetiva em mg/ml
  calculateMgFromUnits: (units: number) => number
  calculateUnitsFromMg: (mg: number) => number
  calculateMlFromUnits: (units: number) => number

  doses: DoseRecord[]
  addDose: (dose: Omit<DoseRecord, 'id' | 'createdAt'>) => void
  deleteDose: (id: string) => void

  measurements: MeasurementRecord[]
  addMeasurement: (record: {
    weightKg: number
    fatPercentage?: number
    waistCm?: number
    date?: string
  }) => void
  deleteMeasurement: (id: string) => void

  todayNutrition: DayNutrition
  addWater: (ml: number) => void
  undoLastWater: () => void
  setWaterGoal: (goalMl: number) => void
  saveMeal: (meal: MealRecord) => void

  diaryEntries: DiaryEntry[]
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void
  updateDiaryEntry: (id: string, entry: Partial<DiaryEntry>) => void
  deleteDiaryEntry: (id: string) => void

  reminders: ReminderSettings
  updateReminders: (updates: Partial<ReminderSettings>) => void

  // Dados calculados
  nextDoseInfo: {
    dateStr: string
    timeStr: string
    mgDose: number
    units: number
    isToday: boolean
    isPast: boolean
  }
  currentWeight: number
  weightProgressPercent: number
  weeklySummaries: WeeklySummary[]
  currentWeekSummary: WeeklySummary | null

  // Alertas
  isWaterReminderDue: boolean
  dismissWaterAlert: () => void

  // Reset total
  resetAllData: () => void
}

const STORAGE_KEYS = {
  profile: 'tereza_perfil',
  doses: 'tereza_doses',
  medidas: 'tereza_medidas',
  nutricao: 'tereza_nutricao',
  diario: 'tereza_diario',
  lembretes: 'tereza_lembretes',
}

const TerezaContext = createContext<TerezaContextType | undefined>(undefined)

const PINK_PALETTES: Record<PinkTheme, { primary: string; hover: string; light: string }> = {
  classic: { primary: '#F43F8E', hover: '#D63370', light: '#F9A8C9' },
  peach: { primary: '#FF6B9A', hover: '#E85282', light: '#FFB6C1' },
  lavender: { primary: '#D36B9B', hover: '#BA5284', light: '#E8B4CC' },
}

export const TerezaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Perfil
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.profile)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_PROFILE
  })

  // 2. Doses
  const [doses, setDoses] = useState<DoseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.doses)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return INITIAL_DOSES
  })

  // 3. Medidas
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.medidas)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return INITIAL_MEASUREMENTS
  })

  // 4. Nutrição do Dia
  const todayStr = getTodayDateString()
  const [nutritionMap, setNutritionMap] = useState<Record<string, DayNutrition>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.nutricao)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return {
      [todayStr]: {
        date: todayStr,
        waterMl: 1250,
        waterGoalMl: 2000,
        lastWaterLogTime: new Date().toISOString(),
        meals: {
          breakfast: {
            type: 'breakfast',
            quality: 'healthy',
            satiety: 4,
            notes: 'Omelete com aveia e café',
          },
          lunch: {
            type: 'lunch',
            quality: 'healthy',
            satiety: 5,
            notes: 'Salada verde com frango grelhado',
          },
        },
      },
    }
  })

  // 5. Diário
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.diario)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return INITIAL_DIARY
  })

  // 6. Lembretes
  const [reminders, setReminders] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.lembretes)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return INITIAL_REMINDERS
  })

  const [waterAlertDismissed, setWaterAlertDismissed] = useState(false)

  // Sincronização localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile))
    } catch (e) {
      console.error(e)
    }
  }, [profile])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.doses, JSON.stringify(doses))
    } catch (e) {
      console.error(e)
    }
  }, [doses])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.medidas, JSON.stringify(measurements))
    } catch (e) {
      console.error(e)
    }
  }, [measurements])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.nutricao, JSON.stringify(nutritionMap))
    } catch (e) {
      console.error(e)
    }
  }, [nutritionMap])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.diario, JSON.stringify(diaryEntries))
    } catch (e) {
      console.error(e)
    }
  }, [diaryEntries])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.lembretes, JSON.stringify(reminders))
    } catch (e) {
      console.error(e)
    }
  }, [reminders])

  // Determinar paleta ativa
  const currentPalette = useMemo<ThemePalette>(() => {
    return resolveCurrentPalette(profile)
  }, [profile])

  const activeColorFamily = currentPalette.colorFamily

  // Aplicar variáveis CSS no root (:root) para todo o app
  useEffect(() => {
    const root = document.documentElement

    // Variáveis dinâmicas da aplicação
    root.style.setProperty('--primary-color', currentPalette.primary)
    root.style.setProperty('--primary-hover', currentPalette.hover)
    root.style.setProperty('--primary-light', currentPalette.light)
    root.style.setProperty('--primary-subtle', currentPalette.subtle)
    root.style.setProperty('--primary-subtle-border', currentPalette.subtleBorder)
    root.style.setProperty('--primary-glow', currentPalette.glow)
    root.style.setProperty('--primary-liquid-start', currentPalette.liquidStart)
    root.style.setProperty('--primary-liquid-middle', currentPalette.liquidMiddle)
    root.style.setProperty('--primary-liquid-end', currentPalette.liquidEnd)

    // Retrocompatibilidade para variáveis legadas --pink-*
    root.style.setProperty('--pink-primary', currentPalette.primary)
    root.style.setProperty('--pink-hover', currentPalette.hover)
    root.style.setProperty('--pink-light', currentPalette.light)
    root.style.setProperty('--pink-subtle', currentPalette.subtle)

    // Variáveis shadcn/ui
    root.style.setProperty('--primary', currentPalette.primaryHsl)
    root.style.setProperty('--secondary', currentPalette.secondaryHsl)
    root.style.setProperty('--accent', currentPalette.accentHsl)
    root.style.setProperty('--ring', currentPalette.ringHsl)
    root.style.setProperty('--sidebar-primary', currentPalette.primaryHsl)
    root.style.setProperty('--sidebar-ring', currentPalette.ringHsl)
  }, [currentPalette])

  // Ações de Perfil
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  // Adicionar e remover etapas de titulação
  const addTitrationStep = (step: Omit<import('@/types').TitrationStep, 'id'>) => {
    const newStep: import('@/types').TitrationStep = {
      ...step,
      id: 'titr-' + Date.now(),
    }
    setProfile((prev) => {
      const plan = prev.titrationPlan || []
      return {
        ...prev,
        titrationPlan: [...plan, newStep].sort((a, b) => (a.date < b.date ? 1 : -1)),
      }
    })
  }

  const deleteTitrationStep = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      titrationPlan: (prev.titrationPlan || []).filter((s) => s.id !== id),
    }))
  }

  // Concentração efetiva em mg/ml:
  // Cada caneta de tirzepatida entrega sua dose em 0,5 ml:
  // concentração (mg/ml) = mg da caneta / 0,5 ml
  // Ex: 15 mg -> 30 mg/ml; 5 mg -> 10 mg/ml; 2,5 mg -> 5 mg/ml
  // Se o usuário tiver especificado customConcentrationMgMl, usa-se ela.
  const concentrationMgMl = useMemo<number>(() => {
    if (profile.customConcentrationMgMl && profile.customConcentrationMgMl > 0) {
      return profile.customConcentrationMgMl
    }
    const penMg = profile.currentPenMg || 15.0 // padrão 15mg
    return penMg / 0.5
  }, [profile.currentPenMg, profile.customConcentrationMgMl])

  // Conversão de unidades para volume em ml (100 UI = 1 ml)
  const calculateMlFromUnits = (units: number): number => {
    return Math.round((units / 100) * 1000) / 1000
  }

  // Conversão de unidades para mg:
  // Para caneta de 15 mg/0,5 ml sem concentração customizada, usa a tabela oficial de fracionamento
  // (2,5mg=8UI, 5,0mg=17UI, 7,5mg=25UI, 10,0mg=33UI, 12,5mg=42UI, 15,0mg=50UI)
  // Para outras canetas ou concentração customizada, usa a relação física direta (mg = ml * conc).
  const calculateMgFromUnits = (units: number): number => {
    const isStandard15mg =
      (!profile.customConcentrationMgMl || profile.customConcentrationMgMl <= 0) &&
      (profile.currentPenMg === undefined || profile.currentPenMg === 15)

    if (isStandard15mg) {
      return convertUnitsToMgOfficial(units)
    }

    const mg = (units / 100) * concentrationMgMl
    return Math.round(mg * 100) / 100
  }

  // Conversão de mg para unidades:
  // Para caneta de 15 mg/0,5 ml, usa os pontos oficiais arredondados (ex: 5 mg -> 17 UI)
  const calculateUnitsFromMg = (mg: number): number => {
    const isStandard15mg =
      (!profile.customConcentrationMgMl || profile.customConcentrationMgMl <= 0) &&
      (profile.currentPenMg === undefined || profile.currentPenMg === 15)

    if (isStandard15mg) {
      return convertMgToUnitsOfficial(mg)
    }

    if (concentrationMgMl <= 0) return 0
    const rawUnits = (mg / concentrationMgMl) * 100
    return Math.round(rawUnits * 10) / 10
  }

  // Ações de Doses
  const addDose = (dose: Omit<DoseRecord, 'id' | 'createdAt'>) => {
    const newRecord: DoseRecord = {
      ...dose,
      id: 'dose-' + Date.now(),
      createdAt: new Date().toISOString(),
    }
    setDoses((prev) =>
      [newRecord, ...prev].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1)),
    )
  }

  const deleteDose = (id: string) => {
    setDoses((prev) => prev.filter((d) => d.id !== id))
  }

  // Ações de Medidas
  const addMeasurement = (record: {
    weightKg: number
    fatPercentage?: number
    waistCm?: number
    date?: string
  }) => {
    const date = record.date || getTodayDateString()
    const imc = calculateIMC(record.weightKg, profile.heightCm)
    const newRecord: MeasurementRecord = {
      id: 'meas-' + Date.now(),
      date,
      weightKg: record.weightKg,
      fatPercentage: record.fatPercentage,
      waistCm: record.waistCm,
      imc,
      createdAt: new Date().toISOString(),
    }
    setMeasurements((prev) => {
      // Se já houver medição na mesma data, podemos atualizar ou empilhar
      return [newRecord, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1))
    })
  }

  const deleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id))
  }

  // Nutrição do dia
  const todayNutrition: DayNutrition = useMemo(() => {
    const today = getTodayDateString()
    return (
      nutritionMap[today] || {
        date: today,
        waterMl: 0,
        waterGoalMl: 2000,
        meals: {},
      }
    )
  }, [nutritionMap])

  const addWater = (ml: number) => {
    const today = getTodayDateString()
    setNutritionMap((prev) => {
      const current = prev[today] || {
        date: today,
        waterMl: 0,
        waterGoalMl: 2000,
        meals: {},
      }
      return {
        ...prev,
        [today]: {
          ...current,
          waterMl: Math.max(0, current.waterMl + ml),
          lastWaterLogTime: new Date().toISOString(),
        },
      }
    })
    setWaterAlertDismissed(true)
  }

  const undoLastWater = () => {
    const today = getTodayDateString()
    setNutritionMap((prev) => {
      const current = prev[today]
      if (!current) return prev
      return {
        ...prev,
        [today]: {
          ...current,
          waterMl: Math.max(0, current.waterMl - 250),
        },
      }
    })
  }

  const setWaterGoal = (goalMl: number) => {
    const today = getTodayDateString()
    setNutritionMap((prev) => {
      const current = prev[today] || {
        date: today,
        waterMl: 0,
        waterGoalMl: goalMl,
        meals: {},
      }
      return {
        ...prev,
        [today]: {
          ...current,
          waterGoalMl: goalMl,
        },
      }
    })
  }

  const saveMeal = (meal: MealRecord) => {
    const today = getTodayDateString()
    setNutritionMap((prev) => {
      const current = prev[today] || {
        date: today,
        waterMl: 0,
        waterGoalMl: 2000,
        meals: {},
      }
      return {
        ...prev,
        [today]: {
          ...current,
          meals: {
            ...current.meals,
            [meal.type]: meal,
          },
        },
      }
    })
  }

  // Diário
  const addDiaryEntry = (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: 'diary-' + Date.now(),
      createdAt: new Date().toISOString(),
    }
    setDiaryEntries((prev) => [newEntry, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)))
  }

  const updateDiaryEntry = (id: string, updates: Partial<DiaryEntry>) => {
    setDiaryEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  }

  const deleteDiaryEntry = (id: string) => {
    setDiaryEntries((prev) => prev.filter((e) => e.id !== id))
  }

  // Lembretes
  const updateReminders = (updates: Partial<ReminderSettings>) => {
    setReminders((prev) => ({ ...prev, ...updates }))
  }

  // Peso atual e progresso
  const currentWeight = useMemo(() => {
    if (measurements.length > 0) {
      return measurements[0].weightKg
    }
    return profile.initialWeight
  }, [measurements, profile.initialWeight])

  const weightProgressPercent = useMemo(() => {
    const { initialWeight, targetWeight } = profile
    const totalToLose = initialWeight - targetWeight
    if (totalToLose <= 0) return 100
    const lostSoFar = initialWeight - currentWeight
    const pct = (lostSoFar / totalToLose) * 100
    return Math.max(0, Math.min(100, Math.round(pct)))
  }, [profile, currentWeight])

  // Próxima dose calculada
  const nextDoseInfo = useMemo(() => {
    const latestDose = doses[0]
    const intervalDays = reminders.intervalDays || 7
    const currentConfigMg = profile.currentPenMg || 15.0
    const calculatedDefaultMg = latestDose?.mgDose ?? currentConfigMg
    const isStandard15mg =
      (!profile.customConcentrationMgMl || profile.customConcentrationMgMl <= 0) &&
      (profile.currentPenMg === undefined || profile.currentPenMg === 15)

    const calcUnitsFromMgLocal = (mgVal: number) => {
      if (isStandard15mg) return convertMgToUnitsOfficial(mgVal)
      return concentrationMgMl > 0 ? Math.round((mgVal / concentrationMgMl) * 100 * 10) / 10 : 0
    }

    const calculatedDefaultUnits = latestDose?.units ?? calcUnitsFromMgLocal(calculatedDefaultMg)
    const reminderTime = reminders.medicationTime || '20:00'

    if (!latestDose) {
      const initMg = profile.currentPenMg || 5.0
      const initUnits = calcUnitsFromMgLocal(initMg)
      return {
        dateStr: getTodayDateString(),
        timeStr: reminderTime,
        mgDose: initMg,
        units: initUnits,
        isToday: true,
        isPast: false,
      }
    }

    const [year, month, day] = latestDose.date.split('-').map(Number)
    const nextDate = new Date(year, month - 1, day)
    nextDate.setDate(nextDate.getDate() + intervalDays)

    const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
    const today = getTodayDateString()

    return {
      dateStr: nextDateStr,
      timeStr: reminderTime,
      mgDose: calculatedDefaultMg,
      units: calculatedDefaultUnits,
      isToday: nextDateStr === today,
      isPast: nextDateStr < today,
    }
  }, [doses, reminders, profile.currentPenMg, concentrationMgMl])

  // Alerta de água expirado
  const isWaterReminderDue = useMemo(() => {
    if (!reminders.waterEnabled || waterAlertDismissed) return false
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const [startH, startM] = (reminders.waterStartTime || '08:00').split(':').map(Number)
    const [endH, endM] = (reminders.waterEndTime || '22:00').split(':').map(Number)
    const startMin = startH * 60 + startM
    const endMin = endH * 60 + endM

    if (nowMinutes < startMin || nowMinutes > endMin) return false

    const lastLog = todayNutrition.lastWaterLogTime
    if (!lastLog) return true

    const diffMinutes = (Date.now() - new Date(lastLog).getTime()) / (1000 * 60)
    return diffMinutes >= (reminders.waterIntervalMinutes || 90)
  }, [reminders, waterAlertDismissed, todayNutrition.lastWaterLogTime])

  const dismissWaterAlert = () => setWaterAlertDismissed(true)

  // Agrupamento Semanal (ISO 8601)
  const weeklySummaries = useMemo<WeeklySummary[]>(() => {
    const map = new Map<string, WeeklySummary>()

    // Mapeia todas as datas de doses, medidas e sintomas
    const allDates = new Set<string>()
    doses.forEach((d) => allDates.add(d.date))
    measurements.forEach((m) => allDates.add(m.date))
    diaryEntries.forEach((e) => allDates.add(e.date))

    allDates.forEach((dateStr) => {
      const { year, week } = getISOWeek(dateStr)
      const key = `${year}-W${week}`
      if (!map.has(key)) {
        map.set(key, {
          year,
          weekNumber: week,
          startDate: dateStr,
          endDate: dateStr,
          doses: [],
          symptoms: [],
          weightChangeKg: null,
          currentWeightKg: null,
        })
      }
    })

    // Preenche dados
    doses.forEach((dose) => {
      const { year, week } = getISOWeek(dose.date)
      const key = `${year}-W${week}`
      const entry = map.get(key)
      if (entry) {
        entry.doses.push(dose)
      }
    })

    diaryEntries.forEach((entry) => {
      const { year, week } = getISOWeek(entry.date)
      const key = `${year}-W${week}`
      const summary = map.get(key)
      if (summary) {
        entry.symptoms.forEach((s) => {
          if (!summary.symptoms.includes(s)) summary.symptoms.push(s)
        })
      }
    })

    // Calcula peso da semana
    map.forEach((summary) => {
      const weekMeasurements = measurements.filter((m) => {
        const { year, week } = getISOWeek(m.date)
        return year === summary.year && week === summary.weekNumber
      })
      if (weekMeasurements.length > 0) {
        summary.currentWeightKg = weekMeasurements[0].weightKg
        if (weekMeasurements.length > 1) {
          const first = weekMeasurements[weekMeasurements.length - 1].weightKg
          const last = weekMeasurements[0].weightKg
          summary.weightChangeKg = Math.round((last - first) * 10) / 10
        }
      }
    })

    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.weekNumber - a.weekNumber
    })
  }, [doses, measurements, diaryEntries])

  const currentWeekSummary = useMemo(() => {
    const today = getTodayDateString()
    const { year, week } = getISOWeek(today)
    return (
      weeklySummaries.find((s) => s.year === year && s.weekNumber === week) ||
      (weeklySummaries.length > 0 ? weeklySummaries[0] : null)
    )
  }, [weeklySummaries])

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.profile)
    localStorage.removeItem(STORAGE_KEYS.doses)
    localStorage.removeItem(STORAGE_KEYS.medidas)
    localStorage.removeItem(STORAGE_KEYS.nutricao)
    localStorage.removeItem(STORAGE_KEYS.diario)
    localStorage.removeItem(STORAGE_KEYS.lembretes)
    window.location.reload()
  }

  const value: TerezaContextType = {
    profile,
    updateProfile,
    currentPalette,
    activeColorFamily,
    addTitrationStep,
    deleteTitrationStep,
    concentrationMgMl,
    calculateMlFromUnits,
    calculateMgFromUnits,
    calculateUnitsFromMg,
    doses,
    addDose,
    deleteDose,
    measurements,
    addMeasurement,
    deleteMeasurement,
    todayNutrition,
    addWater,
    undoLastWater,
    setWaterGoal,
    saveMeal,
    diaryEntries,
    addDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
    reminders,
    updateReminders,
    nextDoseInfo,
    currentWeight,
    weightProgressPercent,
    weeklySummaries,
    currentWeekSummary,
    isWaterReminderDue,
    dismissWaterAlert,
    resetAllData,
  }

  return <TerezaContext.Provider value={value}>{children}</TerezaContext.Provider>
}

export const useTereza = (): TerezaContextType => {
  const context = useContext(TerezaContext)
  if (!context) {
    throw new Error('useTereza must be used within a TerezaProvider')
  }
  return context
}
