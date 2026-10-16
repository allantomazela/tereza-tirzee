/**
 * Constantes e funções oficiais de fracionamento da ampola de Tirzepatida 15 mg / 0,5 ml
 * em seringa de insulina de 50 UI (0,5 ml).
 *
 * Tabela oficial fornecida pelo usuário:
 * - 2,5 mg  =  8 UI  (cinza)
 * - 5,0 mg  = 17 UI  (roxo)
 * - 7,5 mg  = 25 UI  (verde)
 * - 10,0 mg = 33 UI  (rosa/magenta)
 * - 12,5 mg = 42 UI  (azul)
 * - 15,0 mg = 50 UI  (laranja)
 */

export interface OfficialFractionationDose {
  mg: number
  units: number
  color: string // Cor hex principal
  badgeBg: string
  badgeText: string
  border: string
  label: string
}

export const OFFICIAL_15MG_FRACTIONATION: OfficialFractionationDose[] = [
  {
    mg: 2.5,
    units: 8,
    color: '#6B7280', // cinza
    badgeBg: '#F3F4F6',
    badgeText: '#374151',
    border: '#D1D5DB',
    label: '2,5 mg',
  },
  {
    mg: 5.0,
    units: 17,
    color: '#8B5CF6', // roxo
    badgeBg: '#F3E8FF',
    badgeText: '#6B21A8',
    border: '#D8B4FE',
    label: '5,0 mg',
  },
  {
    mg: 7.5,
    units: 25,
    color: '#10B981', // verde
    badgeBg: '#ECFDF5',
    badgeText: '#047857',
    border: '#A7F3D0',
    label: '7,5 mg',
  },
  {
    mg: 10.0,
    units: 33,
    color: '#EC4899', // rosa/magenta
    badgeBg: '#FDF2F8',
    badgeText: '#BE185D',
    border: '#FBCFE8',
    label: '10,0 mg',
  },
  {
    mg: 12.5,
    units: 42,
    color: '#3B82F6', // azul
    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8',
    border: '#BFDBFE',
    label: '12,5 mg',
  },
  {
    mg: 15.0,
    units: 50,
    color: '#F97316', // laranja
    badgeBg: '#FFF7ED',
    badgeText: '#C2410C',
    border: '#FED7AA',
    label: '15,0 mg',
  },
]

/**
 * Encontra a dose oficial mais próxima (tolerância de 0.6 unidades).
 */
export function findClosestOfficialDose(
  units: number,
  tolerance = 0.6,
): OfficialFractionationDose | null {
  for (const item of OFFICIAL_15MG_FRACTIONATION) {
    if (Math.abs(units - item.units) <= tolerance) {
      return item
    }
  }
  return null
}

/**
 * Converte UI para mg usando a tabela oficial para a caneta de 15 mg/0,5 ml
 * com interpolação linear entre os pontos oficiais.
 */
export function convertUnitsToMgOfficial(units: number): number {
  if (units <= 0) return 0
  const points = [
    { u: 0, mg: 0 },
    ...OFFICIAL_15MG_FRACTIONATION.map((item) => ({ u: item.units, mg: item.mg })),
  ]

  // Se ultrapassar 50 UI, extrapola linearmente usando o último segmento (42->50 UI = 8 UI para 2,5 mg = 0.3125 mg/UI)
  if (units >= 50) {
    const extra = units - 50
    return Math.round((15 + extra * (2.5 / 8)) * 100) / 100
  }

  // Interpola entre dois pontos conhecidos
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    if (units >= p1.u && units <= p2.u) {
      if (p2.u === p1.u) return p1.mg
      const ratio = (units - p1.u) / (p2.u - p1.u)
      const mg = p1.mg + ratio * (p2.mg - p1.mg)
      return Math.round(mg * 100) / 100
    }
  }

  return Math.round((units / 50) * 15 * 100) / 100
}

/**
 * Converte mg para UI usando a tabela oficial para a caneta de 15 mg/0,5 ml
 * com interpolação linear entre os pontos oficiais.
 */
export function convertMgToUnitsOfficial(mg: number): number {
  if (mg <= 0) return 0
  const points = [
    { mg: 0, u: 0 },
    ...OFFICIAL_15MG_FRACTIONATION.map((item) => ({ mg: item.mg, u: item.units })),
  ]

  if (mg >= 15) {
    const extra = mg - 15
    const u = 50 + extra * (8 / 2.5)
    return Math.round(u * 10) / 10
  }

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    if (mg >= p1.mg && mg <= p2.mg) {
      if (p2.mg === p1.mg) return p1.u
      const ratio = (mg - p1.mg) / (p2.mg - p1.mg)
      const u = p1.u + ratio * (p2.u - p1.u)
      return Math.round(u * 10) / 10
    }
  }

  return Math.round((mg / 15) * 50 * 10) / 10
}
