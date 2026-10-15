import { useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface SyringeAnimationProps {
  units: number // 0 to 60 (or up to 100)
  maxUnits?: number
  mgEquivalent?: number
}

/**
 * Seringa de Insulina U-100 (1ml) Animada de Alta Fidelidade
 * - Agulha metálica ultrafina de aço inoxidável VISÍVEL com cânula polida, brilho especular e bisel trifacetado cortante na ponta
 * - Cone/hub plástico transparente conectando a agulha ao cilindro
 * - Tampa de proteção laranja mostrada destacada/removida ao lado (ou com toggle tampa/agulha descoberta)
 * - Cilindro de vidro/polipropileno cristalino com gradiente de profundidade, reflexos e sombra
 * - Graduações U-100 nítidas numeradas de 10 em 10 (0 a 100) e rótulo UNITS
 * - Borracha preta de vedação de duplo lábio conectada ao êmbolo
 * - Flange de apoio para os dedos e haste cruciforme com disco traseiro
 * - Menisco de líquido rosa Tirzepatida com brilho e microbolhas animadas
 * - Tag flutuante com a dose em unidades e mg
 */
export default function SyringeAnimation({
  units,
  maxUnits = 60,
  mgEquivalent,
}: SyringeAnimationProps) {
  // Limites
  const safeUnits = Math.max(0, Math.min(maxUnits, units))
  const totalScaleUnits = 100

  // Estado para permitir ver a agulha com a tampa posicionada ao lado ou guardada
  const [showCapResting, setShowCapResting] = useState<boolean>(true)

  // Geometria horizontal no viewBox SVG (0 0 840 180)
  // Eixo Y central: 90
  // Agulha metálica:
  // Ponta da agulha em x = 45, comprimento da cânula até x = 150 (105px de aço brilhante visível)
  // Bisel da agulha em x = 45 a 57
  // Hub plástico (cone de fixação da agulha): x = 150 a 170
  // Cilindro (barrel): x = 170 a 580 (comprimento 410px)
  // Altura do cilindro: 36px (y: 72 a 108)
  // Flange para dedos: x = 582
  // Escala graduada 0 a 100 UNITS:
  // Marca 0 UNITS em x = 195
  // Marca 100 UNITS em x = 535
  // Escala útil = 340px (3.4px por unidade)
  const barrelY = 72
  const barrelHeight = 36
  const barrelCenterY = 90
  const barrelStartX = 170
  const barrelEndX = 575

  const scaleStartX = 195
  const scaleEndX = 535
  const scaleLength = scaleEndX - scaleStartX // 340px

  // Posição do líquido e do pistão móvel
  const liquidTargetX = scaleStartX + (safeUnits / totalScaleUnits) * scaleLength
  const liquidWidth = Math.max(0, liquidTargetX - barrelStartX)

  // Borracha preta do pistão
  const pistonFrontX = barrelStartX + liquidWidth
  const pistonWidth = 16

  // Haste do êmbolo e disco traseiro
  const rodLength = 170
  const thumbDiscX = pistonFrontX + pistonWidth + rodLength

  // Gerador de marcas de graduação (0 a 100 de 2 em 2 unidades)
  const graduationMarks = useMemo(() => {
    const marks = []
    for (let u = 0; u <= 100; u += 2) {
      const x = scaleStartX + (u / totalScaleUnits) * scaleLength
      const isMajor = u % 10 === 0
      const isMid = !isMajor && u % 5 === 0

      marks.push({
        unit: u,
        x,
        isMajor,
        isMid,
        height: isMajor ? 12 : isMid ? 8.5 : 5,
      })
    }
    return marks
  }, [scaleStartX, scaleLength, totalScaleUnits])

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center select-none">
      <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-white to-[#FCE4EC]/35 rounded-3xl p-3 sm:p-5 border border-[#F9A8C9]/40 shadow-inner">
        {/* Barra superior de status da agulha */}
        <div className="flex items-center justify-between px-2 sm:px-4 pb-2 text-[11px]">
          <div className="flex items-center gap-1.5 font-semibold text-gray-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#1F1A1D] font-bold">Agulha U-100 Visível</span>
            <span className="text-gray-400 hidden sm:inline">(Aço inox 31G ultrafina de 8mm)</span>
          </div>

          <button
            type="button"
            onClick={() => setShowCapResting(!showCapResting)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#F43F8E] hover:text-[#D63370] px-2.5 py-1 rounded-xl bg-white border border-[#F9A8C9]/40 hover:bg-[#FCE4EC]/40 transition shadow-2xs"
          >
            {showCapResting ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ocultar capa protetora</span>
                <span className="sm:hidden">Capa</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mostrar capa protetora</span>
                <span className="sm:hidden">Capa</span>
              </>
            )}
          </button>
        </div>

        {/* SVG DA SERINGA */}
        <svg
          viewBox="0 0 840 180"
          className="w-full h-auto drop-shadow-sm overflow-visible"
          role="img"
          aria-label={`Seringa de insulina U-100 com agulha visível marcando ${safeUnits} unidades`}
        >
          <defs>
            {/* Gradiente da Agulha Metálica de Aço Inoxidável */}
            <linearGradient id="needleSteelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="75%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            {/* Brilho especular metálico ao longo do eixo da agulha */}
            <linearGradient id="needleShineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="30%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            {/* Gradiente do cone/hub transparente da agulha */}
            <linearGradient id="needleHubGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#E2E8F0" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#CBD5E1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.9" />
            </linearGradient>

            {/* Gradiente da tampa laranja clássica */}
            <linearGradient id="orangeCapGradV2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA62B" />
              <stop offset="30%" stopColor="#FF7A00" />
              <stop offset="70%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>

            {/* Brilho da tampa de plástico */}
            <linearGradient id="capHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
            </linearGradient>

            {/* Gradiente do líquido rosa Tirzepatida com brilho */}
            <linearGradient id="liquidPinkGradV2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F9A8C9" stopOpacity="0.92" />
              <stop offset="40%" stopColor="#F43F8E" stopOpacity="0.88" />
              <stop offset="85%" stopColor="#E11D48" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#BE123C" stopOpacity="0.95" />
            </linearGradient>

            {/* Reflexo superior do líquido */}
            <linearGradient id="liquidSurfaceShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Gradiente do corpo cilíndrico de vidro (reflexo cristalino e profundidade) */}
            <linearGradient id="glassBarrelShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="85%" stopColor="#64748B" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.6" />
            </linearGradient>

            {/* Fundo sutil do cilindro vazio (translúcido) */}
            <linearGradient id="emptyBarrelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#F8FAFC" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.65" />
            </linearGradient>

            {/* Gradiente da borracha preta de duplo lábio do pistão */}
            <linearGradient id="rubberPistonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="25%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1E293B" />
              <stop offset="85%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Haste do êmbolo (plástico branco de engenharia) */}
            <linearGradient id="plungerRodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            {/* Sombra suave geral */}
            <filter id="syringeDropShadow" x="-5%" y="-15%" width="110%" height="130%">
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="3.5"
                floodColor="#0F172A"
                floodOpacity="0.12"
              />
            </filter>

            {/* Brilho da agulha */}
            <filter id="needleGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="1"
                floodColor="#38BDF8"
                floodOpacity="0.35"
              />
            </filter>
          </defs>

          {/* Sombra de projeção na base da seringa */}
          <ellipse
            cx="390"
            cy="126"
            rx="330"
            ry="7"
            fill="#0F172A"
            opacity="0.06"
            filter="url(#syringeDropShadow)"
          />

          {/* ================================================================ */}
          {/* 1. AGULHA METÁLICA VISÍVEL (DESTAQUE PRINCIPAL DO REDESENHO)      */}
          {/* ================================================================ */}
          <g filter="url(#syringeDropShadow)">
            {/* Brilho sutil em volta da agulha */}
            <line
              x1="45"
              y1={barrelCenterY}
              x2="152"
              y2={barrelCenterY}
              stroke="#BAE6FD"
              strokeWidth="3.6"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Cânula metálica principal de aço inoxidável (31G, extremamente fina e polida) */}
            <line
              x1="45"
              y1={barrelCenterY}
              x2="152"
              y2={barrelCenterY}
              stroke="url(#needleSteelGrad)"
              strokeWidth="1.9"
              strokeLinecap="round"
            />

            {/* Linha de reflexo especular de luz na aresta superior da agulha */}
            <line
              x1="52"
              y1={barrelCenterY - 0.55}
              x2="150"
              y2={barrelCenterY - 0.55}
              stroke="#FFFFFF"
              strokeWidth="0.75"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* Bisel trifacetado na ponta (corte cirúrgico em ângulo de 12-14 graus) */}
            {/* Faceta primária do bisel */}
            <polygon
              points="45,90 56,88.9 56,91.1"
              fill="url(#needleSteelGrad)"
              stroke="#64748B"
              strokeWidth="0.4"
            />
            {/* Faceta secundária de reflexo no corte chanfrado */}
            <polygon points="45,90 53,89.1 49,90" fill="#FFFFFF" opacity="0.9" />
            {/* Ponta da agulha (ponto afiado de perfuração) */}
            <circle cx="45" cy="90" r="0.7" fill="#E2E8F0" />

            {/* Gota minúscula de medicamento brilhando na ponta da agulha quando há dose */}
            {safeUnits > 0 && (
              <g className="animate-pulse">
                <circle cx="43.5" cy="90" r="1.3" fill="#F43F8E" opacity="0.95" />
                <circle cx="43" cy="89.6" r="0.5" fill="#FFFFFF" opacity="0.9" />
              </g>
            )}

            {/* ================================================================ */}
            {/* 2. CONE / BOCAL (HUB PLÁSTICO TRANSLÚCIDO) ONDE A AGULHA ENTRA     */}
            {/* ================================================================ */}
            {/* Fixador metálico interno no hub */}
            <rect x="146" y={barrelCenterY - 2.5} width="6" height="5" fill="#94A3B8" rx="0.8" />

            {/* Cone frontal afilado */}
            <path
              d={`M 148 ${barrelCenterY - 4} L 160 ${barrelCenterY - 7} L 160 ${barrelCenterY + 7} L 148 ${barrelCenterY + 4} Z`}
              fill="url(#needleHubGrad)"
              stroke="#94A3B8"
              strokeWidth="1"
            />

            {/* Base do cone / anel adaptador que se junta ao cilindro de vidro */}
            <path
              d={`M 160 ${barrelCenterY - 7} L ${barrelStartX} ${barrelY + 1} L ${barrelStartX} ${barrelY + barrelHeight - 1} L 160 ${barrelCenterY + 7} Z`}
              fill="url(#needleHubGrad)"
              stroke="#94A3B8"
              strokeWidth="1.2"
            />

            {/* Anéis de reforço do bico da seringa */}
            <line
              x1="154"
              y1={barrelCenterY - 5}
              x2="154"
              y2={barrelCenterY + 5}
              stroke="#64748B"
              strokeWidth="0.8"
              opacity="0.6"
            />
            <line
              x1="162"
              y1={barrelCenterY - 9}
              x2="162"
              y2={barrelCenterY + 9}
              stroke="#64748B"
              strokeWidth="0.9"
              opacity="0.6"
            />
          </g>

          {/* ================================================================ */}
          {/* 3. CAPA PROTETORA LARANJA (DESCOBERTA / REPOUSANDO AO LADO)       */}
          {/* ================================================================ */}
          {showCapResting && (
            <g
              transform="translate(40, 24)"
              filter="url(#syringeDropShadow)"
              className="transition-all duration-300"
            >
              {/* Sombra da capa descansando na bancada */}
              <ellipse cx="60" cy="20" rx="54" ry="4" fill="#0F172A" opacity="0.08" />

              {/* Corpo da capa protetora laranja clássica com nervuras */}
              <g>
                {/* Colar / aba traseira da capa */}
                <rect
                  x="108"
                  y="5"
                  width="7"
                  height="22"
                  rx="2.5"
                  fill="url(#orangeCapGradV2)"
                  stroke="#C2410C"
                  strokeWidth="0.8"
                />

                {/* Corpo cilíndrico alongado */}
                <rect
                  x="18"
                  y="6.5"
                  width="92"
                  height="19"
                  rx="2"
                  fill="url(#orangeCapGradV2)"
                  stroke="#C2410C"
                  strokeWidth="0.8"
                />

                {/* Borda frontal reforçada */}
                <rect
                  x="12"
                  y="5.5"
                  width="7"
                  height="21"
                  rx="2.5"
                  fill="url(#orangeCapGradV2)"
                  stroke="#C2410C"
                  strokeWidth="0.8"
                />

                {/* Nervuras longitudinais de pegada (grip da tampa) */}
                <line x1="20" y1="9" x2="108" y2="9" stroke="#FFA62B" strokeWidth="1.2" />
                <line
                  x1="20"
                  y1="12"
                  x2="108"
                  y2="12"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.55"
                />
                <line
                  x1="20"
                  y1="16"
                  x2="108"
                  y2="16"
                  stroke="#C2410C"
                  strokeWidth="1"
                  opacity="0.7"
                />
                <line
                  x1="20"
                  y1="20"
                  x2="108"
                  y2="20"
                  stroke="#9A3412"
                  strokeWidth="1.2"
                  opacity="0.8"
                />

                {/* Ranhuras verticais características */}
                {[35, 50, 65, 80, 95].map((gx) => (
                  <line
                    key={gx}
                    x1={gx}
                    y1="7"
                    x2={gx}
                    y2="25"
                    stroke="#C2410C"
                    strokeWidth="0.8"
                    opacity="0.45"
                  />
                ))}

                {/* Brilho da capa de plástico */}
                <rect
                  x="18"
                  y="6.5"
                  width="92"
                  height="19"
                  rx="2"
                  fill="url(#capHighlight)"
                  pointerEvents="none"
                />

                {/* Rótulo da capa aberta */}
                <text
                  x="64"
                  y="18.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="Poppins, sans-serif"
                  letterSpacing="0.4px"
                  opacity="0.9"
                >
                  TAMPA REMOVIDA
                </text>
              </g>
            </g>
          )}

          {/* ================================================================ */}
          {/* 4. ÊMBOLO MÓVEL: Borracha preta + Haste cruciforme + Disco         */}
          {/* ================================================================ */}
          <g className="transition-all duration-150 ease-out">
            {/* Haste do êmbolo (perfil cruciforme branco reforçado) */}
            {/* Haste horizontal principal */}
            <rect
              x={pistonFrontX + pistonWidth}
              y={barrelCenterY - 5.5}
              width={Math.max(0, thumbDiscX - (pistonFrontX + pistonWidth))}
              height="11"
              fill="url(#plungerRodGrad)"
              stroke="#CBD5E1"
              strokeWidth="0.8"
              rx="1"
            />
            {/* Aresta longitudinal da nervura em cruz */}
            <line
              x1={pistonFrontX + pistonWidth}
              y1={barrelCenterY}
              x2={thumbDiscX}
              y2={barrelCenterY}
              stroke="#94A3B8"
              strokeWidth="1.5"
              opacity="0.7"
            />
            {/* Nervuras transversais da haste plástica */}
            <line
              x1={pistonFrontX + pistonWidth + 12}
              y1={barrelCenterY - 11}
              x2={pistonFrontX + pistonWidth + 12}
              y2={barrelCenterY + 11}
              stroke="#94A3B8"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <rect
              x={pistonFrontX + pistonWidth + 10}
              y={barrelCenterY - 10}
              width="4"
              height="20"
              fill="#E2E8F0"
              rx="1"
            />

            {/* Disco traseiro do polegar (Thumb rest com flange e nervuras) */}
            <g>
              {/* Disco externo com chanfro */}
              <ellipse
                cx={thumbDiscX + 5}
                cy={barrelCenterY}
                rx="5"
                ry="18"
                fill="#E2E8F0"
                stroke="#94A3B8"
                strokeWidth="1.2"
              />
              {/* Face do botão onde o polegar empurra */}
              <ellipse
                cx={thumbDiscX + 2.5}
                cy={barrelCenterY}
                rx="4"
                ry="16"
                fill="url(#plungerRodGrad)"
                stroke="#CBD5E1"
                strokeWidth="0.9"
              />
              {/* Textura anti-derrapante circular no botão */}
              <ellipse
                cx={thumbDiscX + 2}
                cy={barrelCenterY}
                rx="2"
                ry="11"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="0.8"
                strokeDasharray="2 1.5"
                opacity="0.6"
              />
              {/* Brilho da borda do botão */}
              <line
                x1={thumbDiscX + 2.5}
                y1={barrelCenterY - 13}
                x2={thumbDiscX + 2.5}
                y2={barrelCenterY + 13}
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            </g>

            {/* PISTÃO: Borracha preta de duplo lábio de vedação médica */}
            <g>
              {/* Corpo de borracha sintética preta */}
              <rect
                x={pistonFrontX}
                y={barrelY + 1.2}
                width={pistonWidth}
                height={barrelHeight - 2.4}
                fill="url(#rubberPistonGrad)"
                rx="2"
              />
              {/* Primeiro anel frontal de vedação (alinhado rigorosamente com a marca da escala) */}
              <line
                x1={pistonFrontX + 2.5}
                y1={barrelY + 1.5}
                x2={pistonFrontX + 2.5}
                y2={barrelY + barrelHeight - 1.5}
                stroke="#64748B"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Ranhura intermediária de lubrificação / depressão */}
              <line
                x1={pistonFrontX + 8}
                y1={barrelY + 2.5}
                x2={pistonFrontX + 8}
                y2={barrelY + barrelHeight - 2.5}
                stroke="#020617"
                strokeWidth="3.2"
              />
              {/* Segundo anel traseiro de vedação */}
              <line
                x1={pistonFrontX + 13.5}
                y1={barrelY + 1.5}
                x2={pistonFrontX + 13.5}
                y2={barrelY + barrelHeight - 1.5}
                stroke="#475569"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Reflexo cilíndrico na borracha */}
              <line
                x1={pistonFrontX + 1.5}
                y1={barrelY + 4}
                x2={pistonFrontX + pistonWidth - 1.5}
                y2={barrelY + 4}
                stroke="#94A3B8"
                strokeWidth="1.2"
                opacity="0.8"
              />
            </g>
          </g>

          {/* ================================================================ */}
          {/* 5. FUNDO VAZIO DO CILINDRO TRANSLÚCIDO                           */}
          {/* ================================================================ */}
          <rect
            x={barrelStartX}
            y={barrelY}
            width={barrelEndX - barrelStartX}
            height={barrelHeight}
            fill="url(#emptyBarrelGrad)"
            rx="2"
          />

          {/* ================================================================ */}
          {/* 6. LÍQUIDO ROSA TIRZEPATIDA (PREENCHIMENTO DINÂMICO)             */}
          {/* ================================================================ */}
          <g>
            <rect
              x={barrelStartX}
              y={barrelY + 1.5}
              width={liquidWidth}
              height={barrelHeight - 3}
              fill="url(#liquidPinkGradV2)"
              className="transition-all duration-150 ease-out"
            />

            {/* Reflexo de luz na camada superior do líquido rosa */}
            <rect
              x={barrelStartX}
              y={barrelY + 1.5}
              width={liquidWidth}
              height={barrelHeight * 0.4}
              fill="url(#liquidSurfaceShine)"
              className="transition-all duration-150 ease-out"
            />

            {/* Menisco da frente do líquido em contato com a borracha */}
            {liquidWidth > 2 && (
              <line
                x1={liquidTargetX}
                y1={barrelY + 1.8}
                x2={liquidTargetX}
                y2={barrelY + barrelHeight - 1.8}
                stroke="#9F1239"
                strokeWidth="2"
                opacity="0.95"
              />
            )}

            {/* Bolhas de ar dinâmicas no líquido */}
            {liquidWidth > 35 && (
              <g className="pointer-events-none">
                <circle
                  cx={barrelStartX + Math.min(liquidWidth - 22, 35)}
                  cy={barrelCenterY - 4}
                  r="2.2"
                  fill="#FFFFFF"
                  opacity="0.8"
                  className="animate-bubble-1"
                />
                <circle
                  cx={barrelStartX + Math.min(liquidWidth - 14, Math.max(25, liquidWidth * 0.48))}
                  cy={barrelCenterY + 5}
                  r="1.8"
                  fill="#FFFFFF"
                  opacity="0.75"
                  className="animate-bubble-2"
                />
                <circle
                  cx={barrelStartX + Math.min(liquidWidth - 8, Math.max(18, liquidWidth * 0.78))}
                  cy={barrelCenterY - 2}
                  r="2.5"
                  fill="#FFFFFF"
                  opacity="0.8"
                  className="animate-bubble-3"
                />
              </g>
            )}
          </g>

          {/* ================================================================ */}
          {/* 7. PAREDES DE VIDRO/PLÁSTICO E FLANGE (APOIO DE DEDOS)           */}
          {/* ================================================================ */}
          <g>
            {/* Parede externa do cilindro com contorno limpo */}
            <rect
              x={barrelStartX}
              y={barrelY}
              width={barrelEndX - barrelStartX}
              height={barrelHeight}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.8"
              rx="2.5"
            />

            {/* Suporte cilíndrico traseiro (pescoço que segura a flange) */}
            <rect
              x={barrelEndX}
              y={barrelY + 3}
              width="18"
              height={barrelHeight - 6}
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              opacity="0.9"
            />
            <line
              x1={barrelEndX}
              y1={barrelCenterY - 9}
              x2={barrelEndX + 18}
              y2={barrelCenterY - 9}
              stroke="#94A3B8"
              strokeWidth="0.8"
            />
            <line
              x1={barrelEndX}
              y1={barrelCenterY + 9}
              x2={barrelEndX + 18}
              y2={barrelCenterY + 9}
              stroke="#94A3B8"
              strokeWidth="0.8"
            />

            {/* FLANGE PARA OS DEDOS (DESIGN FIEL À FOTO COM ABAS CIRCULARES PLANAS) */}
            <g>
              {/* Flange oval maior com contorno e reflexo */}
              <ellipse
                cx={barrelEndX + 20}
                cy={barrelCenterY}
                rx="6.5"
                ry="38"
                fill="#F1F5F9"
                stroke="#94A3B8"
                strokeWidth="1.8"
              />
              <ellipse
                cx={barrelEndX + 20}
                cy={barrelCenterY}
                rx="4.5"
                ry="34"
                fill="#FFFFFF"
                fillOpacity="0.55"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              {/* Brilhos plásticos na flange */}
              <path
                d={`M ${barrelEndX + 18} ${barrelCenterY - 32} Q ${barrelEndX + 22} ${barrelCenterY - 26} ${barrelEndX + 21} ${barrelCenterY - 14}`}
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M ${barrelEndX + 18} ${barrelCenterY + 32} Q ${barrelEndX + 22} ${barrelCenterY + 26} ${barrelEndX + 21} ${barrelCenterY + 14}`}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </g>

          {/* ================================================================ */}
          {/* 8. ESCALA GRADUADA U-100 (0 A 100 COM TEXTO "UNITS")             */}
          {/* ================================================================ */}
          <g className="pointer-events-none select-none">
            {/* Marca 0 (Zero) */}
            <line
              x1={scaleStartX}
              y1={barrelY + 1}
              x2={scaleStartX}
              y2={barrelY + 13}
              stroke="#0F172A"
              strokeWidth="1.6"
            />
            <line
              x1={scaleStartX}
              y1={barrelY + barrelHeight - 1}
              x2={scaleStartX}
              y2={barrelY + barrelHeight - 13}
              stroke="#0F172A"
              strokeWidth="1.6"
            />
            <text
              x={scaleStartX}
              y={barrelCenterY + 3.8}
              textAnchor="middle"
              fill="#0F172A"
              fontSize="9.5"
              fontWeight="800"
              fontFamily="Poppins, sans-serif"
            >
              0
            </text>

            {/* Graduações de 2 a 100 */}
            {graduationMarks.map((mark) => {
              if (mark.unit === 0) return null

              return (
                <g key={mark.unit}>
                  {/* Traço superior */}
                  <line
                    x1={mark.x}
                    y1={barrelY + 1}
                    x2={mark.x}
                    y2={barrelY + 1 + mark.height}
                    stroke="#0F172A"
                    strokeWidth={mark.isMajor ? 1.5 : mark.isMid ? 1.05 : 0.75}
                    strokeLinecap="square"
                  />

                  {/* Traço inferior simétrico */}
                  <line
                    x1={mark.x}
                    y1={barrelY + barrelHeight - 1}
                    x2={mark.x}
                    y2={barrelY + barrelHeight - 1 - mark.height}
                    stroke="#0F172A"
                    strokeWidth={mark.isMajor ? 1.5 : mark.isMid ? 1.05 : 0.75}
                    strokeLinecap="square"
                  />

                  {/* Números nas marcas de 10 em 10 (10, 20, 30... 100) */}
                  {mark.isMajor && (
                    <text
                      x={mark.x}
                      y={barrelCenterY + 3.8}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize={mark.unit === 100 ? '8.5' : '9'}
                      fontWeight="800"
                      fontFamily="Poppins, sans-serif"
                      letterSpacing="-0.3px"
                    >
                      {mark.unit}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Rótulo "UNITS" na extremidade da escala */}
            <text
              x={scaleEndX + 2}
              y={barrelY + barrelHeight + 12}
              textAnchor="middle"
              fill="#1E293B"
              fontSize="8"
              fontWeight="800"
              fontFamily="Poppins, sans-serif"
              letterSpacing="0.6px"
            >
              UNITS
            </text>
          </g>

          {/* ================================================================ */}
          {/* 9. REFLEXO CRISTALINO DO VIDRO (SOBREPOSTO À ESCALA E LÍQUIDO)    */}
          {/* ================================================================ */}
          <rect
            x={barrelStartX}
            y={barrelY}
            width={barrelEndX - barrelStartX}
            height={barrelHeight}
            fill="url(#glassBarrelShine)"
            rx="2.5"
            pointerEvents="none"
          />

          {/* ================================================================ */}
          {/* 10. TAG FLUTUANTE DE LEITURA (ALINHADA À DOSE SELECIONADA)        */}
          {/* ================================================================ */}
          <g
            className="transition-all duration-150 ease-out pointer-events-none"
            transform={`translate(${liquidTargetX}, 0)`}
          >
            {/* Linha pontilhada descendo até a marca */}
            <line
              x1="0"
              y1={barrelY - 14}
              x2="0"
              y2={barrelY}
              stroke="#F43F8E"
              strokeWidth="2"
              strokeDasharray="2.5 2"
            />

            {/* Tag em pílula com unidades e mg */}
            <g filter="url(#syringeDropShadow)">
              <rect x="-32" y={barrelY - 38} width="64" height="22" rx="11" fill="#F43F8E" />
              <text
                x="0"
                y={barrelY - 23.5}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="800"
                fontFamily="Poppins, sans-serif"
              >
                {safeUnits} un {mgEquivalent !== undefined ? `• ${mgEquivalent}mg` : ''}
              </text>
              {/* Setinha apontando para a escala */}
              <polygon
                points="-4.5,44 4.5,44 0,51"
                transform={`translate(0, ${barrelY - 50})`}
                fill="#F43F8E"
              />
            </g>
          </g>
        </svg>

        {/* Régua inferior de referência */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 px-3 sm:px-10 mt-2">
          <span>0 un (Início)</span>
          <span>20 un (5,0 mg)</span>
          <span>40 un (10,0 mg)</span>
          <span className="text-[#F43F8E] font-bold">60 un (15,0 mg • Limite Tereza)</span>
          <span className="text-gray-400 hidden sm:inline">80 un</span>
          <span className="text-gray-400 hidden sm:inline">100 un (1,0 ml)</span>
        </div>
      </div>
    </div>
  )
}
