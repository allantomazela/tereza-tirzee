import { useState } from 'react'
import {
  Droplets,
  RotateCcw,
  Settings2,
  CheckCircle2,
  Coffee,
  Sun,
  Moon,
  Apple,
  Leaf,
  Smile,
  AlertTriangle,
  Save,
  Check,
} from 'lucide-react'
import { useTereza } from '@/context/TerezaContext'
import { MealType, MealQuality, MealRecord } from '@/types'
import { formatNumberBr } from '@/lib/formatters'
import WaterBottleAnimation from '@/components/WaterBottleAnimation'
import { cn } from '@/lib/utils'

interface MealCardConfig {
  type: MealType
  title: string
  icon: React.ComponentType<{ className?: string }>
}

const MEAL_CONFIGS: MealCardConfig[] = [
  { type: 'breakfast', title: 'Café da Manhã', icon: Coffee },
  { type: 'lunch', title: 'Almoço', icon: Sun },
  { type: 'dinner', title: 'Jantar', icon: Moon },
  { type: 'snacks', title: 'Lanches', icon: Apple },
]

export default function Nutricao() {
  const { todayNutrition, addWater, undoLastWater, setWaterGoal, saveMeal } = useTereza()

  // Estados locais da garrafa e toasts
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalInput, setGoalInput] = useState<string>(
    String((todayNutrition.waterGoalMl || 2000) / 1000).replace('.', ','),
  )
  const [splashEffect, setSplashEffect] = useState(false)

  // Estado das refeições locais do dia
  const [mealsState, setMealsState] = useState<Record<MealType, MealRecord>>({
    breakfast: todayNutrition.meals.breakfast || { type: 'breakfast' },
    lunch: todayNutrition.meals.lunch || { type: 'lunch' },
    dinner: todayNutrition.meals.dinner || { type: 'dinner' },
    snacks: todayNutrition.meals.snacks || { type: 'snacks' },
  })

  const [savedMealsToast, setSavedMealsToast] = useState(false)

  const currentWaterMl = todayNutrition.waterMl
  const goalWaterMl = todayNutrition.waterGoalMl || 2000
  const isGoalReached = currentWaterMl >= goalWaterMl

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleAddWater = (ml: number) => {
    addWater(ml)
    setSplashEffect(true)
    setTimeout(() => setSplashEffect(false), 500)
    triggerToast(`+${ml} ml adicionados com sucesso! 💧`)
  }

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(goalInput.replace(',', '.'))
    if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 6.0) {
      setWaterGoal(Math.round(parsed * 1000))
      setShowGoalModal(false)
      triggerToast(`Nova meta definida: ${formatNumberBr(parsed, 1)} L`)
    }
  }

  const handleUpdateMeal = (type: MealType, updates: Partial<MealRecord>) => {
    setMealsState((prev) => ({
      ...prev,
      [type]: { ...prev[type], ...updates },
    }))
  }

  const handleSaveAllMeals = () => {
    Object.values(mealsState).forEach((meal) => {
      saveMeal(meal)
    })
    setSavedMealsToast(true)
    setTimeout(() => setSavedMealsToast(false), 3000)
  }

  // Contagem do resumo diário
  const qualityCounts = {
    healthy: Object.values(mealsState).filter((m) => m.quality === 'healthy').length,
    moderate: Object.values(mealsState).filter((m) => m.quality === 'moderate').length,
    excessive: Object.values(mealsState).filter((m) => m.quality === 'excessive').length,
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* TOAST DE FEEDBACK */}
      {(toastMsg || savedMealsToast) && (
        <div
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-down"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <span className="text-sm font-semibold">
            {toastMsg || 'Diário alimentar salvo com sucesso!'}
          </span>
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1A1D]">
          Nutrição & Hidratação
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Acompanhe seu consumo de água e a qualidade das refeições com atenção à saciedade.
        </p>
      </div>

      {/* SEÇÃO 1: HIDRATAÇÃO — GARRAFA INTERATIVA COM ANIMAÇÃO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card-soft">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#1F1A1D]">Hidratação Diária</h2>
              <span className="text-xs text-[#6B7280]">
                Prevenção de constipação e náuseas da medicação
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-[#F7F4F6] transition"
            title="Alterar meta de água"
          >
            <Settings2 className="w-3.5 h-3.5 text-(--primary-color)" />
            <span className="hidden sm:inline">Meta: {formatNumberBr(goalWaterMl / 1000, 1)}L</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
          {/* Garrafa SVG à esquerda */}
          <div className="relative">
            <WaterBottleAnimation currentMl={currentWaterMl} goalMl={goalWaterMl} />
            {/* Splash animado em volta da garrafa */}
            {splashEffect && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-4 border-(--primary-color)/40 animate-ping" />
              </div>
            )}
          </div>

          {/* Contador Central & Botões de Ação */}
          <div className="space-y-6 text-center md:text-left">
            <div>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span
                  className={cn(
                    'text-4xl sm:text-5xl font-black tracking-tight transition-colors',
                    isGoalReached ? 'text-[#16A34A]' : 'text-(--primary-color)',
                  )}
                >
                  {formatNumberBr(currentWaterMl / 1000, 2)} L
                </span>
                <span className="text-lg font-bold text-[#6B7280]">
                  / {formatNumberBr(goalWaterMl / 1000, 1)} L
                </span>
              </div>

              {isGoalReached ? (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold animate-bounce">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Meta diária batida! Excelente trabalho!</span>
                </div>
              ) : (
                <p className="text-xs text-[#6B7280] mt-1">
                  Faltam {formatNumberBr(Math.max(0, goalWaterMl - currentWaterMl) / 1000, 2)} L
                  para atingir a recomendação do dia.
                </p>
              )}
            </div>

            {/* BOTÕES CIRCULARES DE ADIÇÃO (+250ml, +500ml, +1L) */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Adicionar Água Rapidamente:
              </span>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => handleAddWater(250)}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-(--primary-subtle) hover:bg-(--primary-light)/40 text-(--primary-color) flex flex-col items-center justify-center gap-1 shadow-sm btn-tap-scale transition-all"
                >
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-bold">+250 ml</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddWater(500)}
                  style={{
                    background: `linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)`,
                    boxShadow: `0 6px 18px var(--primary-glow)`,
                  }}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl text-white flex flex-col items-center justify-center gap-1 btn-tap-scale transition-all"
                >
                  <Droplets className="w-5 h-5" />
                  <span className="text-xs font-bold">+500 ml</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddWater(1000)}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex flex-col items-center justify-center gap-1 shadow-md shadow-blue-500/20 btn-tap-scale transition-all"
                >
                  <Droplets className="w-5 h-5" />
                  <span className="text-xs font-bold">+1.0 L</span>
                </button>
              </div>
            </div>

            {/* Botão de desfazer / remover último */}
            <div className="pt-1">
              <button
                type="button"
                onClick={undoLastWater}
                disabled={currentWaterMl <= 0}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 disabled:opacity-40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Desfazer últimos 250 ml</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: ALIMENTAÇÃO — RASTREADOR DE REFEIÇÕES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#1F1A1D]">Diário Alimentar do Dia</h2>
            <p className="text-xs text-[#6B7280]">
              Avalie cada refeição e o nível de saciedade gerado pela Tirzepatida.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAllMeals}
            className="self-start sm:self-center px-6 py-2.5 bg-(--primary-color) hover:bg-(--primary-hover) text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 btn-tap-scale"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Diário Alimentar</span>
          </button>
        </div>

        {/* 4 CARDS DE REFEIÇÕES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEAL_CONFIGS.map((cfg) => {
            const Icon = cfg.icon
            const meal = mealsState[cfg.type]

            // Borda colorida conforme classificação
            const borderClass =
              meal.quality === 'healthy'
                ? 'border-emerald-300'
                : meal.quality === 'moderate'
                  ? 'border-amber-300'
                  : meal.quality === 'excessive'
                    ? 'border-red-300'
                    : 'border-[#E5E7EB]'

            return (
              <div
                key={cfg.type}
                className={cn(
                  'bg-white rounded-3xl p-5 border shadow-card-soft space-y-4 transition-all',
                  borderClass,
                )}
              >
                {/* Título do Card */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-(--primary-subtle) text-(--primary-color) flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1F1A1D]">{cfg.title}</h3>
                </div>

                {/* 3 Chips de Classificação */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Classificação:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Saudável */}
                    <button
                      type="button"
                      onClick={() => handleUpdateMeal(cfg.type, { quality: 'healthy' })}
                      className={cn(
                        'py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all chip-scale',
                        meal.quality === 'healthy'
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      <Leaf className="w-3 h-3 text-emerald-600" />
                      <span>Saudável</span>
                    </button>

                    {/* Moderada */}
                    <button
                      type="button"
                      onClick={() => handleUpdateMeal(cfg.type, { quality: 'moderate' })}
                      className={cn(
                        'py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all chip-scale',
                        meal.quality === 'moderate'
                          ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      <Smile className="w-3 h-3 text-amber-600" />
                      <span>Moderada</span>
                    </button>

                    {/* Exagerada */}
                    <button
                      type="button"
                      onClick={() => handleUpdateMeal(cfg.type, { quality: 'excessive' })}
                      className={cn(
                        'py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all chip-scale',
                        meal.quality === 'excessive'
                          ? 'bg-red-100 border-red-400 text-red-800 shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Exagerada</span>
                    </button>
                  </div>
                </div>

                {/* Nível de Saciedade (1 a 5) com transição de cor vermelho -> verde */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Sensação de Saciedade (1 a 5):
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {meal.satiety ? `${meal.satiety}/5` : 'Não definida'}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const isSelected = meal.satiety === lvl
                      // Cores de 1 (pouca saciedade/fome alta) a 5 (saciedade plena)
                      const colors = [
                        'bg-red-500',
                        'bg-orange-500',
                        'bg-amber-500',
                        'bg-lime-500',
                        'bg-emerald-600',
                      ]
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleUpdateMeal(cfg.type, { satiety: lvl })}
                          className={cn(
                            'py-2 rounded-xl text-xs font-bold transition-all border',
                            isSelected
                              ? `${colors[lvl - 1]} text-white border-transparent shadow-sm scale-105`
                              : 'bg-[#F7F4F6] text-gray-700 border-gray-200 hover:bg-(--primary-subtle)',
                          )}
                        >
                          {lvl}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 px-1">
                    <span>1: Muita fome</span>
                    <span>5: Totalmente saciada</span>
                  </div>
                </div>

                {/* Nota da Refeição */}
                <div className="space-y-1">
                  <textarea
                    rows={2}
                    value={meal.notes || ''}
                    onChange={(e) => handleUpdateMeal(cfg.type, { notes: e.target.value })}
                    placeholder="O que comeu? Ex: Salada verde, peito de frango grelhado..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-[#F7F4F6] text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-(--primary-color) resize-none"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CARD RESUMO DAS REFEIÇÕES DO DIA */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E7EB] shadow-card-soft">
        <h3 className="font-bold text-sm text-[#1F1A1D] mb-3">Resumo das Refeições de Hoje</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="block text-2xl font-black text-emerald-700">
              {qualityCounts.healthy}
            </span>
            <span className="text-xs font-semibold text-emerald-800">Saudáveis</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="block text-2xl font-black text-amber-700">
              {qualityCounts.moderate}
            </span>
            <span className="text-xs font-semibold text-amber-800">Moderadas</span>
          </div>

          <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
            <span className="block text-2xl font-black text-red-700">
              {qualityCounts.excessive}
            </span>
            <span className="text-xs font-semibold text-red-800">Exageradas</span>
          </div>
        </div>
      </div>

      {/* MODAL CONFIGURAR META DE ÁGUA */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-(--primary-subtle-border) space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1F1A1D]">Definir Meta de Água</h3>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Meta diária (em Litros):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="2,0"
                    className="w-full px-3 py-2 text-center text-xl font-bold bg-[#F7F4F6] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
                  />
                  <span className="font-bold text-gray-500">L</span>
                </div>
              </div>

              {/* Atalhos rápidos */}
              <div className="flex justify-center gap-2">
                {[1.5, 2.0, 2.5, 3.0].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setGoalInput(String(v).replace('.', ','))}
                    className="px-2.5 py-1 text-xs rounded-lg bg-(--primary-subtle) text-(--primary-color) font-semibold hover:bg-(--primary-light)/40"
                  >
                    {v}L
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-(--primary-color) hover:bg-(--primary-hover) text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Salvar Meta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
