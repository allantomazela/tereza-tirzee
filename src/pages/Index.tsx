import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Syringe,
  Droplets,
  Scale,
  Calendar,
  Clock,
  ArrowRight,
  TrendingDown,
  Sparkles,
  BookOpen,
  ChevronRight,
  Activity,
  HeartPulse,
  FileText,
} from 'lucide-react'
import { useTereza } from '@/context/TerezaContext'
import { formatNumberBr, formatDateFriendly, formatDateBr, getGreeting } from '@/lib/formatters'
import CircularProgress from '@/components/CircularProgress'
import FloatingActionButton from '@/components/FloatingActionButton'
import MedicalReportModal from '@/components/MedicalReportModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    profile,
    nextDoseInfo,
    currentWeight,
    weightProgressPercent,
    todayNutrition,
    doses,
    diaryEntries,
    currentWeekSummary,
  } = useTereza()

  const [showWeekModal, setShowWeekModal] = useState(false)
  const [showMedicalReportModal, setShowMedicalReportModal] = useState(false)
  const { greeting, subtitle } = getGreeting()

  // Percentual de hidratação
  const waterPercent = Math.min(
    100,
    Math.round((todayNutrition.waterMl / (todayNutrition.waterGoalMl || 2000)) * 100),
  )

  // Últimas 5 doses
  const recentDoses = doses.slice(0, 5)
  // Últimas 3 anotações
  const recentDiary = diaryEntries.slice(0, 3)

  return (
    <div className="space-y-7 pb-12">
      {/* 1. SAUDAÇÃO PERSONALIZADA & BOTÃO EXPORTAR RELATÓRIO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1A1D]">
            {greeting}, {profile.name?.split(' ')[0] || 'Usuária'} 👋
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMedicalReportModal(true)}
            className="px-4 py-2 bg-white hover:bg-[#FCE4EC] text-[#F43F8E] font-bold text-xs rounded-2xl border border-[#F9A8C9] shadow-xs transition-all flex items-center gap-2 btn-tap-scale"
          >
            <FileText className="w-4 h-4 text-[#F43F8E]" />
            <span>Exportar Relatório Médico</span>
          </button>
          <div className="hidden lg:flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-[#E5E7EB] text-xs text-[#6B7280] shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#F43F8E]" />
            <span>{formatDateFriendly(new Date().toISOString().split('T')[0])}</span>
          </div>
        </div>
      </div>

      {/* 2. CARD PRINCIPAL — PRÓXIMA DOSE (Gradiente Rosa) */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#F9A8C9] via-[#F43F8E] to-[#D63370] text-white shadow-xl shadow-[#F43F8E]/25">
        {/* Efeitos decorativos de fundo */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-4 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
        <Syringe className="absolute -right-4 -bottom-4 w-40 h-40 text-white/10 pointer-events-none transform -rotate-12" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wider uppercase">
                Próxima Dose
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#F43F8E] text-xs font-bold shadow-xs">
                {nextDoseInfo.mgDose} mg • {nextDoseInfo.units} UI (
                {formatNumberBr(nextDoseInfo.units / 100, 2)} ml)
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {formatDateFriendly(nextDoseInfo.dateStr)}
              </h2>
              <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                <Clock className="w-4 h-4" />
                <span>Horário recomendado: {nextDoseInfo.timeStr}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/85 max-w-md">
              Mantenha o intervalo regular para estabilidade plasmática do medicamento.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/doses"
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#F43F8E] hover:bg-[#FCE4EC] active:scale-95 text-sm font-bold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Syringe className="w-4 h-4 text-[#F43F8E]" />
              <span>Registrar Dose</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO PROGRESSO RÁPIDO — MINI-CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mini-card Água do Dia */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E7EB] shadow-card-soft hover:shadow-card-hover transition-all flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#6B7280]">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Hidratação de Hoje
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1F1A1D]">
                {formatNumberBr(todayNutrition.waterMl / 1000, 2)} L
                <span className="text-xs font-medium text-[#6B7280] ml-1">
                  / {formatNumberBr((todayNutrition.waterGoalMl || 2000) / 1000, 1)} L
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {waterPercent >= 100
                  ? 'Meta atingida! Parabéns 🎉'
                  : `Faltam ${formatNumberBr(Math.max(0, (todayNutrition.waterGoalMl || 2000) - todayNutrition.waterMl) / 1000, 2)} L para a meta`}
              </p>
            </div>
            <Link
              to="/nutricao"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F43F8E] hover:underline pt-1"
            >
              <span>Adicionar +</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CircularProgress
            percentage={waterPercent}
            size={96}
            strokeWidth={8}
            color="#3B82F6"
            centerContent={
              <div className="text-center">
                <Droplets className="w-4 h-4 text-blue-500 mx-auto" />
                <span className="text-xs font-bold text-[#1F1A1D]">{waterPercent}%</span>
              </div>
            }
          />
        </div>

        {/* Mini-card Progresso de Peso */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E7EB] shadow-card-soft hover:shadow-card-hover transition-all flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#6B7280]">
              <div className="w-8 h-8 rounded-xl bg-[#FCE4EC] text-[#F43F8E] flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Progresso de Peso
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1F1A1D]">
                {formatNumberBr(currentWeight, 1)} kg
                <span className="text-xs font-medium text-[#6B7280] ml-1">
                  (Meta: {formatNumberBr(profile.targetWeight, 1)} kg)
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>
                  -{formatNumberBr(profile.initialWeight - currentWeight, 1)} kg eliminados
                </span>
              </div>
            </div>
            <Link
              to="/medidas"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F43F8E] hover:underline pt-1"
            >
              <span>Atualizar +</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CircularProgress
            percentage={weightProgressPercent}
            size={96}
            strokeWidth={8}
            gradientId="weightProgressGrad"
            centerContent={
              <div className="text-center">
                <Scale className="w-4 h-4 text-[#F43F8E] mx-auto" />
                <span className="text-xs font-bold text-[#1F1A1D]">{weightProgressPercent}%</span>
              </div>
            }
          />
        </div>
      </div>

      {/* 4. CARD RELATÓRIO DA SEMANA (Agrupamento ISO) */}
      <div className="bg-gradient-to-r from-white to-[#FCE4EC]/40 rounded-3xl p-5 sm:p-6 border border-[#F9A8C9]/40 shadow-card-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F43F8E]/10 text-[#F43F8E] flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#1F1A1D]">
                  Relatório da Semana
                </h3>
                {currentWeekSummary && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FCE4EC] text-[#F43F8E] rounded-full">
                    Semana {currentWeekSummary.weekNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {currentWeekSummary
                  ? `${currentWeekSummary.doses.length} dose(s) • ${currentWeekSummary.symptoms.length} tipo(s) de sintomas • Peso: ${currentWeekSummary.currentWeightKg ? `${formatNumberBr(currentWeekSummary.currentWeightKg, 1)} kg` : 'N/D'}`
                  : 'Nenhum registro para esta semana ainda.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWeekModal(true)}
            className="self-start sm:self-center px-4 py-2 bg-white hover:bg-[#FCE4EC] text-[#F43F8E] text-xs font-bold rounded-xl border border-[#F9A8C9] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Ver detalhes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. HISTÓRICO RECENTE: DOSES E ANOTAÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Doses */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FCE4EC] text-[#F43F8E] flex items-center justify-center">
                <Syringe className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-[#1F1A1D]">Últimas Doses</h3>
            </div>
            <Link
              to="/doses"
              className="text-xs font-semibold text-[#F43F8E] hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentDoses.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B7280]">
              Nenhuma dose registrada ainda.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentDoses.map((dose) => (
                <div
                  key={dose.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F4F6] hover:bg-[#FCE4EC]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#F43F8E] flex items-center justify-center shadow-xs">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1F1A1D]">
                        {dose.units} UI {dose.mgDose ? `(${dose.mgDose} mg)` : ''} •{' '}
                        {formatNumberBr(dose.units / 100, 2)} ml
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        Local: <span className="font-medium text-[#1F1A1D]">{dose.site}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-medium text-[#1F1A1D]">
                      {formatDateBr(dose.date)}
                    </div>
                    <div className="text-[10px] text-[#6B7280]">{dose.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas Anotações do Diário */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-[#1F1A1D]">Anotações Recentes</h3>
            </div>
            <Link
              to="/diario"
              className="text-xs font-semibold text-[#F43F8E] hover:underline flex items-center gap-1"
            >
              <span>Abrir diário</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentDiary.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B7280]">
              Nenhuma anotação registrada ainda.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentDiary.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => navigate('/diario')}
                  className="p-3 rounded-2xl bg-[#F7F4F6] hover:bg-[#FCE4EC]/30 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1F1A1D]">{formatDateBr(entry.date)}</span>
                    <span className="text-[10px] text-[#F43F8E] font-medium">
                      {entry.symptoms.length} sintoma(s)
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                    {entry.notes || 'Sem anotações de texto livre.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALHES DA SEMANA (ISO) */}
      {showWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#FCE4EC] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#FCE4EC] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#1F1A1D]">
                  Relatório da Semana {currentWeekSummary?.weekNumber}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Visão consolidada de doses, sintomas e peso
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWeekModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Doses */}
              <div className="p-3.5 rounded-2xl bg-[#FCE4EC]/40 border border-[#F9A8C9]/30">
                <div className="font-bold text-sm text-[#F43F8E] mb-2 flex items-center gap-1.5">
                  <Syringe className="w-4 h-4" />
                  <span>Doses Aplicadas</span>
                </div>
                {currentWeekSummary?.doses && currentWeekSummary.doses.length > 0 ? (
                  <ul className="space-y-1 text-[#1F1A1D]">
                    {currentWeekSummary.doses.map((d) => (
                      <li key={d.id} className="flex justify-between">
                        <span>
                          {formatDateBr(d.date)} às {d.time} ({d.site}):
                        </span>
                        <span className="font-semibold">
                          {d.units} un ({d.mgDose || 5.0} mg)
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#6B7280]">Nenhuma dose registrada nesta semana.</p>
                )}
              </div>

              {/* Sintomas */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="font-bold text-sm text-amber-800 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Sintomas Registrados</span>
                </div>
                {currentWeekSummary?.symptoms && currentWeekSummary.symptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {currentWeekSummary.symptoms.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-full bg-white text-amber-900 border border-amber-200 text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum sintoma atípico registrado.</p>
                )}
              </div>

              {/* Variação de Peso */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <div className="font-bold text-sm text-emerald-800 mb-2 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>Variação de Peso</span>
                </div>
                <div className="flex items-center justify-between text-[#1F1A1D]">
                  <span>Peso registrado na semana:</span>
                  <span className="font-bold">
                    {currentWeekSummary?.currentWeightKg
                      ? `${formatNumberBr(currentWeekSummary.currentWeightKg, 1)} kg`
                      : 'Nenhuma medição'}
                  </span>
                </div>
                {currentWeekSummary?.weightChangeKg !== null &&
                  currentWeekSummary?.weightChangeKg !== undefined && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mt-1">
                      <span>Variação líquida:</span>
                      <span>
                        {currentWeekSummary.weightChangeKg > 0 ? '+' : ''}
                        {formatNumberBr(currentWeekSummary.weightChangeKg, 1)} kg
                      </span>
                    </div>
                  )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWeekModal(false)}
              className="w-full py-3 bg-[#F43F8E] hover:bg-[#D63370] text-white font-bold rounded-2xl text-xs shadow-md transition-colors"
            >
              Fechar Resumo
            </button>
          </div>
        </div>
      )}

      {/* 6. MODAL DO RELATÓRIO MÉDICO IMPRIMÍVEL */}
      <MedicalReportModal
        isOpen={showMedicalReportModal}
        onClose={() => setShowMedicalReportModal(false)}
      />

      {/* 7. BOTÃO FLUTUANTE RADIAL */}
      <FloatingActionButton />
    </div>
  )
}
