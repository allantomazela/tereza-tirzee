import React from 'react'

interface CircularProgressProps {
  percentage: number // 0 to 100
  size?: number
  strokeWidth?: number
  color?: string
  gradientId?: string
  trackColor?: string
  centerContent?: React.ReactNode
}

export default function CircularProgress({
  percentage,
  size = 110,
  strokeWidth = 9,
  color = '#F43F8E',
  gradientId,
  trackColor = '#F3F4F6',
  centerContent,
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, percentage))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clamped / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {gradientId && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9A8C9" />
              <stop offset="100%" stopColor="#F43F8E" />
            </linearGradient>
          </defs>
        )}
        {/* Trilho cinza */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Arco de progresso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientId ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Conteúdo Central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {centerContent}
      </div>
    </div>
  )
}
