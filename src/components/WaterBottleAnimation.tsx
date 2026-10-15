import { useMemo } from 'react'

interface WaterBottleAnimationProps {
  currentMl: number
  goalMl: number
}

export default function WaterBottleAnimation({ currentMl, goalMl }: WaterBottleAnimationProps) {
  const safeGoal = Math.max(500, goalMl)
  const ratio = Math.min(1, Math.max(0, currentMl / safeGoal))
  const isGoalReached = currentMl >= safeGoal

  // Geometria da Garrafa no SVG (viewBox 0 0 200 360)
  // Gargalo: x 80-120, y 25-60
  // Tampa: x 75-125, y 10-25
  // Corpo cilíndrico: x 45-155, y 60-320
  // Altura total do corpo útil para líquido: 315 - 70 = 245
  const bodyTop = 70
  const bodyBottom = 315
  const bodyHeight = bodyBottom - bodyTop

  const liquidHeight = bodyHeight * ratio
  const liquidY = bodyBottom - liquidHeight

  // Marcações de volume (a cada 500ml)
  const markers = useMemo(() => {
    const list = []
    const step = 500
    for (let ml = step; ml <= safeGoal; ml += step) {
      const markRatio = ml / safeGoal
      const y = bodyBottom - bodyHeight * markRatio
      list.push({ ml, y })
    }
    return list
  }, [safeGoal, bodyBottom, bodyHeight])

  return (
    <div className="relative flex flex-col items-center select-none w-44 sm:w-52 mx-auto">
      <svg
        viewBox="0 0 200 360"
        className="w-full h-auto drop-shadow-lg overflow-visible"
        role="img"
        aria-label={`Garrafa com ${currentMl} ml de água de uma meta de ${safeGoal} ml`}
      >
        <defs>
          {/* Gradiente do líquido de hidratação */}
          <linearGradient id="waterPinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F9A8C9" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#F43F8E" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#D63370" stopOpacity="0.92" />
          </linearGradient>

          {/* Gradiente verde para meta batida */}
          <linearGradient id="waterSuccessGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0.9" />
          </linearGradient>

          {/* Brilho do vidro */}
          <linearGradient id="bottleShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="20%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
          </linearGradient>

          {/* Clip path para manter o líquido exatamente dentro do formato curvo da garrafa */}
          <clipPath id="bottleInsideClip">
            <path
              d="
                M 82 60
                C 65 65 48 85 48 105
                L 48 300
                C 48 318 62 322 100 322
                C 138 322 152 318 152 300
                L 152 105
                C 152 85 135 65 118 60
                Z
              "
            />
          </clipPath>
        </defs>

        {/* 1. LÍQUIDO PREENCHENDO DE BAIXO PARA CIMA (DENTRO DO CLIP) */}
        <g clipPath="url(#bottleInsideClip)">
          {/* Fundo interno cinza translúcido */}
          <rect x="40" y="55" width="120" height="275" fill="#F8FAFC" />

          {/* O Líquido rosa translúcido com animação suave de altura */}
          <rect
            x="40"
            y={liquidY}
            width="120"
            height={liquidHeight}
            fill={isGoalReached ? 'url(#waterSuccessGrad)' : 'url(#waterPinkGrad)'}
            className="transition-all duration-500 ease-out"
          />

          {/* Ondulação de superfície no topo do líquido */}
          {ratio > 0.03 && ratio < 0.99 && (
            <path
              d={`
                M 40 ${liquidY}
                Q 70 ${liquidY - 4} 100 ${liquidY}
                T 160 ${liquidY}
                L 160 ${liquidY + 6}
                L 40 ${liquidY + 6}
                Z
              `}
              fill="#FFFFFF"
              opacity="0.4"
              className="animate-wave"
            />
          )}

          {/* Bolhas ascendentes em loop quando há água */}
          {ratio > 0.1 && (
            <g className="pointer-events-none">
              <circle
                cx="85"
                cy={liquidY + 30}
                r="3"
                fill="#FFFFFF"
                opacity="0.65"
                className="animate-bubble-1"
              />
              <circle
                cx="115"
                cy={liquidY + 60}
                r="2.5"
                fill="#FFFFFF"
                opacity="0.5"
                className="animate-bubble-2"
              />
              <circle
                cx="70"
                cy={liquidY + 90}
                r="4"
                fill="#FFFFFF"
                opacity="0.6"
                className="animate-bubble-3"
              />
            </g>
          )}

          {/* Reflexo interno de vidro */}
          <rect
            x="48"
            y="60"
            width="104"
            height="262"
            fill="url(#bottleShine)"
            pointerEvents="none"
          />
        </g>

        {/* 2. CONTORNO EXTERNO DA GARRAFA E TAMPA */}
        <g>
          {/* Linha externa da garrafa de vidro */}
          <path
            d="
              M 80 50
              L 80 60
              C 64 65 48 85 48 105
              L 48 300
              C 48 320 62 324 100 324
              C 138 324 152 320 152 300
              L 152 105
              C 152 85 136 65 120 60
              L 120 50
              Z
            "
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Gargalo */}
          <rect
            x="80"
            y="26"
            width="40"
            height="24"
            fill="#E2E8F0"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            rx="2"
          />

          {/* Tampa rosada/metálica com textura */}
          <rect
            x="76"
            y="10"
            width="48"
            height="18"
            fill="#F43F8E"
            stroke="#D63370"
            strokeWidth="2"
            rx="5"
          />
          <line x1="88" y1="12" x2="88" y2="26" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
          <line
            x1="100"
            y1="12"
            x2="100"
            y2="26"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <line
            x1="112"
            y1="12"
            x2="112"
            y2="26"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </g>

        {/* 3. MARCAÇÕES DE VOLUME NA LATERAL DA GARRAFA */}
        <g className="pointer-events-none">
          {markers.map((m) => (
            <g key={m.ml}>
              {/* Traço de nível */}
              <line
                x1="138"
                y1={m.y}
                x2="150"
                y2={m.y}
                stroke="#64748B"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Rótulo de volume ao lado */}
              <text
                x="156"
                y={m.y + 4}
                fontSize="9"
                fill="#64748B"
                fontWeight="700"
                fontFamily="Poppins, sans-serif"
              >
                {m.ml >= 1000 ? `${(m.ml / 1000).toFixed(1).replace('.', ',')}L` : `${m.ml}ml`}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
