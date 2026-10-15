import { useState, useMemo } from 'react'
import {
  FileText,
  Printer,
  Calendar,
  Syringe,
  Scale,
  Sparkles,
  Droplets,
  BookOpen,
  X,
  User,
  HeartPulse,
} from 'lucide-react'
import { useTereza } from '@/context/TerezaContext'
import {
  formatNumberBr,
  formatDateBr,
  calculateIMC,
  getImcClassification,
  getTodayDateString,
} from '@/lib/formatters'

interface MedicalReportModalProps {
  isOpen: boolean
  onClose: () => void
}

type PeriodFilter = '7days' | '30days' | '90days' | 'all'

export default function MedicalReportModal({ isOpen, onClose }: MedicalReportModalProps) {
  const {
    profile,
    doses,
    measurements,
    diaryEntries,
    todayNutrition,
    currentWeight,
    weeklySummaries,
    calculateMgFromUnits,
  } = useTereza()

  const [period, setPeriod] = useState<PeriodFilter>('30days')

  // Filtra dados conforme o período escolhido
  const filteredData = useMemo(() => {
    const today = new Date()
    let daysToSubtract = 30
    if (period === '7days') daysToSubtract = 7
    if (period === '90days') daysToSubtract = 90
    if (period === 'all') daysToSubtract = 3650

    const cutoffDate = new Date()
    cutoffDate.setDate(today.getDate() - daysToSubtract)
    const cutoffStr = cutoffDate.toISOString().split('T')[0]

    const filteredDoses = doses.filter((d) => d.date >= cutoffStr)
    const filteredMeasurements = measurements.filter((m) => m.date >= cutoffStr)
    const filteredDiary = diaryEntries.filter((e) => e.date >= cutoffStr)

    // Agrupamento de sintomas por semana
    const symptomsByWeek = weeklySummaries
      .filter((w) => w.startDate >= cutoffStr || w.endDate >= cutoffStr)
      .map((w) => ({
        week: w.weekNumber,
        year: w.year,
        symptoms: w.symptoms,
      }))

    // Variação de peso no período
    let weightStart = profile.initialWeight
    let weightEnd = currentWeight
    if (filteredMeasurements.length > 0) {
      const oldestInPeriod = filteredMeasurements[filteredMeasurements.length - 1]
      const newestInPeriod = filteredMeasurements[0]
      weightStart = oldestInPeriod.weightKg
      weightEnd = newestInPeriod.weightKg
    }
    const weightDiff = Math.round((weightEnd - weightStart) * 10) / 10

    const initialIMC = calculateIMC(weightStart, profile.heightCm)
    const currentIMC = calculateIMC(weightEnd, profile.heightCm)

    return {
      doses: filteredDoses,
      measurements: filteredMeasurements,
      diary: filteredDiary,
      symptomsByWeek,
      weightStart,
      weightEnd,
      weightDiff,
      initialIMC,
      currentIMC,
      cutoffStr,
    }
  }, [
    period,
    doses,
    measurements,
    diaryEntries,
    weeklySummaries,
    profile.initialWeight,
    profile.heightCm,
    currentWeight,
  ])

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const todayFormatted = formatDateBr(getTodayDateString())
  const startPeriodFormatted = formatDateBr(filteredData.cutoffStr)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-[#FCE4EC] my-auto space-y-6 max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:m-0 print:p-4">
        {/* BARRA SUPERIOR (OCULTA NA IMPRESSÃO) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FCE4EC] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F43F8E] to-[#D63370] text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1F1A1D]">Relatório para Consulta Médica</h2>
              <p className="text-xs text-[#6B7280]">
                Documento formatado para acompanhamento com seu endocrinologista
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de período */}
            <div className="flex items-center gap-1 bg-[#F7F4F6] p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPeriod('7days')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  period === '7days' ? 'bg-[#F43F8E] text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                7 dias
              </button>
              <button
                type="button"
                onClick={() => setPeriod('30days')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  period === '30days' ? 'bg-[#F43F8E] text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                30 dias
              </button>
              <button
                type="button"
                onClick={() => setPeriod('90days')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  period === '90days' ? 'bg-[#F43F8E] text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                90 dias
              </button>
              <button
                type="button"
                onClick={() => setPeriod('all')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  period === 'all' ? 'bg-[#F43F8E] text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                Tudo
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#F43F8E] hover:bg-[#D63370] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CORPO DO RELATÓRIO IMPRESSO / VISUALIZADO */}
        <div className="space-y-6 text-[#1F1A1D] print:space-y-4">
          {/* CABEÇALHO CLÍNICO DO RELATÓRIO */}
          <div className="flex items-start justify-between border-b-2 border-[#F43F8E] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#F43F8E] tracking-tight">TEREZA</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#FCE4EC] text-[#F43F8E] font-bold">
                  Relatório Clínico de Acompanhamento
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tratamento com Tirzepatida • Registro do Paciente
              </p>
            </div>

            <div className="text-right text-xs text-gray-600 space-y-0.5">
              <div>
                <strong>Data de emissão:</strong> {todayFormatted}
              </div>
              <div>
                <strong>Período avaliado:</strong> {startPeriodFormatted} a {todayFormatted}
              </div>
            </div>
          </div>

          {/* DADOS DO PACIENTE */}
          <div className="p-4 rounded-2xl bg-[#F7F4F6] border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block">Paciente:</span>
              <strong className="text-sm text-[#1F1A1D]">{profile.name}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Idade / Gênero:</span>
              <strong>
                {profile.age} anos •{' '}
                {profile.gender === 'female'
                  ? 'Feminino'
                  : profile.gender === 'male'
                    ? 'Masculino'
                    : 'Outro'}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Altura / Meta:</span>
              <strong>
                {profile.heightCm} cm • Meta: {formatNumberBr(profile.targetWeight, 1)} kg
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Dose prescrita atual:</span>
              <strong className="text-[#F43F8E]">
                {profile.currentPenMg || 5} mg ({profile.mgPer100Units || 25} mg/ml)
              </strong>
            </div>
          </div>

          {/* RESUMO EXECUTIVO: PESO, IMC E VARIAÇÃO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF5F8] to-[#FCE4EC]/50 border border-[#F9A8C9]/50">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                Evolução do Peso
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#1F1A1D]">
                  {formatNumberBr(filteredData.weightEnd, 1)} kg
                </span>
                <span className="text-xs text-gray-500">
                  (Início: {formatNumberBr(filteredData.weightStart, 1)} kg)
                </span>
              </div>
              <div
                className={`text-xs font-bold mt-1 ${
                  filteredData.weightDiff <= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {filteredData.weightDiff <= 0 ? '' : '+'}
                {formatNumberBr(filteredData.weightDiff, 1)} kg no período
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF5F8] to-[#FCE4EC]/50 border border-[#F9A8C9]/50">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                Índice de Massa Corporal (IMC)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#F43F8E]">
                  {formatNumberBr(filteredData.currentIMC, 1)}
                </span>
                <span className="text-xs text-gray-500">
                  (Inicial: {formatNumberBr(filteredData.initialIMC, 1)})
                </span>
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-1">
                Classificação: {getImcClassification(filteredData.currentIMC).category}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF5F8] to-[#FCE4EC]/50 border border-[#F9A8C9]/50">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                Hidratação Média Registrada
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-blue-600">
                  {formatNumberBr(todayNutrition.waterMl / 1000, 2)} L
                </span>
                <span className="text-xs text-gray-500">
                  / {formatNumberBr((todayNutrition.waterGoalMl || 2000) / 1000, 1)} L
                </span>
              </div>
              <div className="text-xs font-semibold text-gray-600 mt-1">
                Recomendação cumprida para o trato gastrointestinal
              </div>
            </div>
          </div>

          {/* TABELA 1: DOSES APLICADAS NO PERÍODO */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Syringe className="w-4 h-4 text-[#F43F8E]" />
              <h3 className="font-bold text-sm text-[#1F1A1D]">
                Registro de Doses Aplicadas ({filteredData.doses.length} injeções)
              </h3>
            </div>

            {filteredData.doses.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
                Nenhuma dose registrada neste período.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F4F6] border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Data</th>
                      <th className="py-2 px-3 font-semibold">Horário</th>
                      <th className="py-2 px-3 font-semibold">Dose (mg)</th>
                      <th className="py-2 px-3 font-semibold">Seringa U-100</th>
                      <th className="py-2 px-3 font-semibold">Local de Aplicação</th>
                      <th className="py-2 px-3 font-semibold">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.doses.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{formatDateBr(d.date)}</td>
                        <td className="py-2 px-3 text-gray-600">{d.time}</td>
                        <td className="py-2 px-3 font-bold text-[#F43F8E]">
                          {formatNumberBr(d.mgDose || calculateMgFromUnits(d.units), 1)} mg
                        </td>
                        <td className="py-2 px-3 font-semibold">{d.units} un</td>
                        <td className="py-2 px-3 text-gray-700">{d.site}</td>
                        <td className="py-2 px-3 text-gray-500 italic truncate max-w-xs">
                          {d.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TABELA 2: HISTÓRICO DE PESAGENS */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#F43F8E]" />
              <h3 className="font-bold text-sm text-[#1F1A1D]">
                Histórico de Medições de Peso & Composição Corporal
              </h3>
            </div>

            {filteredData.measurements.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
                Nenhuma medição registrada neste período.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F4F6] border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Data</th>
                      <th className="py-2 px-3 font-semibold">Peso (kg)</th>
                      <th className="py-2 px-3 font-semibold">IMC</th>
                      <th className="py-2 px-3 font-semibold">% Gordura</th>
                      <th className="py-2 px-3 font-semibold">Cintura (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.measurements.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{formatDateBr(m.date)}</td>
                        <td className="py-2 px-3 font-bold text-[#1F1A1D]">
                          {formatNumberBr(m.weightKg, 1)} kg
                        </td>
                        <td className="py-2 px-3 font-semibold text-gray-700">
                          {formatNumberBr(m.imc, 1)}
                        </td>
                        <td className="py-2 px-3 text-gray-600">
                          {m.fatPercentage ? `${formatNumberBr(m.fatPercentage, 1)}%` : '—'}
                        </td>
                        <td className="py-2 px-3 text-gray-600">
                          {m.waistCm ? `${m.waistCm} cm` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SINTOMAS AGRUPADOS POR SEMANA */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-[#1F1A1D]">
                Sintomas Clínicos Agrupados por Semana (ISO 8601)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {filteredData.symptomsByWeek.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl col-span-2">
                  Nenhum sintoma atípico registrado no período.
                </p>
              ) : (
                filteredData.symptomsByWeek.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-amber-900 block">
                        Semana {item.week} ({item.year})
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.symptoms.length > 0 ? (
                          item.symptoms.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[10px] font-semibold text-amber-800"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-gray-500">Sem sintomas relatados</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ANOTAÇÕES DO DIÁRIO */}
          {filteredData.diary.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#F43F8E]" />
                <h3 className="font-bold text-sm text-[#1F1A1D]">
                  Relatos e Observações do Paciente
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                {filteredData.diary.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-[#F7F4F6] border border-gray-200 space-y-1"
                  >
                    <div className="flex items-center justify-between text-gray-600">
                      <strong className="text-gray-900">{formatDateBr(entry.date)}</strong>
                      <span className="text-[10px]">
                        {entry.symptoms.length} sintoma(s) associado(s)
                      </span>
                    </div>
                    <p className="text-gray-700 italic leading-relaxed">
                      "{entry.notes || 'Apenas seleção de sintomas.'}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RODAPÉ DO DOCUMENTO MÉDICO */}
          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
            <div>
              Documento gerado automaticamente pelo aplicativo <strong>TEREZA Saúde</strong>.
              <br />
              Uso exclusivo para acompanhamento médico entre paciente e profissional de saúde.
            </div>
            <div className="text-right sm:min-w-[200px] border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="h-8 border-b border-gray-400 mb-1" />
              <span>Assinatura do Médico / Carimbo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
