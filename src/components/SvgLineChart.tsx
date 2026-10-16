import { useState, useId } from 'react'
import { formatNumberBr, formatDateBr } from '@/lib/formatters'

interface DataPoint {
  date: string
  value: number
}

interface SvgLineChartProps {
  title: string
  subtitle?: string
  data: DataPoint[]
  unit: string
  color: string // Hex
  gradientFrom: string
  gradientTo: string
  referenceLines?: { y: number; label: string; color: string }[]
  minY?: number
  maxY?: number
}

export default function SvgLineChart({
  title,
  subtitle,
  data,
  unit,
  color,
  gradientFrom,
  gradientTo,
  referenceLines = [],
}: SvgLineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number
    y: number
    data: DataPoint
  } | null>(null)
  const gradId = useId()

  // Se menos de 2 medições, estado vazio amigável
  if (!data || data.length < 2) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card-soft space-y-3">
        <div>
          <h3 className="font-bold text-base text-[#1F1A1D]">{title}</h3>
          {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
        </div>
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 bg-[#F7F4F6] rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-(--primary-color) shadow-xs">
            📈
          </div>
          <p className="text-xs font-semibold text-gray-700">
            Registre suas medidas para ver a evolução
          </p>
          <p className="text-[11px] text-gray-400 max-w-xs">
            São necessárias ao menos 2 medições para traçar a curva gráfica.
          </p>
        </div>
      </div>
    )
  }

  // Ordena por data crescente para o gráfico
  const sortedData = [...data].sort((a, b) => (a.date > b.date ? 1 : -1))

  // Dimensões do SVG
  const width = 540
  const height = 220
  const padding = { top: 25, right: 30, bottom: 40, left: 45 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Valores Mín / Máx para a escala Y
  const values = sortedData.map((d) => d.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const paddingVal = Math.max(1, (rawMax - rawMin) * 0.15)
  const minY = Math.floor(rawMin - paddingVal)
  const maxY = Math.ceil(rawMax + paddingVal)

  // Mapeamento de coordenadas
  const getX = (index: number) => {
    if (sortedData.length <= 1) return padding.left
    return padding.left + (index / (sortedData.length - 1)) * chartWidth
  }

  const getY = (val: number) => {
    if (maxY === minY) return padding.top + chartHeight / 2
    return padding.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight
  }

  // Caminho da linha
  const points = sortedData.map((d, i) => ({ x: getX(i), y: getY(d.value), data: d }))
  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')

  // Área preenchida para gradiente
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

  // Linhas de grade horizontal (4 linhas)
  const gridLines = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = minY + ratio * (maxY - minY)
    const y = getY(val)
    return { val, y }
  })

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E7EB] shadow-card-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h3 className="font-bold text-base text-[#1F1A1D]">{title}</h3>
          {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
        </div>
        <div className="text-xs font-bold text-(--primary-color)">
          Último: {formatNumberBr(sortedData[sortedData.length - 1].value, 1)} {unit}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`grad-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} stopOpacity="0.45" />
              <stop offset="100%" stopColor={gradientTo} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Linhas de Grade e Eixo Y */}
          {gridLines.map((grid, idx) => (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={grid.y}
                x2={padding.left + chartWidth}
                y2={grid.y}
                stroke="#F1F5F9"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={grid.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94A3B8"
                fontWeight="500"
                fontFamily="Poppins, sans-serif"
              >
                {formatNumberBr(grid.val, 0)}
              </text>
            </g>
          ))}

          {/* Linhas de referência opcionais (Ex: limites de IMC) */}
          {referenceLines.map((ref, idx) => {
            if (ref.y < minY || ref.y > maxY) return null
            const y = getY(ref.y)
            return (
              <g key={`ref-${idx}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke={ref.color}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
                <text
                  x={padding.left + chartWidth - 4}
                  y={y - 4}
                  textAnchor="end"
                  fontSize="9"
                  fill={ref.color}
                  fontWeight="600"
                  fontFamily="Poppins, sans-serif"
                >
                  {ref.label}
                </text>
              </g>
            )
          })}

          {/* Área gradiente */}
          <path d={areaD} fill={`url(#grad-${gradId})`} />

          {/* Linha principal com animação suave de desenho */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw-line"
          />

          {/* Pontos de dados e rótulos de data X */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Rótulo de data no eixo X */}
              <text
                x={p.x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#94A3B8"
                fontWeight="500"
                fontFamily="Poppins, sans-serif"
              >
                {formatDateBr(p.data.date).substring(0, 5)}
              </text>

              {/* Ponto interativo */}
              <circle
                cx={p.x}
                cy={p.y}
                r="5.5"
                fill="#FFFFFF"
                stroke={color}
                strokeWidth="2.5"
                className="cursor-pointer hover:r-7 transition-all duration-150"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* TOOLTIP FLUTUANTE AO PASSAR O MOUSE */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-[#1F1A1D] text-white text-[11px] px-2.5 py-1.5 rounded-xl shadow-lg -translate-x-1/2 -translate-y-full mb-2 whitespace-nowrap animate-fade-in"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className="font-bold">
              {formatNumberBr(hoveredPoint.data.value, 1)} {unit}
            </div>
            <div className="text-[10px] text-gray-300">{formatDateBr(hoveredPoint.data.date)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
