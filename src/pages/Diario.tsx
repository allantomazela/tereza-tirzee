import { useState } from 'react'
import {
  Calendar,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  Bold,
  Italic,
  Underline,
  Eye,
  X,
  Plus,
} from 'lucide-react'
import { useTereza } from '@/context/TerezaContext'
import { SymptomType, DiaryEntry } from '@/types'
import { getTodayDateString, formatDateBr } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface SymptomOption {
  id: SymptomType
  label: string
  icon: string
  desc: string
}

const SYMPTOMS_LIST: SymptomOption[] = [
  { id: 'nausea', label: 'Náusea', icon: '🤢', desc: 'Enjoo gástrico' },
  { id: 'headache', label: 'Dor de cabeça', icon: '⚡', desc: 'Cefaleia ou pressão' },
  { id: 'fatigue', label: 'Fadiga', icon: '🥱', desc: 'Cansaço / baixa energia' },
  { id: 'no_appetite', label: 'Sem apetite', icon: '🍽️', desc: 'Saciedade prolongada' },
  { id: 'wellbeing', label: 'Bem-estar', icon: '🥰', desc: 'Disposição e ânimo' },
  { id: 'constipation', label: 'Constipação', icon: '💊', desc: 'Intestino lento' },
  { id: 'insomnia', label: 'Insônia', icon: '🌙', desc: 'Dificuldade para dormir' },
  { id: 'dizziness', label: 'Tontura', icon: '💫', desc: 'Leve vertigem' },
]

