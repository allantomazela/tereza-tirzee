import { useMemo, useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'

interface SyringeAnimationProps {
  units: number // 0 a 60 unidades
  maxUnits?: number
  mgEquivalent?: number
}

/**
 * Seringa de Insulina 0,5 ml / 50 UI com Agulha Fixa Ultrafina — ORIENTAÇÃO HORIZONTAL
 *
 * Requisitos clínicos e mecânicos:
 * - Orientação HORIZONTAL realista:
 *     * Extremidade ESQUERDA: agulha ultrafina com bisel metálico, microgota pulsante, bico reforçado
 *     * Meio: cilindro de vidro/plástico cristalino com escala graduada fiel de 5 a 50 UNITS (estendida a 60)
 *       e rótulo "UNITS • 0,5 ml"
 *     * Extremidade DIREITA: flange dos dedos (finger grip) e o êmbolo móvel laranja
 * - Funcionamento mecânico do êmbolo (puxar medicamento):
 *     * Em 0 UI (vazio): o pistão de vedação laranja está encostado no início do cilindro (próximo à agulha/zero).
 *       A haste rígida e o disco de apoio do polegar ficam VISÍVEIS PARA FORA do cilindro à direita,
 *       permitindo a pega dos dedos para puxar.
 *     * Conforme a dose aumenta (0 -> 60 UI): o pistão de vedação laranja se desloca para a direita,
 *       puxando a coluna de medicamento rosa translúcido (com menisco e microbolhas) para dentro do cilindro,
 *       e o disco de apoio do polegar se afasta ainda mais para a direita.
 * - Tampa de proteção laranja com botão alternável (colocada sobre a agulha ou guardada ao lado).
 * - Tag flutuante de dosagem (unidades e mg) sincronizada em tempo real com o nível do líquido.
 */
export default function SyringeAnimation({
  units,
  maxUnits = 60,
  mgEquivalent,
}: SyringeAnimationProps) {
  // Limites seguros
  const safeUnits = Math.max(0, Math.min(maxUnits, units))

  // Estado da capa protetora de agulha (tampa laranja de agulha fixa)
  const [showCap, setShowCap] = useState<boolean>(false)

  // =========================================================================
  // SISTEMA DE COORDENADAS DO SVG HORIZONTAL:
  // viewBox: "0 0 1000 240"
  // Eixo Y central da seringa: 120
  //
  // 1. Agulha fixa (Esquerda):
  // - Ponta da agulha: x = 40 (com bisel trifacetado e microgota rosa em x = 36)
  // - Cânula metálica ultrafina de x = 40 até x = 145 (comprimento 105px, aço cirúrgico)
  // - Tampa laranja quando ativa: x = 30 até x = 150
  //
  // 2. Conexão reforçada / bico transparente cônico integrado:
  // - x = 145 até x = 210
  // - Cone: x = 145 a 175
  // - Colar cilíndrico com anéis de reforço: x = 175 a 198
  // - Ombros curvos do cilindro: x = 198 a 210
  //
  // 3. Cilindro de vidro (Barrel):
  // - Início do cilindro útil: x = 210
  // - Altura do cilindro: 56px (y: 92 a 148, raio 28px)
  // - Escala graduada (zero a 50 UI):
  //   * 0 UNITS: x = 224
  //   * 50 UNITS: x = 554 (distância útil = 330px -> 6.6px por unidade)
  //   * 60 UNITS (limite máximo): x = 620
  // - Fim do cilindro / posição da flange de dedos: x = 645
  // - Comprimento do cilindro: 435px (x: 210 a 645)
  //
  // 4. Flange dos dedos (Finger Grip):
  // - Flange oval transparente esbranquiçada em x = 645, altura 124px (y: 58 a 182)
  // - Orifício central para a haste passar: x = 645, altura 30px
  //
  // 5. Êmbolo móvel LARANJA (Plunger):
  // - Pistão de vedação LARANJA duplo lábio dentro do cilindro:
  //   * xPistonFront = scaleZeroX + (safeUnits * scalePerUnit)
  //   * Largura do pistão: 26px
  //   * xPistonBack = xPistonFront + 26
  // - Haste rígida do êmbolo (perfil cruciforme com nervuras):
  //   * Conecta a traseira do pistão (xPistonBack) ao disco de apoio do polegar.
  //   * Comprimento rígido constante da haste: 450px
  //   * Em 0 UI: xPistonFront = 224, xPistonBack = 250 -> xThumbRest = 250 + 450 = 700
  //     Como a flange está em x = 645, em 0 UI já sobram 55px de haste + 24px de disco (total ~80px)
  //     VISÍVEIS PARA FORA da seringa à direita (pega perfeita para os dedos!).
  //   * Em 60 UI: xPistonFront = 620, xPistonBack = 646 -> xThumbRest = 646 + 450 = 1096
  // - Apoio de polegar (Thumb Rest) LARANJA vibrante:
  //   * Disco laranja com nervuras antiderrapantes na extremidade direita da haste.
  //
  // 6. Líquido Rosa Tirzepatida:
  // - Preenche da entrada do cilindro (x = 210) até a frente do pistão (xPistonFront).
  // - Largura do líquido: xPistonFront - 210
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
  // Comprimento da haste rígida: 450px
  const rodLength = 450
  const thumbBaseX = pistonBackX + rodLength

  // Gerador das marcas da escala (0 a 60 UNITS):
  // Marcas longas a cada 5 UI com numeração impressa (5, 10, ..., 50)
  // Marcas curtas a cada 1 UI
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

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-white to-[#FCE4EC]/30 rounded-3xl p-3 sm:p-5 border border-[#F9A8C9]/40 shadow-inner">
        {/* Barra superior de status e controles do modelo */}
        <div className="flex items-center justify-between px-1 sm:px-3 pb-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span className="text-[#1F1A1D] font-bold">Seringa de Insulina 0,5 ml | 50 UI</span>
              <span className="text-[#F43F8E] font-medium hidden sm:inline">
                • Agulha Fixa 8 x 0,30 mm (30G)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* ÁREA CENTRAL DO DESENHO DA SERINGA NA HORIZONTAL */}
        <div className="relative w-full flex items-center justify-center py-1 overflow-x-auto scrollbar-none">
          <svg
            viewBox="0 0 1140 240"
            className="w-full min-w-[620px] max-w-[1040px] h-auto drop-shadow-md overflow-visible"
            role="img"
            aria-label={`Seringa horizontal de insulina 0,5 ml 50 UI agulha fixa com ${safeUnits} unidades puxadas`}
          >
            <defs>
              {/* ==================== GRADIENTES METÁLICOS E VIDRO ==================== */}
              {/* Cânula metálica da agulha fixa ultrafina (gradiente vertical para tubo cilíndrico horizontal) */}
              <linearGradient id="needleCannulaHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="35%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              {/* Conexão plástica reforçada integrada (bico transparente cônico) */}
              <linearGradient id="reinforcedHubHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
                <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#F8FAFC" stopOpacity="0.75" />
                <stop offset="80%" stopColor="#CBD5E1" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.9" />
              </linearGradient>

              {/* Cilindro de vidro cristalino (vazio translúcido) */}
              <linearGradient id="glassEmptyBarrelHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.8" />
                <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.35" />
                <stop offset="85%" stopColor="#F1F5F9" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.8" />
              </linearGradient>

              {/* Reflexo especular no vidro do cilindro (camada superior horizontal de brilho) */}
              <linearGradient id="glassSpecularShineHoriz" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="26%" stopColor="#FFFFFF" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="92%" stopColor="#FFFFFF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Líquido Tirzepatida Rosa Translúcido Vibrante */}
              <linearGradient id="liquidPinkHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F43F8E" stopOpacity="0.9" />
                <stop offset="20%" stopColor="#FDA4AF" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#F43F8E" stopOpacity="0.88" />
                <stop offset="85%" stopColor="#E11D48" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#BE123C" stopOpacity="0.95" />
              </linearGradient>

              {/* Tag flutuante gradiente rosa */}
              <linearGradient id="tagPinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F43F8E" />
                <stop offset="100%" stopColor="#D63370" />
              </linearGradient>

              {/* ==================== ÊMBOLO LARANJA VIBRANTE ==================== */}
              {/* Pistão de vedação LARANJA */}
              <linearGradient id="orangePistonHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C2410C" />
                <stop offset="20%" stopColor="#EA580C" />
                <stop offset="45%" stopColor="#FF7A00" />
                <stop offset="70%" stopColor="#FFA62B" />
                <stop offset="90%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>

              {/* Anel de vedação do pistão laranja */}
              <linearGradient id="orangeSealRingHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9A3412" />
                <stop offset="30%" stopColor="#FF7A00" />
                <stop offset="70%" stopColor="#FFA62B" />
                <stop offset="100%" stopColor="#7C2D12" />
              </linearGradient>

              {/* Haste translúcida do êmbolo */}
              <linearGradient id="plungerTranslucentRodHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#F1F5F9" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.9" />
              </linearGradient>

              {/* Flange / Apoio de polegar LARANJA VIBRANTE */}
              <linearGradient id="orangeThumbRestHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9A3412" />
                <stop offset="18%" stopColor="#EA580C" />
                <stop offset="45%" stopColor="#FF7A00" />
                <stop offset="65%" stopColor="#FFA62B" />
                <stop offset="85%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#7C2D12" />
              </linearGradient>

              {/* Flange para dedos na base do cilindro (transparente esbranquiçado) */}
              <linearGradient id="fingerFlangeHorizGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#F1F5F9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.9" />
              </linearGradient>

              {/* Capa protetora laranja da agulha */}
              <linearGradient id="needleCapHorizGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C2410C" />
                <stop offset="25%" stopColor="#EA580C" />
                <stop offset="50%" stopColor="#FF7A00" />
                <stop offset="80%" stopColor="#FFA62B" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>

              {/* Sombra suave para os elementos */}
              <filter id="syringeHorizShadow" x="-10%" y="-20%" width="125%" height="150%">
                <feDropShadow
                  dx="2"
                  dy="4"
                  stdDeviation="4"
                  floodColor="#0F172A"
                  floodOpacity="0.12"
                />
              </filter>

              {/* Brilho de aço cirúrgico da agulha */}
              <filter id="needleSteelGlowHoriz" x="-30%" y="-40%" width="160%" height="180%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="1.8"
                  floodColor="#38BDF8"
                  floodOpacity="0.45"
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
            {/*    (Renderizado na camada atrás das paredes do cilindro)       */}
            {/* ============================================================== */}
            <g className="transition-all duration-200 ease-out" filter="url(#syringeHorizShadow)">
              {/* HASTE TRANSLÚCIDA DO ÊMBOLO (Perfil cruciforme horizontal) */}
              {/* Eixo horizontal da haste */}
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
              {/* Nervura central horizontal de reforço */}
              <line
                x1={pistonBackX}
                y1={barrelCenterY}
                x2={thumbBaseX}
                y2={barrelCenterY}
                stroke="#94A3B8"
                strokeWidth="2"
                opacity="0.65"
              />
              {/* Nervura superior de brilho */}
              <line
                x1={pistonBackX}
                y1={barrelCenterY - 3.5}
                x2={thumbBaseX}
                y2={barrelCenterY - 3.5}
                stroke="#FFFFFF"
                strokeWidth="1.2"
                opacity="0.85"
              />
              {/* Nervuras transversais da haste plástica */}
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

              {/* APOIO DO POLEGAR LARANJA VIBRANTE (THUMB REST - EXTREMIDADE DIREITA) */}
              <g>
                {/* Garganta / encaixe cilíndrico que conecta a haste ao disco laranja */}
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
                {/* Flange / disco largo de apoio do polegar em laranja vibrante */}
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
                {/* Linha de brilho superior no disco laranja */}
                <rect
                  x={thumbBaseX + 2.5}
                  y={barrelCenterY - 28}
                  width="3.5"
                  height="56"
                  rx="1.5"
                  fill="#FFA62B"
                  opacity="0.85"
                />
                {/* Borda direita com sombra */}
                <line
                  x1={thumbBaseX + 15}
                  y1={barrelCenterY - 28}
                  x2={thumbBaseX + 15}
                  y2={barrelCenterY + 28}
                  stroke="#7C2D12"
                  strokeWidth="1.4"
                />
                {/* Nervuras antiderrapantes para o polegar / dedos */}
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

              {/* PISTÃO DE VEDAÇÃO LARANJA VIBRANTE DENTRO DO CILINDRO */}
              <g>
                {/* Corpo do pistão de borracha laranja */}
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
                {/* Lábio frontal de vedação (alinhado rigorosamente à leitura da dose) */}
                <rect
                  x={pistonFrontX}
                  y={barrelTop + 1}
                  width="5.5"
                  height={barrelHeight - 2}
                  fill="url(#orangeSealRingHorizGrad)"
                  rx="1"
                />
                {/* Aresta frontal calibrada com brilho */}
                <line
                  x1={pistonFrontX + 1}
                  y1={barrelTop + 2}
                  x2={pistonFrontX + 1}
                  y2={barrelBottom - 2}
                  stroke="#FFA62B"
                  strokeWidth="1.2"
                />
                {/* Canal central de lubrificação entre os lábios de vedação */}
                <rect
                  x={pistonFrontX + 9}
                  y={barrelTop + 3}
                  width="7"
                  height={barrelHeight - 6}
                  fill="#9A3412"
                  opacity="0.5"
                  rx="1"
                />
                {/* Lábio traseiro de vedação */}
                <rect
                  x={pistonFrontX + 20}
                  y={barrelTop + 1}
                  width="5.5"
                  height={barrelHeight - 2}
                  fill="url(#orangeSealRingHorizGrad)"
                  rx="1"
                />
                {/* Reflexo horizontal no pistão laranja */}
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
            {/* Fundo interno vazio do cilindro */}
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
                  {/* Coluna de líquido rosa */}
                  <rect
                    x={barrelStartX + 1.5}
                    y={barrelTop + 1.5}
                    width={liquidWidth}
                    height={barrelHeight - 3}
                    fill="url(#liquidPinkHorizGrad)"
                  />

                  {/* Reflexo superior brilhante no líquido */}
                  <rect
                    x={barrelStartX + 2}
                    y={barrelTop + 3}
                    width={liquidWidth}
                    height="9"
                    fill="#FFFFFF"
                    opacity="0.45"
                  />

                  {/* Menisco nítido na interface líquido / pistão */}
                  <line
                    x1={pistonFrontX}
                    y1={barrelTop + 2}
                    x2={pistonFrontX}
                    y2={barrelBottom - 2}
                    stroke="#9F1239"
                    strokeWidth="2.2"
                    opacity="0.85"
                  />

                  {/* Microbolhas animadas no líquido */}
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
            {/* 4. CONEXÃO REFORÇADA INTEGRADA AO CILINDRO (BICO DA AGULHA)    */}
            {/* ============================================================== */}
            <g filter="url(#syringeHorizShadow)">
              {/* Ombros curvos do cilindro que convergem para o cone */}
              <path
                d={`M ${barrelStartX} ${barrelTop}
                    Q ${barrelStartX - 10} ${barrelTop + 6} ${barrelStartX - 14} ${barrelCenterY - 14}
                    L ${barrelStartX - 14} ${barrelCenterY + 14}
                    Q ${barrelStartX - 10} ${barrelBottom - 6} ${barrelStartX} ${barrelBottom} Z`}
                fill="url(#reinforcedHubHorizGrad)"
                stroke="#94A3B8"
                strokeWidth="1.2"
              />

              {/* Colar cilíndrico intermediário reforçado */}
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
              {/* Anéis de reforço no colar plástico */}
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

              {/* Cone afilado esquerdo onde a agulha fixa fica cravada */}
              <polygon
                points={`172,${barrelCenterY - 10} 145,${barrelCenterY - 5} 145,${barrelCenterY + 5} 172,${barrelCenterY + 10}`}
                fill="url(#reinforcedHubHorizGrad)"
                stroke="#94A3B8"
                strokeWidth="1"
              />

              {/* Guia metálica interna da cânula fixa */}
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
              {/* Brilho de aço cirúrgico da cânula */}
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

              {/* Cânula metálica ultrafina principal */}
              <line
                x1="40"
                y1={barrelCenterY}
                x2="145"
                y2={barrelCenterY}
                stroke="url(#needleCannulaHorizGrad)"
                strokeWidth="1.9"
                strokeLinecap="round"
              />

              {/* Linha de reflexo especular polido na agulha */}
              <line
                x1="44"
                y1={barrelCenterY - 0.4}
                x2="142"
                y2={barrelCenterY - 0.4}
                stroke="#FFFFFF"
                strokeWidth="0.7"
                opacity="0.95"
              />

              {/* Bisel trifacetado na ponta (corte cirúrgico voltado para a esquerda) */}
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

              {/* Microgota de Tirzepatida pulsando na ponta da agulha quando carregada */}
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
            {/* 6. TAMPA PROTETORA LARANJA (COBRE AGULHA OU REPOUSA AO LADO)   */}
            {/* ============================================================== */}
            {showCap ? (
              /* Tampa colocada sobre a agulha */
              <g filter="url(#syringeHorizShadow)" className="transition-all duration-300">
                {/* Tampa protetora cilíndrica horizontal */}
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
                {/* Flange traseira da tampa junto ao bico */}
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
                {/* Ranhuras horizontais de aderência */}
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
              /* Tampa repousando acima da agulha (indicador compacto clicável) */
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
            {/* 7. PAREDES DE VIDRO EXTERNAS DO CILINDRO E FLANGE DOS DEDOS    */}
            {/* ============================================================== */}
            {/* Parede de vidro com contorno nítido */}
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

            {/* FLANGE PARA OS DEDOS (FINGER GRIP) NA EXTREMIDADE DIREITA DO CILINDRO (X = 645) */}
            <g filter="url(#syringeHorizShadow)">
              {/* Colar traseiro que segura a flange */}
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
              {/* Orifício central por onde a haste desliza para fora */}
              <ellipse
                cx={barrelEndX + 6}
                cy={barrelCenterY}
                rx="5"
                ry="14"
                fill="#E2E8F0"
                stroke="#94A3B8"
                strokeWidth="1"
              />
              {/* Flange oval plana larga da foto (apoio para os dedos indicador e médio) */}
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
              {/* Brilhos plásticos na flange */}
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
            {/* 8. ESCALA GRADUADA IMPRESSA NO CILINDRO (5 A 50 UNITS + 60)   */}
            {/* ============================================================== */}
            <g className="pointer-events-none select-none">
              {/* Linha horizontal mestra da escala no topo interno do cilindro */}
              <line
                x1={scaleZeroX}
                y1={barrelTop + 8}
                x2={scale50X}
                y2={barrelTop + 8}
                stroke="#0F172A"
                strokeWidth="1.2"
              />

              {/* Traço e marca 0 (início) */}
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

              {/* Graduações de 1 a 60 */}
              {scaleMarks.map((mark) => {
                if (mark.unit === 0) return null

                const isMainPhotoScale = mark.unit <= 50
                const markOpacity = isMainPhotoScale ? 1 : 0.65

                return (
                  <g key={mark.unit} opacity={markOpacity}>
                    {/* Traço da escala apontando para baixo (para o interior do cilindro) */}
                    <line
                      x1={mark.x}
                      y1={barrelTop + 8}
                      x2={mark.x}
                      y2={barrelTop + 8 + mark.tickHeight}
                      stroke={mark.isBeyond50 ? '#64748B' : '#0F172A'}
                      strokeWidth={mark.isFive ? 1.6 : 0.9}
                      strokeLinecap="square"
                    />

                    {/* Números da escala (5, 10, 15, ..., 50) */}
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

                    {/* Marca discreta de 60 unidades para o limite do app */}
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

              {/* RÓTULO "UNITS • 0,5 ml" IMPRESSO NO CORPO DO CILINDRO */}
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
            {/* 9. REFLEXO CRISTALINO ESPECULAR DO VIDRO (SOBREPOSTO À ESCALA) */}
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
            {/*     (Posicionada na horizontal alinhada com o menisco/pistão)  */}
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
                stroke="#F43F8E"
                strokeWidth="2.2"
                strokeDasharray="3 2"
              />

              {/* Pílula flutuante estilizada logo abaixo do nível do pistão */}
              <g transform="translate(-75, 172)" filter="url(#syringeHorizShadow)">
                {/* Borda da pílula */}
                <rect
                  x="0"
                  y="0"
                  width="150"
                  height="34"
                  rx="17"
                  fill="#FFFFFF"
                  stroke="#F43F8E"
                  strokeWidth="2"
                />
                {/* Fundo colorido na tag */}
                <rect x="3" y="3" width="144" height="28" rx="14" fill="url(#tagPinkGrad)" />
                {/* Texto da dose */}
                <text
                  x="72"
                  y="21"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="Poppins, sans-serif"
                >
                  {safeUnits} un {mgEquivalent !== undefined ? `• ${mgEquivalent}mg` : ''}
                </text>

                {/* Seta do balão apontando para a linha do menisco */}
                <polygon points="70,-4 75,0 80,-4" fill="#F43F8E" />
              </g>

              {/* Marcador pulsante pontual exatamente no menisco/vedação */}
              <circle
                cx="0"
                cy={barrelCenterY}
                r="3.5"
                fill="#F43F8E"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="animate-ping"
              />
              <circle cx="0" cy={barrelCenterY} r="3" fill="#F43F8E" />
            </g>
          </svg>
        </div>

        {/* ============================================================== */}
        {/* LEGENDA E DESTAQUES DO MODELO DE AGULHA FIXA (CONFORME FOTO)   */}
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
              <Sparkles className="w-3.5 h-3.5" /> Caneca Flexível
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
