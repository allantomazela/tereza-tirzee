import { useMemo, useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2, Info } from 'lucide-react'
import {
  OFFICIAL_15MG_FRACTIONATION,
  findClosestOfficialDose,
  OfficialFractionationDose,
} from '@/lib/fractionation'
import { cn } from '@/lib/utils'

interface SyringeAnimationProps {
  units: number // 0 a 60 unidades
  maxUnits?: number
  mgEquivalent?: number
  mlEquivalent?: number
  onSelectOfficialDose?: (dose: OfficialFractionationDose) => void
}

/**
 * Seringa de Insulina 0,5 ml / 50 UI com Agulha Fixa Ultrafina — ORIENTAÇÃO HORIZONTAL
 *
 * Inclui:
 * 1. Marcas oficiais coloridas de fracionamento da ampola de 15 mg/0,5 ml (8, 17, 25, 33, 42, 50 UI)
 * 2. Realce no ponto exato onde puxar quando a dose atual coincide ou se aproxima da marca oficial
 * 3. Tag flutuante com indicador "Ponto exato" nas doses oficiais
 * 4. Painel-legenda interativo "Fracionamento ampola de 15mg/0,5ml" com as 6 doses coloridas
 * 5. Agulha fixa com bisel metálico, tampa laranja alternável, êmbolo com pega à direita
 */