export default function Diario() {
  const { diaryEntries, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry } = useTereza()

  // Estados de Nova Anotação
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([])
  const [notesText, setNotesText] = useState('')
  const [entryDate, setEntryDate] = useState(getTodayDateString())
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modais
  const [viewEntry, setViewEntry] = useState<DiaryEntry | null>(null)
  const [editEntry, setEditEntry] = useState<DiaryEntry | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Alternar sintoma
  const toggleSymptom = (symptomId: SymptomType) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((s) => s !== symptomId) : [...prev, symptomId],
    )
  }

  // Barra de ferramentas de formatação simples (insere markdown ou tags visuais)
  const applyFormat = (syntax: string) => {
    setNotesText((prev) => `${prev} ${syntax}texto${syntax} `)
  }

  // Salvar nova anotação
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notesText.trim() && selectedSymptoms.length === 0) {
      triggerToast('Selecione ao menos um sintoma ou escreva um relato.')
      return
    }

    addDiaryEntry({
      date: entryDate,
      symptoms: selectedSymptoms,
      notes: notesText.trim(),
    })

    // Limpar formulário
    setSelectedSymptoms([])
    setNotesText('')
    setEntryDate(getTodayDateString())
    triggerToast('Anotação e sintomas gravados com sucesso!')
  }

  // Salvar edição
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editEntry) return

    updateDiaryEntry(editEntry.id, {
      date: editEntry.date,
      symptoms: editEntry.symptoms,
      notes: editEntry.notes,
    })

    setEditEntry(null)
    triggerToast('Anotação atualizada com sucesso!')
  }

  // Excluir anotação
  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return
    deleteDiaryEntry(deleteConfirmId)
    setDeleteConfirmId(null)
    if (viewEntry?.id === deleteConfirmId) setViewEntry(null)
    triggerToast('Anotação removida do histórico.')
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* TOAST DE CONFIRMAÇÃO */}
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
          Diário & Sintomas
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Registre como você está se sentindo para correlacionar com a dose do medicamento e relatar
          ao seu médico.
        </p>
      </div>

      {/* CARD PRINCIPAL DE ENTRADA DO DIÁRIO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card-soft space-y-7">
        {/* SEÇÃO 1: COMO VOCÊ ESTÁ SE SENTINDO? (8 CHIPS DE SINTOMAS) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-(--primary-color)" />
            <h2 className="font-bold text-base text-[#1F1A1D]">Como você está se sentindo hoje?</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SYMPTOMS_LIST.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.id)
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => toggleSymptom(sym.id)}
                  className={cn(
                    'relative p-3.5 rounded-2xl border text-left transition-all duration-200 chip-scale flex items-center justify-between',
                    isSelected
                      ? 'bg-(--primary-subtle) border-(--primary-color) text-(--primary-color) shadow-xs'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F7F4F6]',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{sym.icon}</span>
                    <div>
                      <span className="font-bold text-xs block">{sym.label}</span>
                      <span className="text-[10px] text-gray-500 hidden sm:block">{sym.desc}</span>
                    </div>
                  </div>

                  {/* Check animado no canto */}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-(--primary-color) text-white flex items-center justify-center shrink-0 animate-scale-in">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <p className="text-xs text-[#6B7280] flex items-center gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5 text-(--primary-color) shrink-0" />
            <span>
              Selecione os sintomas que teve hoje. Isso ajuda a relatar o quadro com exatidão ao seu
              médico.
            </span>
          </p>
        </div>

        {/* SEÇÃO 2: DIÁRIO LIVRE COM BARRA DE FORMATAÇÃO */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="notes-textarea" className="font-bold text-sm text-[#1F1A1D]">
                Relato do Dia (Diário Livre):
              </label>

              {/* Barra de Ferramentas Simples */}
              <div className="flex items-center gap-1 bg-[#F7F4F6] p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => applyFormat('**')}
                  title="Negrito"
                  className="p-1.5 hover:bg-white rounded-lg text-gray-600 transition"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('*')}
                  title="Itálico"
                  className="p-1.5 hover:bg-white rounded-lg text-gray-600 transition"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('__')}
                  title="Sublinhado"
                  className="p-1.5 hover:bg-white rounded-lg text-gray-600 transition"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              id="notes-textarea"
              rows={5}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Como foi seu dia? Registre sentimentos, dúvidas para o médico, relatos sobre energia, apetite e disposição..."
              className="w-full p-4 rounded-2xl border border-gray-200 bg-[#F7F4F6] text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--primary-color) transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-(--primary-color)" />
              <span className="text-xs font-semibold text-gray-600">Data:</span>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-[#F7F4F6] text-xs font-medium text-gray-800"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-(--primary-color) hover:bg-(--primary-hover) text-white font-bold text-sm rounded-2xl shadow-md shadow-(--primary-glow) btn-tap-scale transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Anotação</span>
            </button>
          </div>
        </form>
      </div>

      {/* HISTÓRICO DO DIÁRIO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1F1A1D]">Histórico de Anotações</h2>
          <span className="text-xs text-[#6B7280]">
            {diaryEntries.length} registro(s) arquivado(s)
          </span>
        </div>

        {diaryEntries.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-xs text-gray-400 border border-[#E5E7EB]">
            Nenhuma anotação registrada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diaryEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card-soft hover:shadow-card-hover transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1F1A1D]">
                      {formatDateBr(entry.date)}
                    </span>

                    {/* Botões de Ação rápida */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewEntry(entry)}
                        title="Ver detalhes"
                        className="p-1.5 hover:bg-(--primary-subtle) rounded-lg text-gray-500 hover:text-(--primary-color) transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditEntry(entry)}
                        title="Editar anotação"
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(entry.id)}
                        title="Excluir anotação"
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges de Sintomas */}
                  {entry.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {entry.symptoms.map((s) => {
                        const opt = SYMPTOMS_LIST.find((o) => o.id === s)
                        return (
                          <span
                            key={s}
                            className="px-2.5 py-0.5 rounded-full bg-(--primary-subtle) text-(--primary-color) text-[11px] font-semibold flex items-center gap-1"
                          >
                            <span>{opt?.icon || '•'}</span>
                            <span>{opt?.label || s}</span>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Preview do Texto */}
                  <p className="text-xs text-[#6B7280] line-clamp-3 leading-relaxed mt-3">
                    {entry.notes || <span className="italic">Sem notas de texto adicionadas.</span>}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Agrupado na semana ISO correspondente</span>
                  <button
                    type="button"
                    onClick={() => setViewEntry(entry)}
                    className="text-(--primary-color) font-semibold hover:underline"
                  >
                    Ler completo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: VISUALIZAÇÃO COMPLETA */}
      {viewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-(--primary-subtle-border) space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-(--primary-subtle-border) pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#1F1A1D]">
                  Anotação de {formatDateBr(viewEntry.date)}
                </h3>
                <span className="text-xs text-[#6B7280]">Registro clínico e diário</span>
              </div>
              <button
                type="button"
                onClick={() => setViewEntry(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Sintomas */}
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Sintomas Observados:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {viewEntry.symptoms.length === 0 ? (
                  <span className="text-xs text-gray-400">Nenhum sintoma marcado.</span>
                ) : (
                  viewEntry.symptoms.map((s) => {
                    const opt = SYMPTOMS_LIST.find((o) => o.id === s)
                    return (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full bg-(--primary-subtle) text-(--primary-color) text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>{opt?.icon}</span>
                        <span>{opt?.label || s}</span>
                      </span>
                    )
                  })
                )}
              </div>
            </div>

            {/* Texto Livre */}
            <div className="space-y-1 pt-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Relato do Paciente:
              </span>
              <div className="p-4 rounded-2xl bg-[#F7F4F6] text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                {viewEntry.notes || 'Sem relato por extenso.'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditEntry(viewEntry)
                  setViewEntry(null)
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setViewEntry(null)}
                className="px-5 py-2 bg-(--primary-color) hover:bg-(--primary-hover) text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIÇÃO DE ANOTAÇÃO */}
      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-(--primary-subtle-border) space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-(--primary-subtle-border) pb-3">
              <h3 className="text-base font-bold text-[#1F1A1D]">Editar Anotação</h3>
              <button
                type="button"
                onClick={() => setEditEntry(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Sintomas:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SYMPTOMS_LIST.map((sym) => {
                    const isSelected = editEntry.symptoms.includes(sym.id)
                    return (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? editEntry.symptoms.filter((s) => s !== sym.id)
                            : [...editEntry.symptoms, sym.id]
                          setEditEntry({ ...editEntry, symptoms: updated })
                        }}
                        className={cn(
                          'p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition',
                          isSelected
                            ? 'bg-(--primary-subtle) border-(--primary-color) text-(--primary-color)'
                            : 'bg-white border-gray-200 text-gray-600',
                        )}
                      >
                        <span>{sym.icon}</span>
                        <span>{sym.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Texto do relato:
                </label>
                <textarea
                  rows={4}
                  value={editEntry.notes}
                  onChange={(e) => setEditEntry({ ...editEntry, notes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-[#F7F4F6] text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Data:</label>
                <input
                  type="date"
                  value={editEntry.date}
                  onChange={(e) => setEditEntry({ ...editEntry, date: e.target.value })}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-[#F7F4F6] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditEntry(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-(--primary-color) hover:bg-(--primary-hover) text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-100 text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#1F1A1D]">Excluir anotação?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Esta ação removerá permanentemente o relato e os sintomas do seu histórico local.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
