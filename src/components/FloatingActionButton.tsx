import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Syringe, Droplets, Scale, BookOpen, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FabAction {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  color: string
}

const ACTIONS: FabAction[] = [
  { label: 'Nova Dose', to: '/doses', icon: Syringe, color: 'bg-[#F43F8E]' },
  { label: 'Registrar Água', to: '/nutricao', icon: Droplets, color: 'bg-blue-500' },
  { label: 'Atualizar Peso', to: '/medidas', icon: Scale, color: 'bg-emerald-500' },
  { label: 'Nova Anotação', to: '/diario', icon: BookOpen, color: 'bg-amber-500' },
]

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className="fixed bottom-20 md:bottom-8 right-5 z-40">
      {/* Backdrop para fechar ao clicar fora */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-xs transition-opacity z-10"
        />
      )}

      {/* Menu Radial / Vertical */}
      <div className="relative z-20 flex flex-col items-end gap-3">
        {open && (
          <div className="flex flex-col items-end gap-2.5 mb-1 animate-fade-in-up">
            {ACTIONS.map((action, idx) => {
              const Icon = action.icon
              return (
                <button
                  key={action.to}
                  onClick={() => handleNavigate(action.to)}
                  className="flex items-center gap-3 bg-white text-[#1F1A1D] px-3.5 py-2 rounded-2xl shadow-lg border border-[#FCE4EC] hover:bg-[#FCE4EC]/50 transition-all group btn-tap-scale"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <span className="text-xs font-semibold tracking-wide text-gray-700 group-hover:text-[#F43F8E]">
                    {action.label}
                  </span>
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm',
                      action.color,
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Botão Central Rosa Choque */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fechar ações rápidas' : 'Ações rápidas'}
          className={cn(
            'w-14 h-14 rounded-full bg-gradient-to-tr from-[#F43F8E] to-[#D63370] text-white flex items-center justify-center shadow-lg shadow-[#F43F8E]/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#F9A8C9]',
            open && 'rotate-45',
          )}
        >
          {open ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" strokeWidth={2.4} />}
        </button>
      </div>
    </div>
  )
}
