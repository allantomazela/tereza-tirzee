import { useState, useMemo } from 'react'
import { Scale, Percent, Check, Info, Calendar } from 'lucide-react'
import { useTereza } from '@/context/TerezaContext'
import {
  formatNumberBr,
  formatDateBr,
  getTodayDateString,
  calculateIMC,
  getImcClassification,
} from '@/lib/formatters'
import SvgLineChart from '@/components/SvgLineChart'

export default function Medidas() {
  const { profile, measurements, addMeasurement } = useTereza()

  // Valores iniciais pré-preenchidos a partir da última medição ou do perfil
  const latestMeas = measurements[0]
  const [weightInput, setWeightInput] = useState<string>(
    latestMeas ? String(latestMeas.weightKg).replace('.', ',') : '78,5',
  )
  const [fatInput, setFatInput] = useState<string>(
    latestMeas?.fatPercentage ? String(latestMeas.fatPercentage).replace('.', ',') : '32,4',
  )
  const [waistInput, setWaistInput] = useState<string>(
    latestMeas?.waistCm ? String(latestMeas.waistCm) : '90',
  )
  const [dateInput, setDateInput] = useState<string>(getTodayDateString())

  const [toastVisible, setToastVisible] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Peso numérico para cálculo em tempo real
  const parsedWeight = useMemo(() => {
    const num = parseFloat(weightInput.replace(',', '.'))
    return isNaN(num) || num <= 0 ? 0 : num
  }, [weightInput])

  // IMC calculado em tempo real
  const currentIMC = useMemo(() => {
    return calculateIMC(parsedWeight, profile.heightCm)
  }, [parsedWeight, profile.heightCm])

  const imcClass = useMemo(() => {
    return getImcClassification(currentIMC)
  }, [currentIMC])

  // Preparação de dados para os 3 gráficos SVG
  const weightChartData = useMemo(() => {
    return measurements.map((m) => ({ date: m.date, value: m.weightKg }))
  }, [measurements])

  const imcChartData = useMemo(() => {
    return measurements.map((m) => ({ date: m.date, value: m.imc }))
  }, [measurements])

  const fatChartData = useMemo(() => {
    return measurements
      .filter((m) => m.fatPercentage !== undefined && m.fatPercentage !== null)
      .map((m) => ({ date: m.date, value: m.fatPercentage! }))
  }, [measurements])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    if (parsedWeight <= 20 || parsedWeight > 350) {
      setErrorMsg('Informe um peso válido entre 20 e 350 kg.')
      return
    }

    const parsedFat = fatInput ? parseFloat(fatInput.replace(',', '.')) : undefined
    const parsedWaist = waistInput ? parseFloat(waistInput.replace(',', '.')) : undefined

    addMeasurement({
      weightKg: parsedWeight,
      fatPercentage: parsedFat && !isNaN(parsedFat) ? parsedFat : undefined,
      waistCm: parsedWaist && !isNaN(parsedWaist) ? parsedWaist : undefined,
      date: dateInput,
    })

    setErrorMsg(null)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  return (
    <div className="space-y-7 max-w-4xl mx-auto pb-12">
      {/* TOAST DE SUCESSO (SLIDE-DOWN 3S) */}
      {toastVisible && (
        <div
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-down"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <span className="text-sm font-semibold">Medidas corporais salvas com sucesso!</span>
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1A1D]">
          Medidas Corporais & IMC
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Acompanhe de perto a evolução do seu peso, composição corporal e índice de massa.
        </p>
      </div>

      {/* CARD PRINCIPAL DE ENTRADA DE MEDIDAS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card-soft space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Campo Peso Atual */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-weight"
                className="flex items-center gap-1.5 text-xs font-bold text-gray-700"
              >
                <Scale className="w-3.5 h-3.5 text-[#F43F8E]" />
                <span>Peso Atual (kg) *</span>
              </label>
              <div className="relative">
                <input
                  id="input-weight"
                  type="text"
                  inputMode="decimal"
                  value={weightInput}
                  onChange={(e) => {
                    setWeightInput(e.target.value)
                    setErrorMsg(null)
                  }}
                  placeholder="Ex: 78,5"
                  className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-base font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-bold text-gray-400">
                  kg
                </span>
              </div>
            </div>

            {/* Campo % Massa Gorda */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-fat"
                className="flex items-center gap-1.5 text-xs font-bold text-gray-700"
              >
                <Percent className="w-3.5 h-3.5 text-[#F43F8E]" />
                <span>Massa Gorda (%)</span>
              </label>
              <div className="relative">
                <input
                  id="input-fat"
                  type="text"
                  inputMode="decimal"
                  value={fatInput}
                  onChange={(e) => setFatInput(e.target.value)}
                  placeholder="Ex: 32,4"
                  className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-base font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-bold text-gray-400">
                  %
                </span>
              </div>
            </div>

            {/* Campo Cintura (opcional) */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-waist"
                className="flex items-center gap-1.5 text-xs font-bold text-gray-700"
              >
                <span className="text-xs">📏</span>
                <span>Cintura (cm)</span>
              </label>
              <div className="relative">
                <input
                  id="input-waist"
                  type="text"
                  inputMode="decimal"
                  value={waistInput}
                  onChange={(e) => setWaistInput(e.target.value)}
                  placeholder="Ex: 90"
                  className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-base font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F43F8E]"
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-bold text-gray-400">
                  cm
                </span>
              </div>
            </div>
          </div>

          {/* Campo Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label
                htmlFor="input-date"
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600"
              >
                <Calendar className="w-3.5 h-3.5 text-[#F43F8E]" />
                <span>Data da Medição:</span>
              </label>
              <input
                id="input-date"
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-[#F7F4F6] text-xs font-medium text-gray-800"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-[#F43F8E] hover:bg-[#D63370] text-white font-bold text-sm rounded-2xl shadow-md shadow-[#F43F8E]/30 btn-tap-scale transition-all"
            >
              Salvar Medidas
            </button>
          </div>

          {errorMsg && <p className="text-xs text-red-600 font-semibold text-center">{errorMsg}</p>}
        </form>

        {/* CARD ROSA-CLARO COM IMC CALCULADO EM TEMPO REAL + ESCALA OMS */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FCE4EC]/50 border border-[#F9A8C9]/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold tracking-wide text-[#F43F8E] uppercase">
                Índice de Massa Corporal (OMS)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-[#1F1A1D]">
                  {formatNumberBr(currentIMC, 1)}
                </span>
                <span className="text-xs text-[#6B7280]">
                  kg/m² (com base na sua altura de {profile.heightCm} cm)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs ${imcClass.badgeBg} ${imcClass.badgeText}`}
              >
                {imcClass.category}
              </span>
            </div>
          </div>

          {/* MINI-ESCALA INDICADORA (OMS) */}
          <div className="space-y-1.5 pt-1">
            <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-amber-400 via-orange-400 to-red-500 overflow-hidden shadow-inner">
              {/* Divisórias sutis da escala */}
              <div className="absolute top-0 bottom-0 left-[18.5%] w-0.5 bg-white/70" />
              <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-white/70" />
              <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-white/70" />
              <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-white/70" />
            </div>

            {/* Marcador triangular do valor atual */}
            <div className="relative h-4 w-full">
              <div
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                style={{ left: `${imcClass.percentPosition}%` }}
              >
                <div className="w-0 h-0 border-x-4 border-x-transparent border-b-6 border-b-[#1F1A1D]" />
                <span className="text-[10px] font-bold text-[#1F1A1D]">
                  {formatNumberBr(currentIMC, 1)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] font-semibold text-gray-500 px-1">
              <span>&lt; 18.5 (Abaixo)</span>
              <span>18.5 - 24.9 (Normal)</span>
              <span>25 - 29.9 (Sobrepeso)</span>
              <span>30+ (Obesidade)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <Info className="w-3.5 h-3.5 text-[#F43F8E]" />
            <span>
              A redução do IMC está diretamente associada à melhora dos marcadores
              cardiometabólicos.
            </span>
          </div>
        </div>
      </div>

      {/* TRÊS GRÁFICOS DE LINHA SVG PRÓPRIOS */}
      <div className="space-y-6">
        {/* Gráfico 1: Curva de Perda de Peso */}
        <SvgLineChart
          title="Curva de Perda de Peso"
          subtitle="Evolução do peso corporal ao longo das semanas de uso"
          data={weightChartData}
          unit="kg"
          color="#F43F8E"
          gradientFrom="#F43F8E"
          gradientTo="#F9A8C9"
        />

        {/* Gráfico 2: Evolução do IMC */}
        <SvgLineChart
          title="Evolução do IMC"
          subtitle="Redução progressiva em direção à faixa de normalidade"
          data={imcChartData}
          unit="kg/m²"
          color="#D63370"
          gradientFrom="#D63370"
          gradientTo="#FCE4EC"
          referenceLines={[
            { y: 25.0, label: 'Meta Normal (24.9)', color: '#16A34A' },
            { y: 30.0, label: 'Limite Sobrepeso (29.9)', color: '#D97706' },
          ]}
        />

        {/* Gráfico 3: Redução da Massa Gorda */}
        <SvgLineChart
          title="Redução de Massa Gorda (%)"
          subtitle="Acompanhamento da composição e perda de gordura"
          data={fatChartData}
          unit="%"
          color="#FF6B9A"
          gradientFrom="#FFB6C1"
          gradientTo="#FFF5F7"
        />
      </div>

      {/* HISTÓRICO DE MEDIÇÕES EM TABELA RESUMIDA */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card-soft space-y-4">
        <h3 className="font-bold text-base text-[#1F1A1D]">Histórico de Medições</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#FCE4EC] text-[#6B7280]">
                <th className="py-2.5 px-3 font-semibold">Data</th>
                <th className="py-2.5 px-3 font-semibold">Peso</th>
                <th className="py-2.5 px-3 font-semibold">IMC</th>
                <th className="py-2.5 px-3 font-semibold">% Gordura</th>
                <th className="py-2.5 px-3 font-semibold">Cintura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {measurements.map((m) => (
                <tr key={m.id} className="hover:bg-[#F7F4F6] transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#1F1A1D]">{formatDateBr(m.date)}</td>
                  <td className="py-2.5 px-3 font-bold text-[#F43F8E]">
                    {formatNumberBr(m.weightKg, 1)} kg
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-gray-800">
                    {formatNumberBr(m.imc, 1)}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {m.fatPercentage ? `${formatNumberBr(m.fatPercentage, 1)}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {m.waistCm ? `${m.waistCm} cm` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
