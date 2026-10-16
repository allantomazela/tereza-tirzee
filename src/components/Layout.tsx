import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Syringe,
  Scale,
  UtensilsCrossed,
  BookOpen,
  UserCircle,
  Sparkles,
  Droplets,
  Bell,
  X,
} from 'lucide-react'
import { useTereza } from '@/context/TerezaContext'
import { MOTIVATIONAL_PHRASES } from '@/lib/mockData'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; fill?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/doses', label: 'Doses', icon: Syringe },
  { to: '/medidas', label: 'Medidas', icon: Scale },
  { to: '/nutricao', label: 'Nutrição', icon: UtensilsCrossed },
  { to: '/diario', label: 'Diário', icon: BookOpen },
  { to: '/perfil', label: 'Perfil', icon: UserCircle },
]

export default function Layout() {
  const location = useLocation()
  const { isWaterReminderDue, dismissWaterAlert, nextDoseInfo } = useTereza()
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [showDoseBanner, setShowDoseBanner] = useState(true)

  // Rola ao topo ao mudar de rota
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Frase motivacional aleatória no mount
  useEffect(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)
    setQuoteIndex(idx)
  }, [])

  return (
    <div className="flex min-h-screen bg-[#F7F4F6] text-[#1F1A1D]">
      {/* SIDEBAR DESKTOP & TABLET */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30 bg-white border-r border-[#E5E7EB] w-20 lg:w-64 transition-all duration-300">
        {/* LOGO */}
        <div className="h-20 flex items-center px-4 lg:px-6 border-b border-gray-100 bg-white">
          <NavLink
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color) rounded-lg"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-(--primary-color) to-(--primary-hover) flex items-center justify-center text-white shadow-md shadow-(--primary-glow) group-hover:scale-105 transition-transform shrink-0">
              <Syringe className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div className="hidden lg:flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#0F172A]">TEREZA</span>
                <span className="w-2 h-2 rounded-full bg-(--primary-color) shadow-2xs" />
              </div>
              <span className="text-[10px] font-semibold text-[#64748B] tracking-wider uppercase">
                Saúde & Bem-estar
              </span>
            </div>
          </NavLink>
        </div>

        {/* NAVEGAÇÃO DESKTOP / TABLET */}
        <nav className="flex-1 py-6 px-3 lg:px-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive: active }) =>
                  cn(
                    'flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)',
                    active
                      ? 'bg-(--primary-subtle) text-(--primary-color) font-semibold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F1A1D] hover:bg-[#F7F4F6]',
                  )
                }
              >
                {({ isActive: active }) => (
                  <>
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                        active
                          ? 'text-(--primary-color)'
                          : 'text-[#6B7280] group-hover:text-(--primary-color)',
                      )}
                    >
                      <Icon
                        className="w-5 h-5 transition-transform group-hover:scale-110"
                        strokeWidth={1.8}
                        fill={active ? 'currentColor' : 'none'}
                      />
                    </div>
                    <span className="hidden lg:inline-block tracking-normal">{item.label}</span>
                    {active && (
                      <span className="hidden lg:block ml-auto w-1.5 h-4 rounded-full bg-(--primary-color)" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* CARD MOTIVACIONAL NO RODAPÉ (Desktop) */}
        <div className="hidden lg:block p-4 m-3 rounded-2xl bg-gradient-to-br from-(--primary-subtle) to-(--primary-light)/40 border border-(--primary-subtle-border)">
          <div className="flex items-center gap-2 mb-2 text-(--primary-color)">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">Inspiração do dia</span>
          </div>
          <p className="text-xs text-[#1F1A1D]/80 leading-relaxed italic">
            "{MOTIVATIONAL_PHRASES[quoteIndex]}"
          </p>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col md:pl-20 lg:pl-64 min-w-0 pb-24 md:pb-8">
        {/* HEADER MOBILE SUPERIOR (LOGO TEREZA VISÍVEL EM 0-768px) */}
        <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color) rounded-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-(--primary-color) to-(--primary-hover) flex items-center justify-center text-white shadow-sm shadow-(--primary-glow)">
              <Syringe className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black tracking-tight text-[#0F172A]">TEREZA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-(--primary-color)" />
              <span className="text-[10px] font-medium text-[#64748B] ml-1 uppercase tracking-wider">
                Saúde
              </span>
            </div>
          </NavLink>

          <NavLink
            to="/perfil"
            className="p-1.5 rounded-xl hover:bg-gray-100 text-[#64748B] transition-colors"
            aria-label="Meu Perfil"
          >
            <UserCircle className="w-5 h-5 text-[#475569]" />
          </NavLink>
        </header>

        {/* BANNERS DE NOTIFICAÇÃO INTERNA */}
        <div className="sticky top-12 md:top-0 z-20 px-4 sm:px-6 pt-3 space-y-2 max-w-4xl mx-auto w-full">
          {/* Lembrete de Dose Hoje */}
          {nextDoseInfo.isToday && showDoseBanner && (
            <div
              role="alert"
              className="bg-gradient-to-r from-(--primary-color) to-(--primary-hover) text-white p-3.5 sm:p-4 rounded-2xl shadow-lg shadow-(--primary-glow) flex items-center justify-between gap-3 animate-fade-in-down"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Hora da sua dose hoje!</h4>
                  <p className="text-xs text-white/90">
                    Sua aplicação de {nextDoseInfo.mgDose} mg ({nextDoseInfo.units} UI) está
                    programada para hoje.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <NavLink
                  to="/doses"
                  className="px-3 py-1.5 bg-white text-(--primary-color) text-xs font-semibold rounded-xl hover:bg-white/90 transition shadow-xs"
                >
                  Aplicar
                </NavLink>
                <button
                  type="button"
                  onClick={() => setShowDoseBanner(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 transition"
                  aria-label="Fechar lembrete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Lembrete de Água */}
          {isWaterReminderDue && (
            <div
              role="alert"
              className="bg-amber-500 text-white p-3.5 sm:p-4 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-fade-in-down"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Hora de beber água! 💧</h4>
                  <p className="text-xs text-white/90">
                    A hidratação é fundamental para o sucesso do tratamento com Tirzepatida.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <NavLink
                  to="/nutricao"
                  className="px-3 py-1.5 bg-white text-amber-700 text-xs font-semibold rounded-xl hover:bg-white/90 transition shadow-xs"
                >
                  Registrar
                </NavLink>
                <button
                  type="button"
                  onClick={dismissWaterAlert}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 transition"
                  aria-label="Fechar lembrete de água"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTEÚDO PRINCIPAL COM TRANSIÇÃO */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* BARRA INFERIOR FIXA FLUTUANTE (MOBILE 0-640px) */}
      <nav
        aria-label="Navegação mobile"
        className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-md rounded-3xl border border-(--primary-subtle) shadow-xl shadow-black/8 px-2 py-2 flex items-center justify-around"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive: active }) =>
                cn(
                  'relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-150',
                  'active:scale-90 focus:outline-none',
                )
              }
            >
              {({ isActive: active }) => (
                <>
                  {active && (
                    <span className="absolute inset-0 bg-(--primary-subtle) rounded-2xl scale-100 transition-transform" />
                  )}
                  <Icon
                    className={cn(
                      'relative z-10 w-5 h-5 transition-transform duration-150',
                      active ? 'text-(--primary-color) scale-110' : 'text-[#6B7280]',
                    )}
                    strokeWidth={1.8}
                    fill={active ? 'currentColor' : 'none'}
                  />
                  {active && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-(--primary-color) z-10" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
