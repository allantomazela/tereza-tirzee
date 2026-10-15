// Formatação e agrupamento de dados no padrão brasileiro pt-BR

export function formatNumberBr(num: number, decimals: number = 1): string {
  if (isNaN(num) || num === null || num === undefined) return '0'
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatDateBr(dateStr: string): string {
  if (!dateStr) return ''
  // Handles YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('pt-BR')
}

export function formatDateFriendly(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  if (isNaN(d.getTime())) return dateStr

  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  const weekday = weekdays[d.getDay()]
  const monthName = months[d.getMonth()]
  return `${weekday}, ${day} de ${monthName}`
}

export function calculateIMC(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 0
  const heightM = heightCm / 100
  const imc = weightKg / (heightM * heightM)
  return Math.round(imc * 10) / 10
}

export interface ImcClassification {
  category: string
  color: string // Tailwind color or hex
  badgeBg: string
  badgeText: string
  percentPosition: number // 0 to 100 for gauge indicator
}

export function getImcClassification(imc: number): ImcClassification {
  if (imc <= 0) {
    return {
      category: 'Não calculado',
      color: '#9CA3AF',
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-700',
      percentPosition: 0,
    }
  }

  if (imc < 18.5) {
    return {
      category: 'Abaixo do peso',
      color: '#3B82F6',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      percentPosition: Math.min(18, Math.max(5, (imc / 18.5) * 18)),
    }
  }
  if (imc <= 24.9) {
    return {
      category: 'Peso normal',
      color: '#16A34A',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
      percentPosition: 18 + ((imc - 18.5) / (24.9 - 18.5)) * 22, // 18% to 40%
    }
  }
  if (imc <= 29.9) {
    return {
      category: 'Sobrepeso',
      color: '#D97706',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      percentPosition: 40 + ((imc - 25.0) / (29.9 - 25.0)) * 20, // 40% to 60%
    }
  }
  if (imc <= 34.9) {
    return {
      category: 'Obesidade grau I',
      color: '#EA580C',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
      percentPosition: 60 + ((imc - 30.0) / (34.9 - 30.0)) * 15, // 60% to 75%
    }
  }
  if (imc <= 39.9) {
    return {
      category: 'Obesidade grau II',
      color: '#DC2626',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
      percentPosition: 75 + ((imc - 35.0) / (39.9 - 35.0)) * 15, // 75% to 90%
    }
  }
  return {
    category: 'Obesidade grau III',
    color: '#991B1B',
    badgeBg: 'bg-red-200',
    badgeText: 'text-red-900',
    percentPosition: Math.min(98, 90 + ((imc - 40.0) / 10) * 10), // 90% to 100%
  }
}

// Retorna número da semana ISO 8601 (ano, semana)
export function getISOWeek(dateStr: string): { year: number; week: number } {
  const parts = dateStr.split('T')[0].split('-').map(Number)
  const target = new Date(parts[0], parts[1] - 1, parts[2])
  const dayNr = (target.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7))
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
  return { year: target.getFullYear(), week }
}

export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getCurrentTimeString(): string {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function getGreeting(): { greeting: string; subtitle: string } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Bom dia',
      subtitle: 'Bom dia! Vamos cuidar de você hoje.',
    }
  } else if (hour >= 12 && hour < 18) {
    return {
      greeting: 'Boa tarde',
      subtitle: 'Boa tarde! Continue firme no seu progresso.',
    }
  } else {
    return {
      greeting: 'Boa noite',
      subtitle: 'Boa noite! Aproveite para registrar seu dia.',
    }
  }
}
