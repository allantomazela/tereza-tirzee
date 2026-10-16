import { useMemo, useState } from 'react'
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'

interface SyringeAnimationProps {
  units: number // 0 a 60 unidades
  maxUnits?: number
  mgEquivalent?: number
}

/**
 * Seringa de Insulina 0,5 ml / 50 UI com Agulha Fixa Ultrafina (Modelo image-12377.png)
 * - Orientação VERTICAL realista (Agulha para cima, êmbolo para baixo)
 * - Agulha fixa de aço inoxidável ultrafina (8 x 0,30 mm / 30G) com conexão reforçada transparente integrada
 * - Corpo cilíndrico de vidro/plástico cristalino com reflexos e graduação fiel de 5 a 50 UNITS (estendida com discrição a 60)
 * - Êmbolo com acabamento LARANJA vibrante: pistão de vedação duplo lábio em laranja e flange/disco de apoio do polegar em laranja com haste translúcida
 * - Animação de PUXAR o medicamento rosa translúcido com o pistão descendo conforme a dose aumenta
 * - Bolhas e menisco dinâmicos, tag flutuante com indicador de unidade e mg
 * - Tampa de proteção laranja com toggle (opcional cobrir agulha ou guardada ao lado)
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

  // Sistema de coordenadas do SVG vertical:
  // viewBox: "0 0 460 760"
  // Eixo X central da seringa: 230
  //
  // 1. Agulha fixa:
  // - Ponta da agulha: y = 28 (com bisel trifacetado cortante e microgota)
  // - Cânula metálica ultrafina de y = 28 até y = 118 (comprimento 90px, aço cirúrgico)
  // - Conexão reforçada / bico transparente integrado (caneca flexível cônica): y = 118 até y = 175
  //
  // 2. Cilindro (Barrel):
  // - Início do cilindro útil: y = 175
  // - Largura do cilindro: 62px (x: 199 a 261, raio 31px)
  // - Escala graduada (zero a 50 UI):
  //   * 0 UNITS: y = 190
  //   * 50 UNITS: y = 515 (distância útil = 325px -> 6.5px por unidade)
  //   * 60 UNITS (limite do slider / Tereza): y = 580
  // - Fim do cilindro / flange para dedos: y = 600
  //
  // 3. Flange dos dedos (Finger Grip):
  // - Flange oval transparente/esbranquiçado em y = 600, largura 146px (x: 157 a 303)
  //
  // 4. Êmbolo (Plunger):
  // - Pistão LARANJA (topo do êmbolo dentro do cilindro):
  //   * yPistonTop = scaleZeroY + (safeUnits * scalePerUnit)
  //   * Altura do pistão de vedação laranja: 30px
  //   * Base do pistão: yPistonTop + 30
  // - Haste translúcida do êmbolo (haste com nervuras em cruz e reforços):
  //   * Desce a partir da base do pistão por um comprimento constante (210px)
  // - Flange / apoio de polegar LARANJA vibrante (Thumb Rest):
  //   * Na ponta inferior da haste: disco laranja e acabamento de apoio idêntico à foto
  //
  // 5. Líquido Rosa Tirzepatida:
  // - Preenche do topo do cilindro (y = 175) até a borda de vedação do pistão (yPistonTop)

  const barrelCenterX = 230
  const barrelWidth = 62
  const barrelLeft = barrelCenterX - barrelWidth / 2 // 199
  const barrelRight = barrelCenterX + barrelWidth / 2 // 261
  const barrelTopY = 175
  const barrelBottomY = 600

  // Escala graduada
  const scaleZeroY = 190
  const scale50Y = 515
  const scaleLength50 = scale50Y - scaleZeroY // 325px
  const scalePerUnit = scaleLength50 / 50 // 6.5px por unidade

  // Posição do pistão (desce conforme units aumenta — seringa PUXANDO medicamento)
  const pistonTopY = scaleZeroY + safeUnits * scalePerUnit
  const liquidHeight = Math.max(0, pistonTopY - barrelTopY)

  // Dimensões do pistão de vedação laranja
  const pistonHeight = 28
  const pistonBottomY = pistonTopY + pistonHeight

  // Haste do êmbolo e apoio de polegar
  const rodLength = 175
  const thumbBaseY = pistonBottomY + rodLength

  // Gerador das marcas da escala fiel à foto:
  // Na foto: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 (números grandes em preto à direita da haste graduada)
  // Com traços longos a cada 5 unidades e traços menores a cada 1 unidade
  // Rótulo "UNITS" em negrito logo abaixo do número 50
  const scaleMarks = useMemo(() => {
    const marks = []
    for (let u = 0; u <= 60; u += 1) {
      const y = scaleZeroY + u * scalePerUnit
      const isLabeled = u % 5 === 0 && u >= 5 && u <= 50
      const isFive = u % 5 === 0
      const isOne = !isFive
      const isBeyond50 = u > 50

      marks.push({
        unit: u,
        y,
        isLabeled,
        isFive,
        isOne,
        isBeyond50,
        // Largura do traço
        tickWidth: isFive ? 14 : 7,
      })
    }
    return marks
  }, [scaleZeroY, scalePerUnit])

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-white to-[#FCE4EC]/30 rounded-3xl p-3 sm:p-5 border border-[#F9A8C9]/40 shadow-inner">
        {/* Barra superior de status e controles do modelo */}
        <div className="flex items-center justify-between px-2 sm:px-4 pb-3 text-[11px]">
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
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#EA580C] hover:text-[#C2410C] px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200/60 hover:bg-orange-100/60 transition shadow-2xs"
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

        {/* ÁREA CENTRAL DO DESENHO DA SERINGA */}
        <div className="relative w-full flex items-center justify-center py-2 sm:py-4">
          <svg
            viewBox="0 0 460 760"
            className="w-full max-w-[380px] sm:max-w-[420px] h-auto drop-shadow-md overflow-visible"
            role="img"
            aria-label={`Seringa de insulina 0,5 ml 50 UI agulha fixa com ${safeUnits} unidades puxadas`}
          >
            <defs>
              {/* ==================== GRADIENTES METÁLICOS E VIDRO ==================== */}
              {/* Cânula metálica da agulha fixa ultrafina */}
              <linearGradient id="needleCannulaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="35%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>

              {/* Conexão plástica reforçada integrada (bico transparente caneca flexível) */}
              <linearGradient id="reinforcedHubGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
                <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#F8FAFC" stopOpacity="0.75" />
                <stop offset="80%" stopColor="#CBD5E1" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.9" />
              </linearGradient>

              {/* Cilindro transparente de vidro (fundo vazio translúcido) */}
              <linearGradient id="glassEmptyBarrelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.75" />
                <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.35" />
                <stop offset="85%" stopColor="#F1F5F9" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.75" />
              </linearGradient>

              {/* Reflexo especular no vidro do cilindro (camada superior de brilho) */}
              <linearGradient id="glassSpecularShine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="12%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="26%" stopColor="#FFFFFF" stopOpacity="0.3" />
                <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="92%" stopColor="#FFFFFF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Líquido Tirzepatida Rosa Translúcido Vibrante */}
              <linearGradient id="liquidPinkVerticalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F43F8E" stopOpacity="0.88" />
                <stop offset="20%" stopColor="#FDA4AF" stopOpacity="0.92" />
                <stop offset="55%" stopColor="#F43F8E" stopOpacity="0.85" />
                <stop offset="85%" stopColor="#E11D48" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#BE123C" stopOpacity="0.95" />
              </linearGradient>

              {/* ==================== ÊMBOLO LARANJA VIBRANTE (MODELO DA FOTO) ==================== */}
              {/* Pistão de vedação LARANJA (conforme foto de referência) */}
              <linearGradient id="orangePistonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C2410C" />
                <stop offset="20%" stopColor="#EA580C" />
                <stop offset="45%" stopColor="#FF7A00" />
                <stop offset="70%" stopColor="#FFA62B" />
                <stop offset="90%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>

              {/* Anel de vedação do pistão laranja */}
              <linearGradient id="orangeSealRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9A3412" />
                <stop offset="30%" stopColor="#FF7A00" />
                <stop offset="70%" stopColor="#FFA62B" />
                <stop offset="100%" stopColor="#7C2D12" />
              </linearGradient>

              {/* Haste clara translúcida do êmbolo */}
              <linearGradient id="plungerTranslucentRodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#F1F5F9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.9" />
              </linearGradient>

              {/* Flange / Apoio de polegar LARANJA VIBRANTE da foto */}
              <linearGradient id="orangeThumbRestGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9A3412" />
                <stop offset="18%" stopColor="#EA580C" />
                <stop offset="45%" stopColor="#FF7A00" />
                <stop offset="65%" stopColor="#FFA62B" />
                <stop offset="85%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#7C2D12" />
              </linearGradient>

              {/* Flange para dedos no topo do cilindro (transparente esbranquiçado) */}
              <linearGradient id="fingerFlangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="75%" stopColor="#F1F5F9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.85" />
              </linearGradient>

              {/* Capa protetora laranja clássica */}
              <linearGradient id="needleCapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C2410C" />
                <stop offset="25%" stopColor="#EA580C" />
                <stop offset="50%" stopColor="#FF7A00" />
                <stop offset="80%" stopColor="#FFA62B" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>

              {/* Filtro de sombra suave */}
              <filter id="syringeVerticalShadow" x="-15%" y="-10%" width="130%" height="120%">
                <feDropShadow
                  dx="2"
                  dy="4"
                  stdDeviation="4"
                  floodColor="#0F172A"
                  floodOpacity="0.14"
                />
              </filter>

              {/* Brilho da agulha */}
              <filter id="needleSteelGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="1.5"
                  floodColor="#38BDF8"
                  floodOpacity="0.4"
                />
              </filter>
            </defs>

            {/* Sombra de apoio vertical da seringa */}
            <ellipse
              cx={barrelCenterX + 6}
              cy={thumbBaseY + 22}
              rx="48"
              ry="7"
              fill="#0F172A"
              opacity="0.12"
              className="transition-all duration-200 ease-out"
            />

            {/* ============================================================== */}
            {/* 1. ÊMBOLO MÓVEL: PISTÃO LARANJA + HASTE TRANSLÚCIDA + DISCO    */}
            {/*    (Desenha atrás do cilindro na renderização SVG)             */}
            {/* ============================================================== */}
            <g
              className="transition-all duration-200 ease-out"
              filter="url(#syringeVerticalShadow)"
            >
              {/* HASTE TRANSLÚCIDA DO ÊMBOLO (Perfil cruciforme característico) */}
              {/* Eixo central da haste */}
              <rect
                x={barrelCenterX - 8}
                y={pistonBottomY}
                width="16"
                height={Math.max(0, thumbBaseY - pistonBottomY)}
                fill="url(#plungerTranslucentRodGrad)"
                stroke="#CBD5E1"
                strokeWidth="0.8"
                rx="2"
              />
              {/* Nervura vertical de reforço (cruciforme) */}
              <line
                x1={barrelCenterX}
                y1={pistonBottomY}
                x2={barrelCenterX}
                y2={thumbBaseY}
                stroke="#94A3B8"
                strokeWidth="2"
                opacity="0.65"
              />
              {/* Nervura esquerda */}
              <line
                x1={barrelCenterX - 4}
                y1={pistonBottomY}
                x2={barrelCenterX - 4}
                y2={thumbBaseY}
                stroke="#FFFFFF"
                strokeWidth="1.2"
                opacity="0.8"
              />
              {/* Nervuras transversais da haste plástica */}
              {[40, 85, 130].map((offset) => {
                const ribY = pistonBottomY + offset
                if (ribY >= thumbBaseY - 10) return null
                return (
                  <rect
                    key={offset}
                    x={barrelCenterX - 11}
                    y={ribY}
                    width="22"
                    height="4"
                    rx="1.5"
                    fill="#E2E8F0"
                    stroke="#CBD5E1"
                    strokeWidth="0.6"
                    opacity="0.9"
                  />
                )
              })}

              {/* APOIO DO POLEGAR LARANJA VIBRANTE (THUMB REST - FIEL À FOTO) */}
              <g>
                {/* Garganta / encaixe cilíndrico que conecta a haste à flange laranja */}
                <rect
                  x={barrelCenterX - 14}
                  y={thumbBaseY - 14}
                  width="28"
                  height="14"
                  rx="3"
                  fill="url(#orangeThumbRestGrad)"
                  stroke="#9A3412"
                  strokeWidth="0.8"
                />
                {/* Flange / disco largo de apoio do polegar em laranja vibrante */}
                <rect
                  x={barrelCenterX - 28}
                  y={thumbBaseY}
                  width="56"
                  height="16"
                  rx="5"
                  fill="url(#orangeThumbRestGrad)"
                  stroke="#9A3412"
                  strokeWidth="1.2"
                />
                {/* Linha de brilho superior no disco laranja */}
                <rect
                  x={barrelCenterX - 24}
                  y={thumbBaseY + 2}
                  width="48"
                  height="3"
                  rx="1.5"
                  fill="#FFA62B"
                  opacity="0.8"
                />
                {/* Borda inferior arredondada com sombra */}
                <line
                  x1={barrelCenterX - 26}
                  y1={thumbBaseY + 14}
                  x2={barrelCenterX + 26}
                  y2={thumbBaseY + 14}
                  stroke="#7C2D12"
                  strokeWidth="1.2"
                />
                {/* Nervuras antiderrapantes para o polegar */}
                <line
                  x1={barrelCenterX - 18}
                  y1={thumbBaseY + 8}
                  x2={barrelCenterX + 18}
                  y2={thumbBaseY + 8}
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.75"
                />
              </g>

              {/* PISTÃO DE VEDAÇÃO LARANJA VIBRANTE DENTRO DO CILINDRO */}
              <g>
                {/* Corpo do pistão de borracha laranja */}
                <rect
                  x={barrelLeft + 1.5}
                  y={pistonTopY}
                  width={barrelWidth - 3}
                  height={pistonHeight}
                  fill="url(#orangePistonGrad)"
                  stroke="#9A3412"
                  strokeWidth="1"
                  rx="2"
                />
                {/* Lábio superior de vedação (alinhado rigorosamente à leitura da dose) */}
                <rect
                  x={barrelLeft + 1}
                  y={pistonTopY}
                  width={barrelWidth - 2}
                  height="5.5"
                  fill="url(#orangeSealRingGrad)"
                  rx="1"
                />
                {/* Aresta superior calibrada com brilho */}
                <line
                  x1={barrelLeft + 2}
                  y1={pistonTopY + 1}
                  x2={barrelRight - 2}
                  y2={pistonTopY + 1}
                  stroke="#FFA62B"
                  strokeWidth="1.2"
                />
                {/* Canal central de lubrificação / depressão entre os lábios de vedação */}
                <rect
                  x={barrelLeft + 3}
                  y={pistonTopY + 10}
                  width={barrelWidth - 6}
                  height="7"
                  fill="#9A3412"
                  opacity="0.5"
                  rx="1"
                />
                {/* Lábio inferior de vedação */}
                <rect
                  x={barrelLeft + 1}
                  y={pistonTopY + 21}
                  width={barrelWidth - 2}
                  height="6"
                  fill="url(#orangeSealRingGrad)"
                  rx="1"
                />
                {/* Reflexo vertical cilíndrico no pistão laranja */}
                <rect
                  x={barrelCenterX - 10}
                  y={pistonTopY + 2}
                  width="7"
                  height={pistonHeight - 4}
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
              x={barrelLeft}
              y={barrelTopY}
              width={barrelWidth}
              height={barrelBottomY - barrelTopY}
              fill="url(#glassEmptyBarrelGrad)"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              rx="3"
            />

            {/* ============================================================== */}
            {/* 3. LÍQUIDO ROSA TIRZEPATIDA (PUXADO DE CIMA PARA BAIXO)       */}
            {/* ============================================================== */}
            <g className="transition-all duration-200 ease-out">
              {liquidHeight > 0 && (
                <>
                  {/* Coluna de líquido rosa preenchendo do bico até o pistão */}
                  <rect
                    x={barrelLeft + 1.5}
                    y={barrelTopY}
                    width={barrelWidth - 3}
                    height={liquidHeight}
                    fill="url(#liquidPinkVerticalGrad)"
                  />

                  {/* Reflexo translúcido na lateral esquerda do líquido */}
                  <rect
                    x={barrelLeft + 3}
                    y={barrelTopY}
                    width="9"
                    height={liquidHeight}
                    fill="#FFFFFF"
                    opacity="0.45"
                  />

                  {/* Menisco nítido na interface líquido / pistão */}
                  <line
                    x1={barrelLeft + 2}
                    y1={pistonTopY}
                    x2={barrelRight - 2}
                    y2={pistonTopY}
                    stroke="#9F1239"
                    strokeWidth="2"
                    opacity="0.8"
                  />

                  {/* Microbolhas de ar animadas subindo no líquido quando há dose */}
                  {safeUnits > 6 && (
                    <g className="pointer-events-none">
                      <circle
                        cx={barrelCenterX - 11}
                        cy={Math.max(barrelTopY + 20, pistonTopY - 26)}
                        r="2.4"
                        fill="#FFFFFF"
                        opacity="0.85"
                        className="animate-bubble-1"
                      />
                      <circle
                        cx={barrelCenterX + 8}
                        cy={Math.max(barrelTopY + 36, pistonTopY - 48)}
                        r="1.8"
                        fill="#FFFFFF"
                        opacity="0.8"
                        className="animate-bubble-2"
                      />
                      <circle
                        cx={barrelCenterX - 3}
                        cy={Math.max(barrelTopY + 54, pistonTopY - 14)}
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
            {/*    (Foto: "Caneca flexível e mais segura contra separação")    */}
            {/* ============================================================== */}
            <g filter="url(#syringeVerticalShadow)">
              {/* Ombros curvos do topo do cilindro que convergem para o cone */}
              <path
                d={`M ${barrelLeft} ${barrelTopY} 
                    Q ${barrelLeft + 8} ${barrelTopY - 12} ${barrelCenterX - 16} ${barrelTopY - 14} 
                    L ${barrelCenterX + 16} ${barrelTopY - 14} 
                    Q ${barrelRight - 8} ${barrelTopY - 12} ${barrelRight} ${barrelTopY} Z`}
                fill="url(#reinforcedHubGrad)"
                stroke="#94A3B8"
                strokeWidth="1.2"
              />

              {/* Colar cilíndrico intermediário reforçado */}
              <rect
                x={barrelCenterX - 15}
                y="142"
                width="30"
                height="19"
                rx="2"
                fill="url(#reinforcedHubGrad)"
                stroke="#94A3B8"
                strokeWidth="1.1"
              />
              {/* Anéis de reforço no colar plástico */}
              <line
                x1={barrelCenterX - 15}
                y1="147"
                x2={barrelCenterX + 15}
                y2="147"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <line
                x1={barrelCenterX - 15}
                y1="154"
                x2={barrelCenterX + 15}
                y2="154"
                stroke="#94A3B8"
                strokeWidth="0.8"
              />

              {/* Cone afilado superior onde a agulha fixa fica cravada */}
              <polygon
                points={`${barrelCenterX - 10},142 ${barrelCenterX - 5},118 ${barrelCenterX + 5},118 ${barrelCenterX + 10},142`}
                fill="url(#reinforcedHubGrad)"
                stroke="#94A3B8"
                strokeWidth="1"
              />

              {/* Guia metálica interna da cânula fixa */}
              <rect
                x={barrelCenterX - 2}
                y="118"
                width="4"
                height="22"
                fill="#94A3B8"
                opacity="0.85"
                rx="0.5"
              />
            </g>

            {/* ============================================================== */}
            {/* 5. AGULHA FIXA ULTRAFINA (8 x 0,30 mm / 30G)                   */}
            {/* ============================================================== */}
            <g>
              {/* Brilho da cânula de aço cirúrgico */}
              <line
                x1={barrelCenterX}
                y1="28"
                x2={barrelCenterX}
                y2="118"
                stroke="#BAE6FD"
                strokeWidth="3.2"
                opacity="0.4"
                filter="url(#needleSteelGlow)"
              />

              {/* Cânula metálica ultrafina principal */}
              <line
                x1={barrelCenterX}
                y1="28"
                x2={barrelCenterX}
                y2="118"
                stroke="url(#needleCannulaGrad)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Linha de reflexo especular polido na agulha */}
              <line
                x1={barrelCenterX - 0.4}
                y1="32"
                x2={barrelCenterX - 0.4}
                y2="115"
                stroke="#FFFFFF"
                strokeWidth="0.7"
                opacity="0.95"
              />

              {/* Bisel trifacetado na ponta (corte cirúrgico cortante e afiado) */}
              <polygon
                points={`${barrelCenterX},28 ${barrelCenterX - 1.2},36 ${barrelCenterX + 1.2},36`}
                fill="url(#needleCannulaGrad)"
                stroke="#64748B"
                strokeWidth="0.3"
              />
              <polygon
                points={`${barrelCenterX},28 ${barrelCenterX - 0.8},34 ${barrelCenterX},34`}
                fill="#FFFFFF"
                opacity="0.9"
              />

              {/* Microgota de Tirzepatida pulsando na ponta da agulha quando carregada */}
              {safeUnits > 0 && !showCap && (
                <g className="animate-pulse">
                  <ellipse
                    cx={barrelCenterX}
                    cy="25.5"
                    rx="1.5"
                    ry="2.2"
                    fill="#F43F8E"
                    opacity="0.95"
                  />
                  <circle cx={barrelCenterX - 0.4} cy="24.8" r="0.6" fill="#FFFFFF" opacity="0.9" />
                </g>
              )}
            </g>

            {/* ============================================================== */}
            {/* 6. TAMPA PROTETORA LARANJA (COBRE AGULHA OU GUARDADA AO LADO)  */}
            {/* ============================================================== */}
            {showCap ? (
              /* Tampa colocada sobre a agulha */
              <g filter="url(#syringeVerticalShadow)" className="transition-all duration-300">
                {/* Tampa protetora cilíndrica com flange de encaixe */}
                <rect
                  x={barrelCenterX - 9}
                  y="20"
                  width="18"
                  height="102"
                  rx="3"
                  fill="url(#needleCapGrad)"
                  stroke="#9A3412"
                  strokeWidth="1"
                />
                {/* Flange inferior da tampa */}
                <rect
                  x={barrelCenterX - 13}
                  y="114"
                  width="26"
                  height="12"
                  rx="3"
                  fill="url(#needleCapGrad)"
                  stroke="#9A3412"
                  strokeWidth="1"
                />
                {/* Ranhuras verticais de aderência */}
                <line
                  x1={barrelCenterX - 4}
                  y1="26"
                  x2={barrelCenterX - 4}
                  y2="110"
                  stroke="#FFA62B"
                  strokeWidth="1.2"
                />
                <line
                  x1={barrelCenterX + 4}
                  y1="26"
                  x2={barrelCenterX + 4}
                  y2="110"
                  stroke="#7C2D12"
                  strokeWidth="1.2"
                />
                <line
                  x1={barrelCenterX}
                  y1="26"
                  x2={barrelCenterX}
                  y2="110"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <text
                  x={barrelCenterX}
                  y="72"
                  transform={`rotate(-90 ${barrelCenterX} 72)`}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="800"
                  fontFamily="Poppins, sans-serif"
                  letterSpacing="0.6px"
                >
                  TAMPA PROTETORA
                </text>
              </g>
            ) : (
              /* Tampa repousando ao lado da seringa (indicador discreto) */
              <g
                transform="translate(355, 36)"
                filter="url(#syringeVerticalShadow)"
                className="transition-all duration-300 opacity-90 hover:opacity-100 cursor-pointer"
                onClick={() => setShowCap(true)}
              >
                <rect
                  x="0"
                  y="0"
                  width="14"
                  height="78"
                  rx="2.5"
                  fill="url(#needleCapGrad)"
                  stroke="#9A3412"
                  strokeWidth="0.8"
                />
                <rect
                  x="-3"
                  y="70"
                  width="20"
                  height="10"
                  rx="2"
                  fill="url(#needleCapGrad)"
                  stroke="#9A3412"
                  strokeWidth="0.8"
                />
                <line
                  x1="7"
                  y1="4"
                  x2="7"
                  y2="68"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
                <text
                  x="7"
                  y="38"
                  transform="rotate(-90 7 38)"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="6.5"
                  fontWeight="800"
                  fontFamily="Poppins, sans-serif"
                >
                  TAMPA
                </text>
              </g>
            )}

            {/* ============================================================== */}
            {/* 7. PAREDES DE VIDRO EXTERNAS DO CILINDRO E FLANGE DOS DEDOS    */}
            {/* ============================================================== */}
            {/* Parede de vidro com contorno límpido */}
            <rect
              x={barrelLeft}
              y={barrelTopY}
              width={barrelWidth}
              height={barrelBottomY - barrelTopY}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              rx="3"
            />

            {/* FLANGE PARA OS DEDOS (FINGER GRIP) NA BASE DO CILINDRO (Y = 600) */}
            {/* Conforme a foto: abas translúcidas de apoio plano para os dedos */}
            <g filter="url(#syringeVerticalShadow)">
              {/* Colar traseiro que segura a flange */}
              <rect
                x={barrelCenterX - 24}
                y={barrelBottomY - 4}
                width="48"
                height="10"
                rx="2"
                fill="url(#fingerFlangeGrad)"
                stroke="#94A3B8"
                strokeWidth="1"
              />
              {/* Flange oval plana larga da foto */}
              <ellipse
                cx={barrelCenterX}
                cy={barrelBottomY + 8}
                rx="70"
                ry="9"
                fill="url(#fingerFlangeGrad)"
                stroke="#94A3B8"
                strokeWidth="1.6"
              />
              <ellipse
                cx={barrelCenterX}
                cy={barrelBottomY + 7}
                rx="64"
                ry="6.5"
                fill="#FFFFFF"
                fillOpacity="0.6"
              />
              {/* Brilhos plásticos na flange */}
              <line
                x1={barrelCenterX - 55}
                y1={barrelBottomY + 7}
                x2={barrelCenterX + 55}
                y2={barrelBottomY + 7}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* ============================================================== */}
            {/* 8. ESCALA GRADUADA FIEL À FOTO (5 A 50 UNITS + 60 DISCRETO)   */}
            {/* ============================================================== */}
            <g className="pointer-events-none select-none">
              {/* Linha vertical mestra da escala à esquerda dos traços */}
              <line
                x1={barrelLeft + 10}
                y1={scaleZeroY}
                x2={barrelLeft + 10}
                y2={scale50Y}
                stroke="#0F172A"
                strokeWidth="1.2"
              />

              {/* Traço e marca 0 (início) */}
              <line
                x1={barrelLeft + 10}
                y1={scaleZeroY}
                x2={barrelLeft + 24}
                y2={scaleZeroY}
                stroke="#0F172A"
                strokeWidth="1.6"
                strokeLinecap="square"
              />
              <text
                x={barrelLeft + 29}
                y={scaleZeroY + 3.5}
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
                    {/* Traço da escala apontando para dentro do cilindro */}
                    <line
                      x1={barrelLeft + 10}
                      y1={mark.y}
                      x2={barrelLeft + 10 + mark.tickWidth}
                      y2={mark.y}
                      stroke={mark.isBeyond50 ? '#64748B' : '#0F172A'}
                      strokeWidth={mark.isFive ? 1.6 : 0.9}
                      strokeLinecap="square"
                    />

                    {/* Números da escala (5, 10, 15, 20, 25, 30, 35, 40, 45, 50) */}
                    {mark.isLabeled && (
                      <text
                        x={barrelLeft + 29}
                        y={mark.y + 3.8}
                        fill="#0F172A"
                        fontSize="10"
                        fontWeight="800"
                        fontFamily="Poppins, sans-serif"
                        letterSpacing="-0.3px"
                      >
                        {mark.unit}
                      </text>
                    )}

                    {/* Marca discreta de 60 unidades para atender o limite 0-60 do app */}
                    {mark.unit === 60 && (
                      <text
                        x={barrelLeft + 29}
                        y={mark.y + 3.5}
                        fill="#64748B"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="Poppins, sans-serif"
                      >
                        60
                      </text>
                    )}
                  </g>
                )
              })}

              {/* RÓTULO "UNITS" EM NEGRITO IMPRESSO NO CILINDRO (COMO NA FOTO, LOGO ABAIXO DO 50) */}
              <text
                x={barrelCenterX}
                y={scale50Y + 22}
                textAnchor="middle"
                fill="#0F172A"
                fontSize="9.5"
                fontWeight="900"
                fontFamily="Poppins, sans-serif"
                letterSpacing="0.8px"
              >
                UNITS
              </text>

              {/* Selo impresso no cilindro: 0,5 ml / 50 UI */}
              <text
                x={barrelCenterX}
                y={scale50Y + 34}
                textAnchor="middle"
                fill="#64748B"
                fontSize="7"
                fontWeight="700"
                fontFamily="Poppins, sans-serif"
                letterSpacing="0.4px"
              >
                0,5 ml • 50 UI
              </text>
            </g>

            {/* ============================================================== */}
            {/* 9. REFLEXO CRISTALINO ESPECULAR DO VIDRO (SOBREPOSTO À ESCALA) */}
            {/* ============================================================== */}
            <rect
              x={barrelLeft}
              y={barrelTopY}
              width={barrelWidth}
              height={barrelBottomY - barrelTopY}
              fill="url(#glassSpecularShine)"
              rx="3"
              pointerEvents="none"
            />

            {/* ============================================================== */}
            {/* 10. TAG FLUTUANTE DE DOSE COM INDICADOR EM TEMPO REAL          */}
            {/*     (Posicionada na altura do pistão / nível do líquido)       */}
            {/* ============================================================== */}
            <g
              className="transition-all duration-200 ease-out pointer-events-none"
              transform={`translate(0, ${pistonTopY})`}
            >
              {/* Linha pontilhada horizontal conectando o cilindro à tag flutuante */}
              <line
                x1={barrelLeft - 10}
                y1="0"
                x2={barrelLeft + 2}
                y2="0"
                stroke="#F43F8E"
                strokeWidth="2.2"
                strokeDasharray="3 2"
              />

              {/* Pílula flutuante estilizada à esquerda do cilindro */}
              <g transform="translate(18, 0)" filter="url(#syringeVerticalShadow)">
                {/* Balão de dose com coroa rosa vibrante */}
                <rect
                  x="0"
                  y="-18"
                  width="160"
                  height="36"
                  rx="18"
                  fill="#FFFFFF"
                  stroke="#F43F8E"
                  strokeWidth="2"
                />
                {/* Fundo colorido na tag */}
                <rect
                  x="3"
                  y="-15"
                  width="154"
                  height="30"
                  rx="15"
                  fill="url(#liquidPinkVerticalGrad)"
                />
                {/* Texto da dose */}
                <text
                  x="80"
                  y="4"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="800"
                  fontFamily="Poppins, sans-serif"
                >
                  {safeUnits} un {mgEquivalent !== undefined ? `• ${mgEquivalent}mg` : ''}
                </text>

                {/* Seta do balão apontando para o nível do pistão */}
                <polygon points="160,-5 170,0 160,5" fill="#F43F8E" />
              </g>

              {/* Marcador pulsante pontual exatamente no menisco/vedação */}
              <circle
                cx={barrelLeft}
                cy="0"
                r="3.5"
                fill="#F43F8E"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="animate-ping"
              />
              <circle cx={barrelLeft} cy="0" r="3" fill="#F43F8E" />
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
