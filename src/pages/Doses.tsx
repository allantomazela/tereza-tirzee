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
  const {
    addDose,
    doses,
    nextDoseInfo,
    profile,
    concentrationMgMl,
    calculateMgFromUnits,
    calculateUnitsFromMg,
    calculateMlFromUnits,
  } = useTereza()

  // Estados do formulário de dose
  const initialUnits = nextDoseInfo.units || (profile.currentPenMg === 15 ? 17 : 20)
  const [units, setUnits] = useState<number>(initialUnits)
  const [manualInput, setManualInput] = useState<string>(String(initialUnits))
  const [showManual, setShowManual] = useState<boolean>(false)
  const [site, setSite] = useState<InjectionSite>('Barriga')
  const [date, setDate] = useState<string>(getTodayDateString())
  const [time, setTime] = useState<string>(getCurrentTimeString())
  const [notes, setNotes] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [numberPulsing, setNumberPulsing] = useState(false)

  const dateInputId = useId()
  const timeInputId = useId()
  const manualInputId = useId()

  // Converte unidades para dose em mg conforme a concentração prescrita
  const calculatedMg = calculateMgFromUnits(units)
  const calculatedMl = calculateMlFromUnits(units)

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

    // Salva no contexto e localStorage com unidades e mg calculados
    addDose({
      date,
      time,
      units,
      site,
      mgDose: calculatedMg,
      notes: notes.trim() || undefined,
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
    const resetUnits = calculateUnitsFromMg(5.0)
    setUnits(resetUnits)
    setManualInput(String(resetUnits))
    setDate(getTodayDateString())
    setTime(getCurrentTimeString())
    setSite('Barriga')
    setNotes('')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
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

      {/* 1) SERINGA NO TOPO (LARGURA TOTAL, GRANDE E VISÍVEL) */}
      <div className="w-full">
        <SyringeAnimation
          units={units}
          maxUnits={60}
          mgEquivalent={calculatedMg}
          mlEquivalent={calculatedMl}
          onSelectOfficialDose={(item) => handleSliderChange(item.units)}
        />
      </div>

      {/* 2) PAINEL DE CONTROLE DE DOSE LOGO ABAIXO DA SERINGA */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E5E7EB] shadow-card-soft space-y-6">
        {/* PARTE DE INSERIR O VALOR (CONTADOR + SLIDER + ATALHOS + MANUAL) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
            {/* CONTADOR GRANDE */}
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Dose Selecionada
              </span>
              <div className="inline-flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-4xl sm:text-5xl font-black tracking-tight text-[#F43F8E] transition-transform duration-150 inline-block',
                    numberPulsing && 'scale-110 text-[#D63370]',
                  )}
                >
                  {formatNumberBr(units, units % 1 === 0 ? 0 : 1)}
                </span>
                <span className="text-base sm:text-lg font-extrabold text-[#6B7280] uppercase tracking-wide">
                  UI (unidades)
                </span>
              </div>
            </div>

            {/* EQUIVALÊNCIAS EM MG E ML */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
              <span className="px-3 py-1.5 rounded-2xl bg-[#FCE4EC] text-[#F43F8E] text-xs sm:text-sm font-extrabold shadow-2xs">
                ≈ {formatNumberBr(calculatedMg, calculatedMg % 1 === 0 ? 0 : 2)} mg de Tirzepatida
              </span>
              <span className="px-2.5 py-1.5 rounded-2xl bg-blue-50 text-blue-600 text-xs font-bold">
                {formatNumberBr(calculatedMl, 2)} ml
              </span>
              <span className="text-[11px] text-[#6B7280] block sm:inline">
                (Caneta {profile.currentPenMg || 15} mg • {concentrationMgMl} mg/ml)
              </span>
            </div>
          </div>

          {/* CONTROLE DESLIZANTE (SLIDER 0 - 60) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#6B7280]">
              <span>0 UI (0 ml)</span>
              <span className="text-[#F43F8E] font-black text-sm">
                Puxar êmbolo até: {formatNumberBr(units, 1)} UI ({formatNumberBr(calculatedMl, 2)}{' '}
                ml)
              </span>
              <span>60 UI (0,6 ml)</span>
            </div>

            <div className="relative py-1">
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

            {/* ATALHOS RÁPIDOS DE DOSES CLÍNICAS (TABELA OFICIAL) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                <span>Atalhos rápidos do fracionamento oficial:</span>
                <span className="text-[#F43F8E] font-medium normal-case">
                  Ampola {profile.currentPenMg || 15} mg / 0,5 ml
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { mgVal: 2.5, unVal: 8, color: '#6B7280' },
                  { mgVal: 5.0, unVal: 17, color: '#8B5CF6' },
                  { mgVal: 7.5, unVal: 25, color: '#10B981' },
                  { mgVal: 10.0, unVal: 33, color: '#EC4899' },
                  { mgVal: 12.5, unVal: 42, color: '#3B82F6' },
                  { mgVal: 15.0, unVal: 50, color: '#F97316' },
                ].map(({ mgVal, unVal, color }) => {
                  const isSelected = Math.abs(units - unVal) < 0.25
                  return (
                    <button
                      key={mgVal}
                      type="button"
                      onClick={() => handleSliderChange(unVal)}
                      className={cn(
                        'px-3 py-2 rounded-2xl text-xs font-bold transition-all btn-tap-scale flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer border',
                        isSelected
                          ? 'text-white shadow-md'
                          : 'bg-[#F7F4F6] text-[#1F1A1D] hover:bg-[#FCE4EC] border-gray-200',
                      )}
                      style={{
                        backgroundColor: isSelected ? color : undefined,
                        borderColor: isSelected ? color : undefined,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : color }}
                      />
                      <span>{mgVal} mg</span>
                      <span className="text-[11px] opacity-85">({unVal} UI)</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* BOTÃO PARA INSERIR MANUALMENTE */}
            <div className="text-center sm:text-left pt-1">
              <button
                type="button"
                onClick={() => setShowManual(!showManual)}
                className="text-xs font-semibold text-[#F43F8E] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>
                  {showManual
                    ? 'Ocultar digitação manual'
                    : 'Prefere digitar o número? Clique aqui'}
                </span>
              </button>
            </div>

            {/* CAMPO NUMÉRICO SINCRONIZADO BIDIRECIONALMENTE */}
            {showManual && (
              <div className="p-3.5 rounded-2xl bg-[#F7F4F6] border border-[#E5E7EB] space-y-2 animate-fade-in max-w-sm">
                <label
                  htmlFor={manualInputId}
                  className="block text-xs font-semibold text-gray-700"
                >
                  Digite a dose em unidades UI (0 a 60):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={manualInputId}
                    type="text"
                    inputMode="decimal"
                    value={manualInput}
                    onChange={(e) => handleManualChange(e.target.value)}
                    placeholder="Ex: 17"
                    className={cn(
                      'w-full px-3.5 py-2 text-center text-lg font-black bg-white rounded-xl border focus:outline-none focus:ring-2',
                      errorMsg
                        ? 'border-red-500 text-red-600 focus:ring-red-400'
                        : 'border-gray-300 text-[#1F1A1D] focus:ring-[#F43F8E]',
                    )}
                  />
                  <span className="text-xs font-extrabold text-gray-500">UI</span>
                </div>
                {errorMsg && (
                  <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>
            )}
          </div>
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

        {/* DATA, HORA E OBSERVAÇÃO */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Observações clínicas / sensações da aplicação (opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Aplicação sem dor, leve vermelhidão local, transição para nova dose..."
              className="w-full px-3.5 py-2 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
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
            Mantenha as seringas e o medicamento em temperatura adequada conforme a bula (2°C a 8°C
            antes do uso).
          </p>
        </div>
      </div>

      {/* HISTÓRICO DE TITULAÇÃO E DOSES APLICADAS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card-soft space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FCE4EC] text-[#F43F8E] flex items-center justify-center">
              <Syringe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1F1A1D]">Histórico de Doses & Titulação</h2>
              <p className="text-xs text-gray-500">
                Acompanhamento da progressão em unidades e miligramas (mg)
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FCE4EC] text-[#F43F8E]">
            {doses.length} registro(s)
          </span>
        </div>

        {/* Linha do tempo de titulação se houver plano */}
        {profile.titrationPlan && profile.titrationPlan.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF5F8] to-[#FCE4EC]/30 border border-[#F9A8C9]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F43F8E] uppercase tracking-wide">
                Plano de Titulação Registrado
              </span>
              <button
                type="button"
                onClick={() => navigate('/perfil')}
                className="text-[11px] font-semibold text-[#F43F8E] hover:underline"
              >
                Gerenciar no Perfil →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {profile.titrationPlan.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3 rounded-xl bg-white border border-[#F9A8C9]/40 shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500">Etapa {idx + 1}</span>
                    <span className="text-xs font-extrabold text-[#F43F8E]">
                      {step.targetMg} mg
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-gray-800">
                    A partir de{' '}
                    {getTodayDateString() === step.date
                      ? 'Hoje'
                      : step.date.split('-').reverse().join('/')}
                  </div>
                  {step.notes && (
                    <div className="text-[10px] text-gray-500 line-clamp-1">{step.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela detalhada de todas as doses */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#FCE4EC] text-[#6B7280]">
                <th className="py-2.5 px-3 font-semibold">Data / Hora</th>
                <th className="py-2.5 px-3 font-semibold">Dose em mg</th>
                <th className="py-2.5 px-3 font-semibold">Seringa (UI)</th>
                <th className="py-2.5 px-3 font-semibold">Local</th>
                <th className="py-2.5 px-3 font-semibold">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doses.map((dose) => (
                <tr key={dose.id} className="hover:bg-[#F7F4F6] transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#1F1A1D]">
                    <div>{dose.date.split('-').reverse().join('/')}</div>
                    <div className="text-[10px] text-gray-400">{dose.time}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#FCE4EC] text-[#F43F8E] font-bold text-xs inline-block">
                      {formatNumberBr(dose.mgDose || calculateMgFromUnits(dose.units), 1)} mg
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {formatNumberBr(calculateMlFromUnits(dose.units), 2)} ml
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-gray-800">{dose.units} un</td>
                  <td className="py-2.5 px-3 text-gray-600 font-medium">{dose.site}</td>
                  <td className="py-2.5 px-3 text-gray-500 italic max-w-xs truncate">
                    {dose.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                Dose de <strong className="text-[#F43F8E]">{units} UI</strong> ({calculatedMg} mg •{' '}
                {calculatedMl.toFixed(2)} ml) no local{' '}
                <strong className="text-[#1F1A1D]">{site}</strong> gravada com sucesso.
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