export default function SyringeAnimation({
  units,
  maxUnits = 60,
  mgEquivalent,
  mlEquivalent,
  onSelectOfficialDose,
}: SyringeAnimationProps) {
  // Limites seguros
  const safeUnits = Math.max(0, Math.min(maxUnits, units))

  // Estado da capa protetora de agulha (tampa laranja de agulha fixa)
  const [showCap, setShowCap] = useState<boolean>(false)

  // Verifica se o valor atual coincide com uma dose oficial (tolerância 0.6 UI)
  const matchedOfficial = useMemo(() => {
    return findClosestOfficialDose(safeUnits, 0.6)
  }, [safeUnits])

  const isExactHit = matchedOfficial !== null && Math.abs(safeUnits - matchedOfficial.units) <= 0.25

  // =========================================================================
  // SISTEMA DE COORDENADAS DO SVG HORIZONTAL:
  // viewBox: "0 0 1140 240"
  // Eixo Y central da seringa: 120
  // Cilindro útil: barrelTop = 92, barrelBottom = 148, altura = 56
  // barrelStartX = 210, barrelEndX = 645
  // Escala graduada (zero a 50 UI):
  //   * 0 UNITS: x = 224
  //   * 50 UNITS: x = 554 (distância útil = 330px -> 6.6px por unidade)
  //   * 60 UNITS (limite máximo): x = 620
  // =========================================================================

  const barrelCenterY = 120
  const barrelHeight = 56
  const barrelTop = barrelCenterY - barrelHeight / 2 // 92
  const barrelBottom = barrelCenterY + barrelHeight / 2 // 148
  const barrelStartX = 210
  const barrelEndX = 645

  // Escala graduada
  const scaleZeroX = 224
  const scale50X = 554
  const scaleLength50 = scale50X - scaleZeroX // 330px
  const scalePerUnit = scaleLength50 / 50 // 6.6px por unidade

  // Posição do pistão (desloca para a direita conforme units aumenta — puxando o remédio)
  const pistonFrontX = scaleZeroX + safeUnits * scalePerUnit
  const liquidWidth = Math.max(0, pistonFrontX - barrelStartX)

  // Dimensões do pistão de vedação laranja
  const pistonWidth = 26
  const pistonBackX = pistonFrontX + pistonWidth

  // Haste rígida do êmbolo e apoio de polegar
  const rodLength = 450
  const thumbBaseX = pistonBackX + rodLength

  // Gerador das marcas da escala comum (0 a 60 UNITS)
  const scaleMarks = useMemo(() => {
    const marks = []
    for (let u = 0; u <= 60; u += 1) {
      const x = scaleZeroX + u * scalePerUnit
      const isLabeled = u % 5 === 0 && u >= 5 && u <= 50
      const isFive = u % 5 === 0
      const isOne = !isFive
      const isBeyond50 = u > 50

      marks.push({
        unit: u,
        x,
        isLabeled,
        isFive,
        isOne,
        isBeyond50,
        tickHeight: isFive ? 13 : 6.5,
      })
    }
    return marks
  }, [scaleZeroX, scalePerUnit])

  // Posições X das marcas oficiais de fracionamento
  const officialGuideMarks = useMemo(() => {
    return OFFICIAL_15MG_FRACTIONATION.map((item) => {
      const x = scaleZeroX + item.units * scalePerUnit
      const isCurrent = matchedOfficial?.units === item.units
      return {
        ...item,
        x,
        isCurrent,
      }
    })
  }, [scaleZeroX, scalePerUnit, matchedOfficial])

  return (
    <div className="w-full flex flex-col items-center select-none space-y-4">
      {/* CARD DA SERINGA */}
      <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-white to-[#FCE4EC]/30 rounded-3xl p-3 sm:p-5 border border-[#F9A8C9]/40 shadow-inner">
        {/* Barra superior de status e controles do modelo */}
        <div className="flex items-center justify-between px-1 sm:px-3 pb-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span className="text-[#1F1A1D] font-bold">Seringa de Insulina 0,5 ml | 50 UI</span>
              <span className="text-[#F43F8E] font-medium hidden sm:inline">
                • Guia Oficial de Fracionamento 15 mg
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {matchedOfficial && (
              <span
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs animate-fade-in"
                style={{
                  backgroundColor: matchedOfficial.badgeBg,
                  color: matchedOfficial.badgeText,
                  border: `1px solid ${matchedOfficial.border}`,
                }}
              >
                <CheckCircle2 className="w-3 h-3" />
                Ponto Exato: {matchedOfficial.label} ({matchedOfficial.units} UI)
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowCap(!showCap)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#EA580C] hover:text-[#C2410C] px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200/60 hover:bg-orange-100/60 transition shadow-2xs cursor-pointer"
              title={showCap ? 'Remover tampa para visualizar agulha' : 'Colocar tampa de proteção'}
            >
              {showCap ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span className="hidden sm:inline">Tirar tampa laranja</span>
                  <span className="sm:hidden">Tirar tampa</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span className="hidden sm:inline">Colocar tampa laranja</span>
                  <span className="sm:hidden">Tampa</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ALERTA MOBILE DE PONTO EXATO QUANDO ATIVO */}
        {matchedOfficial && (
          <div
            className="sm:hidden mb-2 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs font-bold shadow-2xs animate-fade-in"
            style={{
              backgroundColor: matchedOfficial.badgeBg,
              color: matchedOfficial.badgeText,
              border: `1px solid ${matchedOfficial.border}`,
            }}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ponto exato na escala:
            </span>
            <span>
              {matchedOfficial.label} ({matchedOfficial.units} UI)
            </span>
          </div>
        )}

        {/* ÁREA CENTRAL DO DESENHO DA SERINGA NA HORIZONTAL */}
        <div className="relative w-full flex items-center justify-center py-1 overflow-visible">
          <svg
            viewBox="0 0 1140 240"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto max-h-[190px] sm:max-h-[220px] lg:max-h-[240px] drop-shadow-md overflow-visible"
            role="img"
            aria-label={`Seringa horizontal de insulina 0,5 ml 50 UI agulha fixa com ${safeUnits} unidades puxadas`}
          >
            <defs>
              {/* ==================== GRADIENTES ==================== */}
              <linearGradient id="needleCannulaHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="35%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              <linearGradient id="reinforcedHubHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
                <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#F8FAFC" stopOpacity="0.75" />
                <stop offset="80%" stopColor="#CBD5E1" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="glassEmptyBarrelHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.8" />
                <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.35" />
                <stop offset="85%" stopColor="#F1F5F9" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="glassSpecularShineHoriz" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="26%" stopColor="#FFFFFF" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="92%" stopColor="#FFFFFF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="liquidPinkHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F43F8E" stopOpacity="0.9" />
                <stop offset="20%" stopColor="#FDA4AF" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#F43F8E" stopOpacity="0.88" />
                <stop offset="85%" stopColor="#E11D48" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#BE123C" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="tagPinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F43F8E" />
                <stop offset="100%" stopColor="#D63370" />
              </linearGradient>

              <linearGradient id="orangePistonHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C2410C" />
                <stop offset="20%" stopColor="#EA580C" />
                <stop offset="45%" stopColor="#FF7A00" />
                <stop offset="70%" stopColor="#FFA62B" />
                <stop offset="90%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>

              <linearGradient id="orangeSealRingHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9A3412" />
                <stop offset="30%" stopColor="#FF7A00" />
                <stop offset="70%" stopColor="#FFA62B" />
                <stop offset="100%" stopColor="#7C2D12" />
              </linearGradient>

              <linearGradient id="plungerTranslucentRodHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#F1F5F9" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="orangeThumbRestHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9A3412" />
                <stop offset="18%" stopColor="#EA580C" />
                <stop offset="45%" stopColor="#FF7A00" />
                <stop offset="65%" stopColor="#FFA62B" />
                <stop offset="85%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#7C2D12" />
              </linearGradient>

              <linearGradient id="fingerFlangeHorizGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#F1F5F9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="needleCapHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C2410C" />
                <stop offset="25%" stopColor="#EA580C" />
                <stop offset="50%" stopColor="#FF7A00" />
                <stop offset="80%" stopColor="#FFA62B" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>

              <filter id="syringeHorizShadow" x="-10%" y="-20%" width="125%" height="150%">
                <feDropShadow
                  dx="2"
                  dy="4"
                  stdDeviation="4"
                  floodColor="#0F172A"
                  floodOpacity="0.12"
                />
              </filter>

              <filter id="needleSteelGlowHoriz" x="-30%" y="-40%" width="160%" height="180%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="1.8"
                  floodColor="#38BDF8"
                  floodOpacity="0.45"
                />
              </filter>

              <filter id="glowExactHit" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="4"
                  floodColor="#F43F8E"
                  floodOpacity="0.8"
                />
              </filter>
            </defs>

            {/* Sombra de repouso horizontal da seringa na mesa */}
            <ellipse
              cx={520}
              cy={barrelBottom + 20}
              rx="440"
              ry="7"
              fill="#0F172A"
              opacity="0.08"
              className="transition-all duration-200 ease-out"
            />

            {/* ============================================================== */}
            {/* 1. ÊMBOLO MÓVEL: PISTÃO LARANJA + HASTE TRANSLÚCIDA + DISCO    */}
            {/* ============================================================== */}
            <g className="transition-all duration-200 ease-out" filter="url(#syringeHorizShadow)">
              {/* Haste translúcida */}
              <rect
                x={pistonBackX}
                y={barrelCenterY - 7}
                width={Math.max(0, thumbBaseX - pistonBackX)}
                height="14"
                fill="url(#plungerTranslucentRodHorizGrad)"
                stroke="#CBD5E1"
                strokeWidth="0.8"
                rx="2"
              />
              <line
                x1={pistonBackX}
                y1={barrelCenterY}
                x2={thumbBaseX}
                y2={barrelCenterY}
                stroke="#94A3B8"
                strokeWidth="2"
                opacity="0.65"
              />
              <line
                x1={pistonBackX}
                y1={barrelCenterY - 3.5}
                x2={thumbBaseX}
                y2={barrelCenterY - 3.5}
                stroke="#FFFFFF"
                strokeWidth="1.2"
                opacity="0.85"
              />
              {[45, 95, 145, 195, 245, 295, 345, 395, 430].map((offset) => {
                const ribX = pistonBackX + offset
                if (ribX >= thumbBaseX - 10) return null
                return (
                  <rect
                    key={offset}
                    x={ribX}
                    y={barrelCenterY - 10}
                    width="4"
                    height="20"
                    rx="1.5"
                    fill="#E2E8F0"
                    stroke="#CBD5E1"
                    strokeWidth="0.6"
                    opacity="0.9"
                  />
                )
              })}

              {/* APOIO DO POLEGAR LARANJA VIBRANTE */}
              <g>
                <rect
                  x={thumbBaseX - 12}
                  y={barrelCenterY - 13}
                  width="12"
                  height="26"
                  rx="3"
                  fill="url(#orangeThumbRestHorizGrad)"
                  stroke="#9A3412"
                  strokeWidth="0.8"
                />
                <rect
                  x={thumbBaseX}
                  y={barrelCenterY - 32}
                  width="18"
                  height="64"
                  rx="6"
                  fill="url(#orangeThumbRestHorizGrad)"
                  stroke="#9A3412"
                  strokeWidth="1.4"
                />
                <rect
                  x={thumbBaseX + 2.5}
                  y={barrelCenterY - 28}
                  width="3.5"
                  height="56"
                  rx="1.5"
                  fill="#FFA62B"
                  opacity="0.85"
                />
                <line
                  x1={thumbBaseX + 15}
                  y1={barrelCenterY - 28}
                  x2={thumbBaseX + 15}
                  y2={barrelCenterY + 28}
                  stroke="#7C2D12"
                  strokeWidth="1.4"
                />
                <line
                  x1={thumbBaseX + 7.5}
                  y1={barrelCenterY - 20}
                  x2={thumbBaseX + 7.5}
                  y2={barrelCenterY + 20}
                  stroke="#FFFFFF"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                <line
                  x1={thumbBaseX + 11.5}
                  y1={barrelCenterY - 15}
                  x2={thumbBaseX + 11.5}
                  y2={barrelCenterY + 15}
                  stroke="#FFA62B"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </g>

              {/* PISTÃO DE VEDAÇÃO LARANJA VIBRANTE */}
              <g>
                <rect
                  x={pistonFrontX}
                  y={barrelTop + 1.5}
                  width={pistonWidth}
                  height={barrelHeight - 3}
                  fill="url(#orangePistonHorizGrad)"
                  stroke="#9A3412"
                  strokeWidth="1"
                  rx="2"
                />
                <rect
                  x={pistonFrontX}
                  y={barrelTop + 1}
                  width="5.5"
                  height={barrelHeight - 2}
                  fill="url(#orangeSealRingHorizGrad)"
                  rx="1"
                />
                <line
                  x1={pistonFrontX + 1}
                  y1={barrelTop + 2}
                  x2={pistonFrontX + 1}
                  y2={barrelBottom - 2}
                  stroke="#FFA62B"
                  strokeWidth="1.2"
                />
                <rect
                  x={pistonFrontX + 9}
                  y={barrelTop + 3}
                  width="7"
                  height={barrelHeight - 6}
                  fill="#9A3412"
                  opacity="0.5"
                  rx="1"
                />
                <rect
                  x={pistonFrontX + 20}
                  y={barrelTop + 1}
                  width="5.5"
                  height={barrelHeight - 2}
                  fill="url(#orangeSealRingHorizGrad)"
                  rx="1"
                />
                <rect
                  x={pistonFrontX + 2}
                  y={barrelCenterY - 9}
                  width={pistonWidth - 4}
                  height="7"
                  fill="#FFFFFF"
                  opacity="0.4"
                  rx="1"
                />
              </g>
            </g>

            {/* ============================================================== */}
            {/* 2. CILINDRO PRINCIPAL: CORPO DE VIDRO TRANSLÚCIDO              */}
            {/* ============================================================== */}
            <rect
              x={barrelStartX}
              y={barrelTop}
              width={barrelEndX - barrelStartX}
              height={barrelHeight}
              fill="url(#glassEmptyBarrelHorizGrad)"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              rx="3"
            />

            {/* ============================================================== */}
            {/* 3. LÍQUIDO ROSA TIRZEPATIDA (PREENCHE DA ESQUERDA ATÉ O PISTÃO) */}
            {/* ============================================================== */}
            <g className="transition-all duration-200 ease-out">
              {liquidWidth > 0 && (
                <>
                  <rect
                    x={barrelStartX + 1.5}
                    y={barrelTop + 1.5}
                    width={liquidWidth}
                    height={barrelHeight - 3}
                    fill="url(#liquidPinkHorizGrad)"
                  />
                  <rect
                    x={barrelStartX + 2}
                    y={barrelTop + 3}
                    width={liquidWidth}
                    height="9"
                    fill="#FFFFFF"
                    opacity="0.45"
                  />
                  <line
                    x1={pistonFrontX}
                    y1={barrelTop + 2}
                    x2={pistonFrontX}
                    y2={barrelBottom - 2}
                    stroke="#9F1239"
                    strokeWidth="2.2"
                    opacity="0.85"
                  />

                  {/* Microbolhas animadas */}
                  {safeUnits > 6 && (
                    <g className="pointer-events-none">
                      <circle
                        cx={Math.max(barrelStartX + 20, pistonFrontX - 25)}
                        cy={barrelCenterY - 9}
                        r="2.4"
                        fill="#FFFFFF"
                        opacity="0.85"
                        className="animate-bubble-1"
                      />
                      <circle
                        cx={Math.max(barrelStartX + 42, pistonFrontX - 45)}
                        cy={barrelCenterY + 7}
                        r="1.8"
                        fill="#FFFFFF"
                        opacity="0.8"
                        className="animate-bubble-2"
                      />
                      <circle
                        cx={Math.max(barrelStartX + 65, pistonFrontX - 15)}
                        cy={barrelCenterY - 2}
                        r="2.1"
                        fill="#FFFFFF"
                        opacity="0.75"
                        className="animate-bubble-3"
                      />
                    </g>
                  )}
                </>
              )}
            </g>

            {/* ============================================================== */}
            {/* 4. CONEXÃO REFORÇADA INTEGRADA AO CILINDRO                     */}
            {/* ============================================================== */}
            <g filter="url(#syringeHorizShadow)">
              <path
                d={`M ${barrelStartX} ${barrelTop}
                    Q ${barrelStartX - 10} ${barrelTop + 6} ${barrelStartX - 14} ${barrelCenterY - 14}
                    L ${barrelStartX - 14} ${barrelCenterY + 14}
                    Q ${barrelStartX - 10} ${barrelBottom - 6} ${barrelStartX} ${barrelBottom} Z`}
                fill="url(#reinforcedHubHorizGrad)"
                stroke="#94A3B8"
                strokeWidth="1.2"
              />
              <rect
                x="172"
                y={barrelCenterY - 14}
                width="24"
                height="28"
                rx="2"
                fill="url(#reinforcedHubHorizGrad)"
                stroke="#94A3B8"
                strokeWidth="1.1"
              />
              <line
                x1="178"
                y1={barrelCenterY - 14}
                x2="178"
                y2={barrelCenterY + 14}
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <line
                x1="187"
                y1={barrelCenterY - 14}
                x2="187"
                y2={barrelCenterY + 14}
                stroke="#94A3B8"
                strokeWidth="0.8"
              />
              <polygon
                points={`172,${barrelCenterY - 10} 145,${barrelCenterY - 5} 145,${barrelCenterY + 5} 172,${barrelCenterY + 10}`}
                fill="url(#reinforcedHubHorizGrad)"
                stroke="#94A3B8"
                strokeWidth="1"
              />
              <rect
                x="145"
                y={barrelCenterY - 2}
                width="24"
                height="4"
                fill="#94A3B8"
                opacity="0.85"
                rx="0.5"
              />
            </g>

            {/* ============================================================== */}
            {/* 5. AGULHA FIXA ULTRAFINA (8 x 0,30 mm / 30G)                   */}
            {/* ============================================================== */}
            <g>
              <line
                x1="40"
                y1={barrelCenterY}
                x2="145"
                y2={barrelCenterY}
                stroke="#BAE6FD"
                strokeWidth="3.2"
                opacity="0.45"
                filter="url(#needleSteelGlowHoriz)"
              />
              <line
                x1="40"
                y1={barrelCenterY}
                x2="145"
                y2={barrelCenterY}
                stroke="url(#needleCannulaHorizGrad)"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <line
                x1="44"
                y1={barrelCenterY - 0.4}
                x2="142"
                y2={barrelCenterY - 0.4}
                stroke="#FFFFFF"
                strokeWidth="0.7"
                opacity="0.95"
              />
              <polygon
                points={`40,${barrelCenterY} 48,${barrelCenterY - 1.2} 48,${barrelCenterY + 1.2}`}
                fill="url(#needleCannulaHorizGrad)"
                stroke="#64748B"
                strokeWidth="0.3"
              />
              <polygon
                points={`40,${barrelCenterY} 46,${barrelCenterY - 0.8} 46,${barrelCenterY}`}
                fill="#FFFFFF"
                opacity="0.9"
              />
              {safeUnits > 0 && !showCap && (
                <g className="animate-pulse">
                  <ellipse
                    cx="36.5"
                    cy={barrelCenterY}
                    rx="2.4"
                    ry="1.6"
                    fill="#F43F8E"
                    opacity="0.95"
                  />
                  <circle cx="35.8" cy={barrelCenterY - 0.4} r="0.6" fill="#FFFFFF" opacity="0.9" />
                </g>
              )}
            </g>

            {/* ============================================================== */}
            {/* 6. TAMPA PROTETORA LARANJA                                     */}
            {/* ============================================================== */}
            {showCap ? (
              <g filter="url(#syringeHorizShadow)" className="transition-all duration-300">
                <rect
                  x="30"
                  y={barrelCenterY - 9}
                  width="114"
                  height="18"
                  rx="3"
                  fill="url(#needleCapHorizGrad)"
                  stroke="#9A3412"
                  strokeWidth="1"
                />
                <rect
                  x="134"
                  y={barrelCenterY - 13}
                  width="14"
                  height="26"
                  rx="3"
                  fill="url(#needleCapHorizGrad)"
                  stroke="#9A3412"
                  strokeWidth="1"
                />
                <line
                  x1="38"
                  y1={barrelCenterY - 4}
                  x2="130"
                  y2={barrelCenterY - 4}
                  stroke="#FFA62B"
                  strokeWidth="1.2"
                />
                <line
                  x1="38"
                  y1={barrelCenterY + 4}
                  x2="130"
                  y2={barrelCenterY + 4}
                  stroke="#7C2D12"
                  strokeWidth="1.2"
                />
                <line
                  x1="38"
                  y1={barrelCenterY}
                  x2="130"
                  y2={barrelCenterY}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <text
                  x="84"
                  y={barrelCenterY + 2.5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7"
                  fontWeight="800"
                  fontFamily="Poppins, sans-serif"
                  letterSpacing="0.8px"
                >
                  TAMPA PROTETORA
                </text>
              </g>
            ) : (
              <g
                transform="translate(45, 36)"
                filter="url(#syringeHorizShadow)"
                className="transition-all duration-300 opacity-90 hover:opacity-100 cursor-pointer"
                onClick={() => setShowCap(true)}
              >
                <rect
                  x="0"
                  y="0"
                  width="85"
                  height="14"
                  rx="2.5"
                  fill="url(#needleCapHorizGrad)"
                  stroke="#9A3412"
                  strokeWidth="0.8"
                />
                <rect
                  x="75"
                  y="-3"
                  width="12"
                  height="20"
                  rx="2"
                  fill="url(#needleCapHorizGrad)"
                  stroke="#9A3412"
                  strokeWidth="0.8"
                />
                <line
                  x1="4"
                  y1="7"
                  x2="72"
                  y2="7"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
                <text
                  x="38"
                  y="10"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="6.5"
                  fontWeight="800"
                  fontFamily="Poppins, sans-serif"
                  letterSpacing="0.4px"
                >
                  TAMPA LARANJA
                </text>
              </g>
            )}

            {/* ============================================================== */}
            {/* 7. PAREDES DE VIDRO EXTERNAS E FLANGE DOS DEDOS                */}
            {/* ============================================================== */}
            <rect
              x={barrelStartX}
              y={barrelTop}
              width={barrelEndX - barrelStartX}
              height={barrelHeight}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              rx="3"
            />

            <g filter="url(#syringeHorizShadow)">
              <rect
                x={barrelEndX - 4}
                y={barrelCenterY - 22}
                width="10"
                height="44"
                rx="2"
                fill="url(#fingerFlangeHorizGrad)"
                stroke="#94A3B8"
                strokeWidth="1"
              />
              <ellipse
                cx={barrelEndX + 6}
                cy={barrelCenterY}
                rx="5"
                ry="14"
                fill="#E2E8F0"
                stroke="#94A3B8"
                strokeWidth="1"
              />
              <path
                d={`M ${barrelEndX + 6} ${barrelCenterY - 60}
                    C ${barrelEndX + 1} ${barrelCenterY - 60}, ${barrelEndX - 2} ${barrelCenterY - 30}, ${barrelEndX - 2} ${barrelCenterY}
                    C ${barrelEndX - 2} ${barrelCenterY + 30}, ${barrelEndX + 1} ${barrelCenterY + 60}, ${barrelEndX + 6} ${barrelCenterY + 60}
                    C ${barrelEndX + 13} ${barrelCenterY + 60}, ${barrelEndX + 16} ${barrelCenterY + 30}, ${barrelEndX + 16} ${barrelCenterY}
                    C ${barrelEndX + 16} ${barrelCenterY - 30}, ${barrelEndX + 13} ${barrelCenterY - 60}, ${barrelEndX + 6} ${barrelCenterY - 60} Z`}
                fill="url(#fingerFlangeHorizGrad)"
                stroke="#94A3B8"
                strokeWidth="1.6"
              />
              <ellipse
                cx={barrelEndX + 6}
                cy={barrelCenterY}
                rx="6"
                ry="55"
                fill="#FFFFFF"
                fillOpacity="0.5"
              />
              <line
                x1={barrelEndX + 6}
                y1={barrelCenterY - 50}
                x2={barrelEndX + 6}
                y2={barrelCenterY - 16}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1={barrelEndX + 6}
                y1={barrelCenterY + 16}
                x2={barrelEndX + 6}
                y2={barrelCenterY + 50}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* ============================================================== */}
            {/* 8. ESCALA GRADUADA BÁSICA (0 a 60 UI)                          */}
            {/* ============================================================== */}
            <g className="pointer-events-none select-none">
              <line
                x1={scaleZeroX}
                y1={barrelTop + 8}
                x2={scale50X}
                y2={barrelTop + 8}
                stroke="#0F172A"
                strokeWidth="1.2"
              />

              <line
                x1={scaleZeroX}
                y1={barrelTop + 8}
                x2={scaleZeroX}
                y2={barrelTop + 22}
                stroke="#0F172A"
                strokeWidth="1.6"
                strokeLinecap="square"
              />
              <text
                x={scaleZeroX}
                y={barrelTop + 33}
                textAnchor="middle"
                fill="#0F172A"
                fontSize="9"
                fontWeight="800"
                fontFamily="Poppins, sans-serif"
              >
                0
              </text>

              {scaleMarks.map((mark) => {
                if (mark.unit === 0) return null

                const isMainPhotoScale = mark.unit <= 50
                const markOpacity = isMainPhotoScale ? 1 : 0.65

                return (
                  <g key={mark.unit} opacity={markOpacity}>
                    <line
                      x1={mark.x}
                      y1={barrelTop + 8}
                      x2={mark.x}
                      y2={barrelTop + 8 + mark.tickHeight}
                      stroke={mark.isBeyond50 ? '#64748B' : '#0F172A'}
                      strokeWidth={mark.isFive ? 1.6 : 0.9}
                      strokeLinecap="square"
                    />

                    {mark.isLabeled && (
                      <text
                        x={mark.x}
                        y={barrelTop + 33}
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize="9.5"
                        fontWeight="800"
                        fontFamily="Poppins, sans-serif"
                        letterSpacing="-0.2px"
                      >
                        {mark.unit}
                      </text>
                    )}

                    {mark.unit === 60 && (
                      <text
                        x={mark.x}
                        y={barrelTop + 33}
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="8"
                        fontWeight="700"
                        fontFamily="Poppins, sans-serif"
                      >
                        60
                      </text>
                    )}
                  </g>
                )
              })}

              <text
                x={(scaleZeroX + scale50X) / 2}
                y={barrelBottom - 7}
                textAnchor="middle"
                fill="#0F172A"
                fontSize="9"
                fontWeight="900"
                fontFamily="Poppins, sans-serif"
                letterSpacing="0.8px"
              >
                UNITS • 0,5 ml
              </text>
            </g>

            {/* ============================================================== */}
            {/* 8.1 MARCAS OFICIAIS DE FRACIONAMENTO COLORIDAS NA ESCALA       */}
            {/*     (Elemento-chave: 8, 17, 25, 33, 42, 50 UI coloridos)       */}
            {/* ============================================================== */}
            <g className="select-none pointer-events-none">
              {officialGuideMarks.map((guide) => {
                const isSelected = guide.isCurrent

                return (
                  <g key={guide.mg} className="transition-all duration-200">
                    {/* Linha vertical colorida de destaque que cruza a escala */}
                    <line
                      x1={guide.x}
                      y1={barrelTop + 4}
                      x2={guide.x}
                      y2={barrelTop + (isSelected ? 30 : 20)}
                      stroke={guide.color}
                      strokeWidth={isSelected ? 2.8 : 1.8}
                      strokeLinecap="round"
                      opacity={isSelected ? 1 : 0.85}
                    />

                    {/* Triângulo / indicador no topo da escala apontando para a marca exata */}
                    <polygon
                      points={`${guide.x - 3.5},${barrelTop + 3} ${guide.x + 3.5},${barrelTop + 3} ${guide.x},${barrelTop + 7}`}
                      fill={guide.color}
                    />

                    {/* Pequena tag com a dosagem em mg acima do cilindro */}
                    <g transform={`translate(${guide.x}, ${barrelTop - 12})`}>
                      <rect
                        x="-15"
                        y="-10"
                        width="30"
                        height="12"
                        rx="3"
                        fill={isSelected ? guide.color : '#FFFFFF'}
                        stroke={guide.color}
                        strokeWidth={isSelected ? 1.5 : 1}
                        opacity={isSelected ? 1 : 0.9}
                      />
                      <text
                        x="0"
                        y="-1.5"
                        textAnchor="middle"
                        fill={isSelected ? '#FFFFFF' : guide.color}
                        fontSize="7"
                        fontWeight="800"
                        fontFamily="Poppins, sans-serif"
                      >
                        {guide.label}
                      </text>
                    </g>

                    {/* Efeito de anel pulsante quando coincide com a dose atual */}
                    {isSelected && (
                      <circle
                        cx={guide.x}
                        cy={barrelTop + 8}
                        r="5"
                        fill="none"
                        stroke={guide.color}
                        strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}
                  </g>
                )
              })}
            </g>

            {/* ============================================================== */}
            {/* 9. REFLEXO CRISTALINO ESPECULAR DO VIDRO                       */}
            {/* ============================================================== */}
            <rect
              x={barrelStartX}
              y={barrelTop}
              width={barrelEndX - barrelStartX}
              height={barrelHeight}
              fill="url(#glassSpecularShineHoriz)"
              rx="3"
              pointerEvents="none"
            />

            {/* ============================================================== */}
            {/* 10. TAG FLUTUANTE DE DOSE COM INDICADOR EM TEMPO REAL          */}
            {/*     (Com destaque de "Ponto exato" nas doses oficiais)         */}
            {/* ============================================================== */}
            <g
              className="transition-all duration-200 ease-out pointer-events-none"
              transform={`translate(${pistonFrontX}, 0)`}
            >
              {/* Linha pontilhada vertical conectando o cilindro à tag flutuante */}
              <line
                x1="0"
                y1={barrelBottom - 2}
                x2="0"
                y2={barrelBottom + 16}
                stroke={matchedOfficial ? matchedOfficial.color : '#F43F8E'}
                strokeWidth={matchedOfficial ? '2.8' : '2.2'}
                strokeDasharray={matchedOfficial ? 'none' : '3 2'}
              />

              {/* Pílula flutuante estilizada logo abaixo do nível do pistão */}
              <g
                transform={`translate(-85, 172)`}
                filter={isExactHit ? 'url(#glowExactHit)' : 'url(#syringeHorizShadow)'}
              >
                {/* Borda da pílula */}
                <rect
                  x="0"
                  y="0"
                  width="170"
                  height="36"
                  rx="18"
                  fill="#FFFFFF"
                  stroke={matchedOfficial ? matchedOfficial.color : '#F43F8E'}
                  strokeWidth={matchedOfficial ? 2.5 : 2}
                />
                {/* Fundo colorido na tag */}
                <rect
                  x="3"
                  y="3"
                  width="164"
                  height="30"
                  rx="15"
                  fill={matchedOfficial ? matchedOfficial.color : 'url(#tagPinkGrad)'}
                />
                {/* Texto da dose */}
                <text
                  x="85"
                  y="18"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="800"
                  fontFamily="Poppins, sans-serif"
                >
                  {safeUnits % 1 === 0 ? safeUnits : safeUnits.toFixed(1)} UI
                  {mgEquivalent !== undefined ? ` • ${mgEquivalent} mg` : ''}
                </text>
                <text
                  x="85"
                  y="28"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="Poppins, sans-serif"
                  opacity="0.95"
                >
                  {matchedOfficial
                    ? `★ PONTO EXATO (${matchedOfficial.label})`
                    : mlEquivalent !== undefined
                      ? `${mlEquivalent.toFixed(2)} ml`
                      : ''}
                </text>

                {/* Seta do balão apontando para a linha do menisco */}
                <polygon
                  points="80,-5 85,0 90,-5"
                  fill={matchedOfficial ? matchedOfficial.color : '#F43F8E'}
                />
              </g>

              {/* Marcador pulsante pontual exatamente no menisco/vedação */}
              <circle
                cx="0"
                cy={barrelCenterY}
                r="4"
                fill={matchedOfficial ? matchedOfficial.color : '#F43F8E'}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                className="animate-ping"
              />
              <circle
                cx="0"
                cy={barrelCenterY}
                r="3.5"
                fill={matchedOfficial ? matchedOfficial.color : '#F43F8E'}
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            </g>
          </svg>
        </div>

        {/* ============================================================== */}
        {/* LEGENDA E DESTAQUES DO MODELO DE AGULHA FIXA                   */}
        {/* ============================================================== */}
        <div className="mt-2 pt-3 border-t border-[#F9A8C9]/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-xl bg-white/70 border border-[#F9A8C9]/30 shadow-2xs">
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              Capacidade
            </span>
            <span className="text-xs font-black text-[#1F1A1D]">0,5 ml / 50 UI</span>
          </div>

          <div className="p-2 rounded-xl bg-white/70 border border-[#F9A8C9]/30 shadow-2xs">
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              Agulha Fixa
            </span>
            <span className="text-xs font-black text-[#16A34A] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 8 x 0,30 mm
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/70 border border-[#F9A8C9]/30 shadow-2xs">
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              Vedação
            </span>
            <span className="text-xs font-black text-[#EA580C]">Êmbolo Laranja</span>
          </div>

          <div className="p-2 rounded-xl bg-white/70 border border-[#F9A8C9]/30 shadow-2xs">
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              Zero Vazamento
            </span>
            <span className="text-xs font-black text-[#F43F8E] flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Menisco Rosa
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PAINEL-LEGENDA: FRACIONAMENTO OFICIAL DA AMPOLA DE 15mg/0,5ml   */}
      {/*     (Exatamente conforme a imagem de referência do usuário)     */}
      {/* ============================================================== */}
      <div className="w-full bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E5E7EB] shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-1.5 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FCE4EC] text-[#F43F8E] flex items-center justify-center">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#1F1A1D]">
                Fracionamento ampola de 15mg/0,5ml
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Seringa de 50 UI • Toque em uma dose para marcar o ponto exato na seringa:
              </p>
            </div>
          </div>

          {matchedOfficial && (
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: matchedOfficial.badgeBg,
                color: matchedOfficial.badgeText,
                border: `1px solid ${matchedOfficial.border}`,
              }}
            >
              Dose selecionada: {matchedOfficial.label}
            </span>
          )}
        </div>

        {/* Grade com as 6 doses oficiais da referência */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {OFFICIAL_15MG_FRACTIONATION.map((item) => {
            const isSelected = matchedOfficial?.units === item.units

            return (
              <button
                key={item.mg}
                type="button"
                onClick={() => onSelectOfficialDose && onSelectOfficialDose(item)}
                className={cn(
                  'p-2.5 rounded-xl border text-center transition-all duration-150 btn-tap-scale cursor-pointer flex flex-col items-center justify-between gap-1',
                  isSelected ? 'ring-2 ring-offset-1 shadow-sm' : 'hover:bg-gray-50',
                )}
                style={{
                  backgroundColor: isSelected ? item.badgeBg : '#FFFFFF',
                  borderColor: isSelected ? item.color : item.border,
                }}
              >
                {/* Linha colorida indicativa */}
                <span
                  className="w-full h-1 rounded-full mb-0.5"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-xs font-black tracking-tight" style={{ color: item.color }}>
                  {item.label}
                </span>

                <span
                  className={cn(
                    'text-[11px] font-bold px-2 py-0.5 rounded-md',
                    isSelected ? 'bg-white shadow-2xs' : 'bg-gray-100 text-gray-700',
                  )}
                  style={{ color: isSelected ? item.badgeText : undefined }}
                >
                  {item.units < 10 ? `0${item.units}` : item.units} UI
                </span>

                {isSelected && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#16A34A] flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Ponto exato
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
