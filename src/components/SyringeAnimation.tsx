import { useMemo } from 'react'

interface SyringeAnimationProps {
  units: number // 0 to 60
  maxUnits?: number
}

export default function SyringeAnimation({ units, maxUnits = 60 }: SyringeAnimationProps) {
  // Garantir limites
  const safeUnits = Math.max(0, Math.min(maxUnits, units))
  const fillRatio = safeUnits / maxUnits // 0 to 1

  // Geometria da Seringa no SVG (viewBox 0 0 640 180)
  // Corpo cilíndrico de vidro:
  // x = 110 até x = 490 (largura 380)
  // y = 50 até y = 130 (altura 80)
  const barrelX = 110
  const barrelY = 50
  const barrelWidth = 380
  const barrelHeight = 80

  // O líquido preenche da ponta esquerda do barril (x=110) até onde o êmbolo estiver puxado
  const liquidWidth = Math.max(0, barrelWidth * fillRatio)

  // O êmbolo tem uma borracha cinza na frente, que fica exatamente no limite do líquido
  const plungerRubberX = barrelX + liquidWidth

  // As marcações de escala vão de 0 a 60 com intervalos de 5 unidades
  const tickMarks = useMemo(() => {
    const marks = []
    const step = 5
    for (let u = 0; u <= maxUnits; u += step) {
      const x = barrelX + (u / maxUnits) * barrelWidth
      const isMajor = u % 10 === 0
      marks.push({
        unit: u,
        x,
        isMajor,
        height: isMajor ? 16 : 9,
      })
    }
    return marks
  }, [maxUnits, barrelX, barrelWidth])

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#FCE4EC]/40 to-white/90 rounded-3xl p-4 sm:p-6 border border-[#F9A8C9]/40 shadow-inner">
        <svg
          viewBox="0 0 640 180"
          className="w-full h-auto drop-shadow-md overflow-visible"
          role="img"
          aria-label={`Seringa graduada marcando ${safeUnits} unidades`}
        >
          <defs>
            {/* Gradiente do líquido rosa */}
            <linearGradient id="syringeLiquid" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F9A8C9" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#F43F8E" stopOpacity="0.80" />
              <stop offset="100%" stopColor="#D63370" stopOpacity="0.88" />
            </linearGradient>

            {/* Gradiente do vidro reflexivo */}
            <linearGradient id="glassShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="80%" stopColor="#000000" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
            </linearGradient>

            {/* Gradiente da haste do êmbolo (alaranjado/pêssego clínico) */}
            <linearGradient id="plungerRod" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="50%" stopColor="#FDBA74" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>

            {/* Filtro de sombra suave */}
            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* 1. PONTA DA AGULHA (Hub + Cânula de aço) à esquerda */}
          <g>
            {/* Cânula metálica ultrafina */}
            <line
              x1="20"
              y1="90"
              x2="85"
              y2="90"
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Bisel da agulha */}
            <polygon points="20,90 28,88 28,92" fill="#64748B" />

            {/* Hub / Cone Luer Lock da seringa */}
            <polygon
              points="85,76 110,70 110,110 85,104"
              fill="#E2E8F0"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            {/* Detalhe rosa no anel do hub */}
            <rect x="98" y="72" width="6" height="36" fill="#F43F8E" opacity="0.6" rx="1.5" />
          </g>

          {/* 2. ÊMBOLO / PISTÃO (move-se horizontalmente com o líquido) */}
          <g
            className="transition-all duration-150 ease-out"
            style={{ transform: `translateX(0px)` }}
          >
            {/* Haste do êmbolo que sai para a direita */}
            <rect
              x={plungerRubberX + 16}
              y="78"
              width={Math.max(10, 570 - (plungerRubberX + 16))}
              height="24"
              fill="url(#plungerRod)"
              stroke="#EA580C"
              strokeWidth="0.8"
              rx="2"
            />

            {/* Nervuras transversais da haste plástica */}
            <line
              x1={plungerRubberX + 50}
              y1="78"
              x2={plungerRubberX + 50}
              y2="102"
              stroke="#C2410C"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1={plungerRubberX + 90}
              y1="78"
              x2={plungerRubberX + 90}
              y2="102"
              stroke="#C2410C"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Cabeça do êmbolo (onde o dedo empurra) */}
            <rect
              x="570"
              y="60"
              width="14"
              height="60"
              fill="#FB923C"
              stroke="#EA580C"
              strokeWidth="1.5"
              rx="4"
              filter="url(#shadowFilter)"
            />

            {/* Borracha de vedação do êmbolo (cinza grafite) */}
            <rect
              x={plungerRubberX}
              y={barrelY + 1}
              width="16"
              height={barrelHeight - 2}
              fill="#334155"
              rx="2"
            />
            <line
              x1={plungerRubberX + 8}
              y1={barrelY + 3}
              x2={plungerRubberX + 8}
              y2={barrelY + barrelHeight - 3}
              stroke="#1E293B"
              strokeWidth="2"
            />
          </g>

          {/* 3. LÍQUIDO MEDICAMENTOSO ROSA DENTRO DO CORPO */}
          <g>
            <rect
              x={barrelX}
              y={barrelY + 1}
              width={liquidWidth}
              height={barrelHeight - 2}
              fill="url(#syringeLiquid)"
              className="transition-all duration-150 ease-out"
            />

            {/* BOLHAS DE AR ANIMADAS EM LOOP NO LÍQUIDO */}
            {liquidWidth > 35 && (
              <g className="pointer-events-none">
                {/* Bolha 1 */}
                <circle
                  cx={barrelX + Math.min(liquidWidth - 20, 45)}
                  cy="98"
                  r="3.5"
                  fill="#FFFFFF"
                  opacity="0.75"
                  className="animate-bubble-1"
                />
                {/* Bolha 2 */}
                <circle
                  cx={barrelX + Math.min(liquidWidth - 15, Math.max(30, liquidWidth * 0.5))}
                  cy="85"
                  r="2.5"
                  fill="#FFFFFF"
                  opacity="0.6"
                  className="animate-bubble-2"
                />
                {/* Bolha 3 */}
                <circle
                  cx={barrelX + Math.min(liquidWidth - 10, Math.max(20, liquidWidth * 0.8))}
                  cy="105"
                  r="4"
                  fill="#FFFFFF"
                  opacity="0.7"
                  className="animate-bubble-3"
                />
              </g>
            )}
          </g>

          {/* 4. CORPO DE VIDRO TRANSPARENTE DA SERINGA */}
          <g>
            {/* Fundo de vidro */}
            <rect
              x={barrelX}
              y={barrelY}
              width={barrelWidth}
              height={barrelHeight}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              rx="4"
            />

            {/* Flanges / abas para os dedos na extremidade traseira */}
            <path
              d={`M ${barrelX + barrelWidth} 34 L ${barrelX + barrelWidth + 12} 34 L ${barrelX + barrelWidth + 12} 146 L ${barrelX + barrelWidth} 146`}
              fill="#E2E8F0"
              stroke="#94A3B8"
              strokeWidth="2"
              rx="3"
            />

            {/* Reflexo de brilho superior do vidro */}
            <rect
              x={barrelX}
              y={barrelY}
              width={barrelWidth}
              height={barrelHeight}
              fill="url(#glassShine)"
              rx="4"
              pointerEvents="none"
            />
          </g>

          {/* 5. MARCAÇÕES DE ESCALA GRADUADA (0 a 60 unidades) */}
          <g className="pointer-events-none">
            {tickMarks.map((mark) => (
              <g key={mark.unit}>
                {/* Traço superior */}
                <line
                  x1={mark.x}
                  y1={barrelY + 2}
                  x2={mark.x}
                  y2={barrelY + 2 + mark.height}
                  stroke="#334155"
                  strokeWidth={mark.isMajor ? 1.8 : 1}
                  opacity={mark.isMajor ? 0.9 : 0.6}
                />
                {/* Traço inferior */}
                <line
                  x1={mark.x}
                  y1={barrelY + barrelHeight - 2}
                  x2={mark.x}
                  y2={barrelY + barrelHeight - 2 - mark.height}
                  stroke="#334155"
                  strokeWidth={mark.isMajor ? 1.8 : 1}
                  opacity={mark.isMajor ? 0.9 : 0.6}
                />
                {/* Rótulo numérico para marcações principais */}
                {mark.isMajor && (
                  <text
                    x={mark.x}
                    y={barrelY + barrelHeight / 2 + 4}
                    textAnchor="middle"
                    fill="#1F1A1D"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="Poppins, sans-serif"
                    opacity="0.85"
                  >
                    {mark.unit}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>

        {/* Indicador visual de nível abaixo da seringa */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 px-8 mt-2">
          <span>0 un</span>
          <span>15 un</span>
          <span>30 un (0.5 ml)</span>
          <span>45 un</span>
          <span>60 un (1.0 ml)</span>
        </div>
      </div>
    </div>
  )
}
