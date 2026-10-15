import { useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Syringe,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Check,
} from 'lucide-react'
import { useTereza } from '@/context/TerezaContext'
import { InjectionSite } from '@/types'
import { getTodayDateString, getCurrentTimeString, formatNumberBr } from '@/lib/formatters'
import SyringeAnimation from '@/components/SyringeAnimation'
import { cn } from '@/lib/utils'

const SITES: { label: InjectionSite; desc: string; icon: string }[] = [
  { label: 'Braço', desc: 'Face posterior do braço', icon: '💪' },
  { label: 'Barriga', desc: 'Região periumbilical (>5cm)', icon: '🩺' },
  { label: 'Coxa', desc: 'Face anterolateral da coxa', icon: '🦵' },
]

export default function Doses() {
  const navigate = useNavigate()
  const { addDose, nextDoseInfo } = useTereza()

  // Estados do formulário de dose
  const [units, setUnits] = useState<number>(nextDoseInfo.units || 20)
  const [manualInput, setManualInput] = useState<string>(String(nextDoseInfo.units || 20))
  const [showManual, setShowManual] = useState<boolean>(false)
  const [site, setSite] = useState<InjectionSite>('Barriga')
  const [date, setDate] = useState<string>(getTodayDateString())
  const [time, setTime] = useState<string>(getCurrentTimeString())
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [numberPulsing, setNumberPulsing] = useState(false)

  const dateInputId = useId()
  const timeInputId = useId()
  const manualInputId = useId()

  // Converte unidades para dose aproximada em mg (ex: frasco 10mg/ml, 0.1ml = 10un = 2.5mg ou escala padrão)
  // Fórmula padrão clínica: 10 unidades = 2.5 mg, 20 unidades = 5 mg, 30 = 7.5 mg, 40 = 10 mg, 60 = 15 mg
  const estimatedMg = Math.round(units * 0.25 * 10) / 10

  const handleSliderChange = (newVal: number) => {
    setUnits(newVal)
    setManualInput(String(newVal))
    setErrorMsg(null)
    triggerNumberPulse()
  }

  const handleManualChange = (valStr: string) => {
    setManualInput(valStr)
    const normalized = valStr.replace(',', '.')
    const parsed = parseFloat(normalized)

    if (valStr.trim() === '') {
      setErrorMsg('Informe um valor de unidades')
      return
    }

    if (isNaN(parsed) || parsed < 0 || parsed > 60) {
      setErrorMsg('A dose deve estar entre 0 e 60 unidades')
      return
    }

    // Máximo 2 casas decimais
    const parts = normalized.split('.')
    if (parts.length > 1 && parts[1].length > 2) {
      setErrorMsg('Máximo de 2 casas decimais permitido')
      return
    }

    setErrorMsg(null)
    setUnits(parsed)
    triggerNumberPulse()
  }

  const triggerNumberPulse = () => {
    setNumberPulsing(true)
    setTimeout(() => setNumberPulsing(false), 200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (units <= 0 || units > 60) {
      setErrorMsg('Selecione uma dose válida entre 0,5 e 60 unidades.')
      return
    }

    setIsSubmitting(true)

    // Salva no contexto e localStorage
    addDose({
      date,
      time,
      units,
      site,
      mgDose: estimatedMg,
    })

    setIsSubmitting(false)
    setShowConfirmModal(true)
    setShowToast(true)

    // Remove toast após 3s
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const handleResetForm = () => {
    setShowConfirmModal(false)
    setUnits(20)
    setManualInput('20')
    setDate(getTodayDateString())
    setTime(getCurrentTimeString())
    setSite('Barriga')
  }

  return (
    <div className="space-y-7 max-w-3xl mx-auto pb-12">
      {/* TOAST DE SUCESSO (SLIDE-DOWN 3S) */}
      {showToast && (
        <div
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-down"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <span className="text-sm font-semibold">Aplicação registrada com sucesso!</span>
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1A1D]">
          Registrar Dose
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Ajuste a seringa graduada até a dose prescrita pelo seu médico.
        </p>
      </div>

      {/* CARD CENTRAL — SERINGA ANIMADA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card-soft space-y-7">
        {/* CONTADOR GRANDE COM PULO DE ESCALA */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-baseline gap-2">
            <span
              className={cn(
                'text-5xl sm:text-6xl font-black tracking-tight text-[#F43F8E] transition-transform duration-150 inline-block',
                numberPulsing && 'scale-115 text-[#D63370]',
              )}
            >
              {formatNumberBr(units, units % 1 === 0 ? 0 : 1)}
            </span>
            <span className="text-lg sm:text-xl font-bold text-[#6B7280] uppercase tracking-wide">
              unidades
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FCE4EC] text-[#F43F8E] text-xs font-bold">
              ≈ {formatNumberBr(estimatedMg, 1)} mg de Tirzepatida
            </span>
          </div>
        </div>

        {/* ILUSTRAÇÃO DA SERINGA (WOW FEATURE) */}
        <SyringeAnimation units={units} maxUnits={60} />

        {/* CONTROLE DESLIZANTE (SLIDER 0 - 60) */}
        <div className="space-y-4 max-w-xl mx-auto px-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#6B7280]">
            <span>0 un</span>
            <span className="text-[#F43F8E]">Dose selecionada: {formatNumberBr(units, 1)} un</span>
            <span>60 un</span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="60"
              step="0.5"
              value={units}
              aria-label="Ajustar unidades da dose"
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="w-full h-3 bg-[#FCE4EC] rounded-lg appearance-none cursor-pointer accent-[#F43F8E] focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
            />
          </div>

          {/* ATALHOS RÁPIDOS DE DOSES CLÍNICAS */}
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            {[10, 20, 30, 40, 50, 60].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleSliderChange(val)}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all btn-tap-scale',
                  units === val
                    ? 'bg-[#F43F8E] text-white shadow-sm'
                    : 'bg-[#F7F4F6] text-[#6B7280] hover:bg-[#FCE4EC] hover:text-[#F43F8E]',
                )}
              >
                {val} un ({val * 0.25}mg)
              </button>
            ))}
          </div>

          {/* BOTÃO PARA INSERIR MANUALMENTE */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowManual(!showManual)}
              className="text-xs font-semibold text-[#F43F8E] hover:underline"
            >
              {showManual ? 'Ocultar digitação manual' : 'Inserir valor manualmente'}
            </button>
          </div>

          {/* CAMPO NUMÉRICO SINCRONIZADO BIDIRECIONALMENTE */}
          {showManual && (
            <div className="p-4 rounded-2xl bg-[#F7F4F6] border border-[#E5E7EB] space-y-2 animate-fade-in max-w-xs mx-auto">
              <label
                htmlFor={manualInputId}
                className="block text-xs font-semibold text-gray-700 text-center"
              >
                Digite as unidades (0 a 60):
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={manualInputId}
                  type="text"
                  inputMode="decimal"
                  value={manualInput}
                  onChange={(e) => handleManualChange(e.target.value)}
                  placeholder="Ex: 20"
                  className={cn(
                    'w-full px-3 py-2 text-center text-lg font-bold bg-white rounded-xl border focus:outline-none focus:ring-2',
                    errorMsg
                      ? 'border-red-500 text-red-600 focus:ring-red-400'
                      : 'border-gray-300 text-[#1F1A1D] focus:ring-[#F43F8E]',
                  )}
                />
                <span className="text-xs font-bold text-gray-500">un</span>
              </div>
              {errorMsg && (
                <div className="flex items-center justify-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SELEÇÃO DO LOCAL DA APLICAÇÃO */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="block text-sm font-bold text-[#1F1A1D] text-center sm:text-left">
            Local da Aplicação (reveze os pontos):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SITES.map((s) => {
              const isSelected = site === s.label
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSite(s.label)}
                  className={cn(
                    'p-3.5 rounded-2xl border text-left transition-all duration-200 chip-scale flex items-center sm:flex-col sm:items-start justify-between sm:justify-center gap-2',
                    isSelected
                      ? 'bg-[#FCE4EC] border-[#F43F8E] text-[#F43F8E] shadow-sm'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F7F4F6]',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-bold text-sm tracking-tight">{s.label}</span>
                  </div>
                  <span className="text-[11px] opacity-80 sm:mt-1">{s.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* DATA E HORA DA APLICAÇÃO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label
              htmlFor={dateInputId}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700"
            >
              <Calendar className="w-3.5 h-3.5 text-[#F43F8E]" />
              <span>Data da Aplicação</span>
            </label>
            <input
              id={dateInputId}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={timeInputId}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700"
            >
              <Clock className="w-3.5 h-3.5 text-[#F43F8E]" />
              <span>Horário da Aplicação</span>
            </label>
            <input
              id={timeInputId}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
            />
          </div>
        </div>

        {/* BOTÃO PRINCIPAL "REGISTRAR APLICAÇÃO" */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !!errorMsg}
            className="w-full max-w-md mx-auto block py-4 px-6 bg-gradient-to-r from-[#F43F8E] to-[#D63370] hover:opacity-95 text-white font-bold text-base rounded-2xl shadow-lg shadow-[#F43F8E]/30 btn-tap-scale transition-all duration-150 disabled:opacity-50"
          >
            Registrar Aplicação
          </button>
        </div>

        {/* ORIENTAÇÃO CLÍNICA RÁPIDA */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#FCE4EC]/40 border border-[#F9A8C9]/30 text-xs text-[#1F1A1D]/80">
          <HelpCircle className="w-4 h-4 text-[#F43F8E] shrink-0 mt-0.5" />
          <p>
            Recomenda-se alternar os locais de injeção a cada semana para evitar lipodistrofia.
            Mantenha as seringas e o medicamento em temperatura adequada conforme a bula.
          </p>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO COM CHECK ANIMADO E BOUNCE */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#FCE4EC] text-center space-y-6 animate-scale-in">
            {/* Ícone de check em círculo com bounce */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#16A34A]/20 animate-ping opacity-75" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#16A34A] to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1F1A1D]">
                Aplicação Registrada!
              </h3>
              <p className="text-sm text-[#6B7280]">
                Dose de <strong className="text-[#F43F8E]">{units} unidades</strong> ({estimatedMg}{' '}
                mg) no local <strong className="text-[#1F1A1D]">{site}</strong> gravada com sucesso.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F4F6] text-xs text-[#6B7280] space-y-1">
              <div>
                Data e horário:{' '}
                <span className="font-semibold text-[#1F1A1D]">
                  {date} às {time}
                </span>
              </div>
              <div className="text-emerald-700 font-medium">
                A próxima dose no seu Dashboard já foi recalculada!
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="py-3 px-4 bg-[#F43F8E] hover:bg-[#D63370] text-white text-xs font-bold rounded-2xl shadow-md transition-colors"
              >
                Concluir e Ir ao Início
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="py-3 px-4 bg-white border border-[#E5E7EB] hover:bg-[#F7F4F6] text-gray-700 text-xs font-semibold rounded-2xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Registrar outra</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
