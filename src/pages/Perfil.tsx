import { useState, useId } from 'react'
import {
  UserCircle,
  Bell,
  Palette,
  RotateCcw,
  AlertTriangle,
  Info,
  Check,
  Save,
  Droplets,
  Calendar,
  Clock,
  Trash2,
  Syringe,
  Plus,
  FileText,
} from 'lucide-react'
import { useTereza } from '@/context/TerezaContext'
import { PinkTheme } from '@/types'
import { cn } from '@/lib/utils'
import { getTodayDateString } from '@/lib/formatters'
import MedicalReportModal from '@/components/MedicalReportModal'

const THEME_OPTIONS: { id: PinkTheme; name: string; primary: string; desc: string }[] = [
  { id: 'classic', name: 'Rosa Choque Clássico', primary: '#F43F8E', desc: 'Vibrante e motivador' },
  { id: 'peach', name: 'Rosa Pêssego', primary: '#FF6B9A', desc: 'Suave e caloroso' },
  { id: 'lavender', name: 'Rosa Lavanda', primary: '#D36B9B', desc: 'Clínico e sereno' },
]

const DAYS_OF_WEEK = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
]

export default function Perfil() {
  const {
    profile,
    updateProfile,
    addTitrationStep,
    deleteTitrationStep,
    reminders,
    updateReminders,
    resetAllData,
  } = useTereza()

  // Estados de formulário de Perfil
  const [name, setName] = useState(profile.name)
  const [heightCm, setHeightCm] = useState(String(profile.heightCm))
  const [age, setAge] = useState(String(profile.age))
  const [gender, setGender] = useState<'female' | 'male' | 'other'>(profile.gender)
  const [initialWeight, setInitialWeight] = useState(
    String(profile.initialWeight).replace('.', ','),
  )
  const [targetWeight, setTargetWeight] = useState(String(profile.targetWeight).replace('.', ','))

  // Estados de Dosagem e Titulação Clínica
  const [currentPenMg, setCurrentPenMg] = useState<number>(profile.currentPenMg || 15.0)
  const [useCustomConc, setUseCustomConc] = useState<boolean>(!!profile.customConcentrationMgMl)
  const [customConcValue, setCustomConcValue] = useState<string>(
    profile.customConcentrationMgMl
      ? String(profile.customConcentrationMgMl).replace('.', ',')
      : String((profile.currentPenMg || 15.0) / 0.5).replace('.', ','),
  )
  const [newStepMg, setNewStepMg] = useState<number>(5.0)
  const [newStepDate, setNewStepDate] = useState<string>(getTodayDateString())
  const [newStepNotes, setNewStepNotes] = useState<string>('')
  const [showAddStep, setShowAddStep] = useState<boolean>(false)

  // Estados de Lembretes
  const [medicationEnabled, setMedicationEnabled] = useState(reminders.medicationEnabled)
  const [medicationTime, setMedicationTime] = useState(reminders.medicationTime || '20:00')
  const [medicationDays, setMedicationDays] = useState<number[]>(reminders.medicationDays || [4])
  const [intervalDays, setIntervalDays] = useState(String(reminders.intervalDays || 7))

  const [waterEnabled, setWaterEnabled] = useState(reminders.waterEnabled)
  const [waterInterval, setWaterInterval] = useState(String(reminders.waterIntervalMinutes || 90))
  const [waterStartTime, setWaterStartTime] = useState(reminders.waterStartTime || '08:00')
  const [waterEndTime, setWaterEndTime] = useState(reminders.waterEndTime || '22:00')

  // Preferências de Unidade
  const [waterUnit, setWaterUnit] = useState<'ml' | 'L'>(profile.waterUnit || 'L')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(profile.weightUnit || 'kg')

  // Tom de Rosa
  const [selectedTheme, setSelectedTheme] = useState<PinkTheme>(profile.pinkTheme || 'classic')

  // Modais de Reset e Toasts
  const [resetModalStep, setResetModalStep] = useState<0 | 1 | 2>(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showMedicalReportModal, setShowMedicalReportModal] = useState<boolean>(false)

  const nameInputId = useId()
  const heightInputId = useId()
  const ageInputId = useId()
  const initWeightId = useId()
  const targetWeightId = useId()
  const medTimeId = useId()
  const intervalId = useId()
  const waterIntervalId = useId()
  const waterStartId = useId()
  const waterEndId = useId()

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Salvar Dados Pessoais
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedHeight = parseInt(heightCm, 10)
    const parsedAge = parseInt(age, 10)
    const parsedInitW = parseFloat(initialWeight.replace(',', '.'))
    const parsedTargW = parseFloat(targetWeight.replace(',', '.'))

    const parsedCustomConc = useCustomConc
      ? parseFloat(customConcValue.replace(',', '.'))
      : undefined
    const effectiveConc =
      useCustomConc && parsedCustomConc && parsedCustomConc > 0
        ? parsedCustomConc
        : currentPenMg / 0.5

    updateProfile({
      name: name.trim(),
      heightCm: isNaN(parsedHeight) ? 165 : parsedHeight,
      age: isNaN(parsedAge) ? 35 : parsedAge,
      gender,
      initialWeight: isNaN(parsedInitW) ? 80 : parsedInitW,
      targetWeight: isNaN(parsedTargW) ? 65 : parsedTargW,
      pinkTheme: selectedTheme,
      waterUnit,
      weightUnit,
      currentPenMg,
      customConcentrationMgMl:
        useCustomConc && parsedCustomConc && parsedCustomConc > 0 ? parsedCustomConc : undefined,
      mgPer100Units: effectiveConc,
    })

    triggerToast('Perfil, metas e dosagens salvas com sucesso!')
  }

  const handleAddTitrationStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (newStepMg <= 0) return

    addTitrationStep({
      targetMg: newStepMg,
      date: newStepDate,
      notes: newStepNotes.trim() || undefined,
    })

    setNewStepNotes('')
    setShowAddStep(false)
    triggerToast(`Progressão para ${newStepMg} mg adicionada ao histórico!`)
  }

  // Salvar Lembretes
  const handleSaveReminders = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedInterval = parseInt(intervalDays, 10)
    const parsedWaterInt = parseInt(waterInterval, 10)

    updateReminders({
      medicationEnabled,
      medicationTime,
      medicationDays,
      intervalDays: isNaN(parsedInterval) ? 7 : parsedInterval,
      waterEnabled,
      waterIntervalMinutes: isNaN(parsedWaterInt) ? 90 : parsedWaterInt,
      waterStartTime,
      waterEndTime,
    })

    triggerToast('Configurações de lembretes atualizadas!')
  }

  const toggleDay = (dayId: number) => {
    setMedicationDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* TOAST DE FEEDBACK */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-down"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1A1D]">
          Perfil & Configurações
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Gerencie seus dados corporais, parâmetros de lembrete e personalização visual.
        </p>
      </div>

      {/* AVISO CLÍNICO OBRIGATÓRIO */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#FCE4EC] border border-[#F9A8C9]/60 flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-white text-[#F43F8E] flex items-center justify-center shrink-0 shadow-xs">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-[#1F1A1D]/90 leading-relaxed">
          <strong className="block text-[#F43F8E] font-bold">Nota de Segurança Clínica:</strong>
          As informações do aplicativo TEREZA sobre a Tirzepatida (como dosagem titulada, locais de
          injeção e intervalos) são meramente orientativas e educativas. Siga sempre as orientações
          e a prescrição do seu médico endocrinologista.
        </div>
      </div>

      {/* SEÇÃO 1: DADOS PESSOAIS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card-soft space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-[#FCE4EC] text-[#F43F8E] flex items-center justify-center">
            <UserCircle className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-base text-[#1F1A1D]">Dados Pessoais & Metas</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nome */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor={nameInputId} className="block text-xs font-bold text-gray-700">
                Nome completo ou preferido:
              </label>
              <input
                id={nameInputId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
              />
            </div>

            {/* Altura cm */}
            <div className="space-y-1.5">
              <label htmlFor={heightInputId} className="block text-xs font-bold text-gray-700">
                Altura (cm):
              </label>
              <input
                id={heightInputId}
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="165"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
              />
            </div>

            {/* Idade */}
            <div className="space-y-1.5">
              <label htmlFor={ageInputId} className="block text-xs font-bold text-gray-700">
                Idade (anos):
              </label>
              <input
                id={ageInputId}
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="35"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
              />
            </div>

            {/* Peso Inicial */}
            <div className="space-y-1.5">
              <label htmlFor={initWeightId} className="block text-xs font-bold text-gray-700">
                Peso Inicial (kg):
              </label>
              <input
                id={initWeightId}
                type="text"
                value={initialWeight}
                onChange={(e) => setInitialWeight(e.target.value)}
                placeholder="84,5"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
              />
            </div>

            {/* Peso Meta */}
            <div className="space-y-1.5">
              <label htmlFor={targetWeightId} className="block text-xs font-bold text-gray-700">
                Peso Meta (kg):
              </label>
              <input
                id={targetWeightId}
                type="text"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="68,0"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
              />
            </div>
          </div>

          {/* Gênero Chips */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-gray-700">Gênero:</span>
            <div className="flex gap-2">
              {[
                { id: 'female', label: 'Feminino' },
                { id: 'male', label: 'Masculino' },
                { id: 'other', label: 'Outro' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id as 'female' | 'male' | 'other')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-semibold border transition-all chip-scale',
                    gender === g.id
                      ? 'bg-[#FCE4EC] border-[#F43F8E] text-[#F43F8E]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferências de Unidade */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-gray-700">Unidade de Água:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWaterUnit('L')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition',
                    waterUnit === 'L'
                      ? 'bg-[#FCE4EC] border-[#F43F8E] text-[#F43F8E]'
                      : 'bg-white border-gray-200 text-gray-600',
                  )}
                >
                  Litros (L)
                </button>
                <button
                  type="button"
                  onClick={() => setWaterUnit('ml')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition',
                    waterUnit === 'ml'
                      ? 'bg-[#FCE4EC] border-[#F43F8E] text-[#F43F8E]'
                      : 'bg-white border-gray-200 text-gray-600',
                  )}
                >
                  Mililitros (ml)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-gray-700">Unidade de Peso:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition',
                    weightUnit === 'kg'
                      ? 'bg-[#FCE4EC] border-[#F43F8E] text-[#F43F8E]'
                      : 'bg-white border-gray-200 text-gray-600',
                  )}
                >
                  Quilogramas (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('lb')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition',
                    weightUnit === 'lb'
                      ? 'bg-[#FCE4EC] border-[#F43F8E] text-[#F43F8E]'
                      : 'bg-white border-gray-200 text-gray-600',
                  )}
                >
                  Libras (lb)
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-[#F43F8E] hover:bg-[#D63370] text-white font-bold text-xs rounded-2xl shadow-md btn-tap-scale transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Perfil</span>
            </button>
          </div>
        </form>
      </div>

      {/* SEÇÃO NOVA: DOSAGEM, CONCENTRAÇÃO & TITULAÇÃO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card-soft space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FCE4EC] text-[#F43F8E] flex items-center justify-center">
              <Syringe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1F1A1D]">
                Dosagem da Caneta & Plano de Titulação
              </h2>
              <p className="text-xs text-gray-500">
                Mapeamento das unidades da seringa U-100 para mg de acordo com a receita médica
              </p>
            </div>
          </div>
        </div>

        {/* Escolha da Caneta Prescrita */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">
            Dose Prescrita Atual (Caneta):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {[2.5, 5.0, 7.5, 10.0, 12.5, 15.0].map((mg) => (
              <button
                key={mg}
                type="button"
                onClick={() => setCurrentPenMg(mg)}
                className={cn(
                  'p-3 rounded-2xl border text-center transition-all chip-scale',
                  currentPenMg === mg
                    ? 'bg-[#FCE4EC] border-[#F43F8E] text-[#F43F8E] font-bold shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                )}
              >
                <span className="block text-sm font-black">{mg} mg</span>
                <span className="text-[10px] opacity-75">Tirzepatida</span>
              </button>
            ))}
          </div>
        </div>

        {/* Concentração calculada a partir da caneta de 0,5 ml */}
        <div className="p-4 rounded-2xl bg-[#F7F4F6] border border-gray-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-gray-800 block">
                Cálculo de Concentração da Caneta (em 0,5 ml)
              </span>
              <span className="text-[11px] text-gray-500">
                Caneta de <strong>{currentPenMg} mg</strong> em 0,5 ml ={' '}
                <strong className="text-[#F43F8E]">
                  {(currentPenMg / 0.5).toFixed(1).replace('.0', '')} mg/ml
                </strong>{' '}
                (Ex.: 5 mg = {((5 / (currentPenMg / 0.5)) * 100).toFixed(1).replace('.', ',')} UI)
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs font-bold text-[#F43F8E] px-3 py-1 bg-white rounded-xl border border-[#F9A8C9]">
                {useCustomConc
                  ? customConcValue
                  : (currentPenMg / 0.5).toFixed(1).replace('.0', '')}{' '}
                mg/ml
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between">
            <label className="text-xs text-gray-600 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomConc}
                onChange={(e) => {
                  setUseCustomConc(e.target.checked)
                  if (!e.target.checked) {
                    setCustomConcValue(String(currentPenMg / 0.5).replace('.', ','))
                  }
                }}
                className="rounded text-[#F43F8E] focus:ring-[#F43F8E]"
              />
              <span>Usar concentração manipulada personalizada (mg/ml)</span>
            </label>

            {useCustomConc && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={customConcValue}
                  onChange={(e) => setCustomConcValue(e.target.value)}
                  placeholder="Ex: 30"
                  className="w-20 px-2.5 py-1 text-center text-xs font-bold bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
                />
                <span className="text-xs font-bold text-gray-500">mg/ml</span>
              </div>
            )}
          </div>
        </div>

        {/* Histórico / Plano de Titulação */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800">
              Evolução e Histórico de Titulação:
            </span>
            <button
              type="button"
              onClick={() => setShowAddStep(!showAddStep)}
              className="text-xs font-bold text-[#F43F8E] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar etapa</span>
            </button>
          </div>

          {showAddStep && (
            <div className="p-4 rounded-2xl bg-[#FFF5F8] border border-[#F9A8C9]/40 space-y-3 animate-fade-in">
              <span className="text-xs font-bold text-[#F43F8E] block">
                Registrar Progressão de Dose
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700">Dose Alvo (mg):</label>
                  <select
                    value={newStepMg}
                    onChange={(e) => setNewStepMg(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold bg-white rounded-xl border border-gray-300"
                  >
                    {[2.5, 5.0, 7.5, 10.0, 12.5, 15.0].map((v) => (
                      <option key={v} value={v}>
                        {v} mg
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700">A partir de:</label>
                  <input
                    type="date"
                    value={newStepDate}
                    onChange={(e) => setNewStepDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white rounded-xl border border-gray-300"
                  ></input>
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-gray-700">
                    Anotação médica:
                  </label>
                  <input
                    type="text"
                    value={newStepNotes}
                    onChange={(e) => setNewStepNotes(e.target.value)}
                    placeholder="Ex: Subida planejada com médico"
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddStep(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddTitrationStep}
                  className="px-4 py-1.5 bg-[#F43F8E] hover:bg-[#D63370] text-white text-xs font-bold rounded-xl shadow-2xs"
                >
                  Salvar Etapa
                </button>
              </div>
            </div>
          )}

          {/* Lista de etapas */}
          <div className="space-y-2">
            {(profile.titrationPlan || []).map((step, idx) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F4F6] border border-gray-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FCE4EC] text-[#F43F8E] font-bold flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-[#1F1A1D]">
                      {step.targetMg} mg — início em {step.date.split('-').reverse().join('/')}
                    </span>
                    {step.notes && <p className="text-[11px] text-gray-500">{step.notes}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTitrationStep(step.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Remover etapa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-6 py-2.5 bg-[#F43F8E] hover:bg-[#D63370] text-white font-bold text-xs rounded-2xl shadow-md btn-tap-scale transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações de Dose</span>
          </button>
        </div>
      </div>

      {/* SEÇÃO 2: LEMBRETES & NOTIFICAÇÕES INTERNAS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card-soft space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base text-[#1F1A1D]">Lembretes Internos da Aplicação</h2>
            <p className="text-xs text-gray-500">
              Notificações e banners disparados ao abrir o app no navegador.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveReminders} className="space-y-6">
          {/* Lembrete de Dose */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F4F6] border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F43F8E]" />
                <span className="font-bold text-sm text-[#1F1A1D]">
                  Lembrete de Medicação (Tirzepatida)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={medicationEnabled}
                  onChange={(e) => setMedicationEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F43F8E]" />
              </label>
            </div>

            {medicationEnabled && (
              <div className="space-y-4 pt-2 border-t border-gray-200 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor={medTimeId}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-700"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#F43F8E]" />
                      <span>Horário habitual da injeção:</span>
                    </label>
                    <input
                      id={medTimeId}
                      type="time"
                      value={medicationTime}
                      onChange={(e) => setMedicationTime(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={intervalId}
                      className="block text-xs font-semibold text-gray-700"
                    >
                      Intervalo entre doses (dias):
                    </label>
                    <input
                      id={intervalId}
                      type="number"
                      value={intervalDays}
                      onChange={(e) => setIntervalDays(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold w-24"
                    />
                    <span className="text-[10px] text-gray-400 block">Padrão da bula: 7 dias</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-gray-700">
                    Dia preferencial da semana:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((d) => {
                      const isSelected = medicationDays.includes(d.id)
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDay(d.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-xs font-semibold border transition',
                            isSelected
                              ? 'bg-[#FCE4EC] border-[#F43F8E] text-[#F43F8E]'
                              : 'bg-white border-gray-200 text-gray-600',
                          )}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lembrete de Água */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F4F6] border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-sm text-[#1F1A1D]">Alerta Periódico de Água</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={waterEnabled}
                  onChange={(e) => setWaterEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
              </label>
            </div>

            {waterEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200 animate-fade-in text-xs">
                <div className="space-y-1">
                  <label htmlFor={waterIntervalId} className="block font-semibold text-gray-700">
                    Intervalo (minutos):
                  </label>
                  <input
                    id={waterIntervalId}
                    type="number"
                    value={waterInterval}
                    onChange={(e) => setWaterInterval(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={waterStartId} className="block font-semibold text-gray-700">
                    Início do dia:
                  </label>
                  <input
                    id={waterStartId}
                    type="time"
                    value={waterStartTime}
                    onChange={(e) => setWaterStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={waterEndId} className="block font-semibold text-gray-700">
                    Fim do dia:
                  </label>
                  <input
                    id={waterEndId}
                    type="time"
                    value={waterEndTime}
                    onChange={(e) => setWaterEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#F43F8E] hover:bg-[#D63370] text-white font-bold text-xs rounded-2xl shadow-md btn-tap-scale transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Preferências de Lembrete</span>
          </button>
        </form>
      </div>

      {/* SEÇÃO 3: PERSONALIZAÇÃO — TOM DE ROSA PRINCIPAL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card-soft space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-[#FCE4EC] text-[#F43F8E] flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base text-[#1F1A1D]">Paleta de Cores do App</h2>
            <p className="text-xs text-gray-500">
              Escolha o tom de rosa predominante da sua interface.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = selectedTheme === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedTheme(opt.id)
                  updateProfile({ pinkTheme: opt.id })
                  triggerToast(`Tema alterado para ${opt.name}!`)
                }}
                className={cn(
                  'p-4 rounded-2xl border text-left transition-all chip-scale flex items-center gap-3',
                  isSelected
                    ? 'border-[#F43F8E] bg-[#FCE4EC]/40 shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50',
                )}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-sm shrink-0 border-2 border-white"
                  style={{ backgroundColor: opt.primary }}
                />
                <div>
                  <span className="font-bold text-xs text-[#1F1A1D] block">{opt.name}</span>
                  <span className="text-[10px] text-gray-500">{opt.desc}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* SEÇÃO 3.5: EXPORTAR RELATÓRIO CLÍNICO */}
      <div className="bg-gradient-to-r from-white to-[#FCE4EC]/50 rounded-3xl p-6 sm:p-8 border border-[#F9A8C9]/40 shadow-card-soft space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FCE4EC] text-[#F43F8E] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1F1A1D]">
                Exportar Relatório para Consulta Médica
              </h2>
              <p className="text-xs text-gray-500">
                Gere um documento pronto para imprimir ou salvar em PDF com todas as suas doses,
                sintomas e pesagens
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMedicalReportModal(true)}
            className="px-5 py-2.5 bg-[#F43F8E] hover:bg-[#D63370] text-white font-bold text-xs rounded-2xl shadow-md btn-tap-scale transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Relatório Clínico</span>
          </button>
        </div>
      </div>

      {/* SEÇÃO 4: ZONA DE PERIGO — RESETAR DADOS */}
      <div className="bg-red-50/50 rounded-3xl p-6 border border-red-200 space-y-3">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="font-bold text-base">Gerenciamento de Dados Locais</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Se desejar recomeçar seu tratamento ou limpar todas as doses, medidas corporais, registros
          de água e anotações gravadas neste navegador:
        </p>
        <button
          type="button"
          onClick={() => setResetModalStep(1)}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Apagar todos os dados do TEREZA</span>
        </button>
      </div>

      {/* MODAL ETAPA 1 DE CONFIRMAÇÃO */}
      {resetModalStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-100 text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1F1A1D]">Tem certeza?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Esta ação apagará todo o histórico de doses, gráficos e refeições armazenados no seu
                dispositivo.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalStep(0)}
                className="py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setResetModalStep(2)}
                className="py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ETAPA 2 FINAL DE CONFIRMAÇÃO */}
      {resetModalStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-200 text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-600">Confirmação Final</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Ao clicar abaixo, o localStorage será limpo e a aplicação será restaurada aos dados
                padrão de fábrica.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalStep(0)}
                className="py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={resetAllData}
                className="py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Apagar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO RELATÓRIO MÉDICO IMPRIMÍVEL */}
      <MedicalReportModal
        isOpen={showMedicalReportModal}
        onClose={() => setShowMedicalReportModal(false)}
      />
    </div>
  )
}
