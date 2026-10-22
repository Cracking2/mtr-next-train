import stationData from './stations.json'

export type LineCode = 'AEL' | 'DRL' | 'EAL' | 'ISL' | 'KTL' | 'SIL' | 'TCL' | 'TKL' | 'TML' | 'TWL'

export type Line = {
  code: LineCode
  tc: string
  en: string
  color: string
  badge: string
  onBadge: string
}

export type Station = {
  code: string
  tc: string
  en: string
  lines: LineCode[]
}

export type Branch = { id: string; from: string; stations: string[] }

// Colours cross-checked against Wikipedia's Module:Adjacent stations/MTR (2026-10-22).
// `badge` is darkened only where the line colour misses 4.5:1 against both white and dark text.
export const LINES: Line[] = [
  { code: 'EAL', tc: '東鐵綫', en: 'East Rail Line', color: '#53B7E8', badge: '#53B7E8', onBadge: '#111418' },
  { code: 'TML', tc: '屯馬綫', en: 'Tuen Ma Line', color: '#923011', badge: '#923011', onBadge: '#FFFFFF' },
  { code: 'TWL', tc: '荃灣綫', en: 'Tsuen Wan Line', color: '#ED1D24', badge: '#E81C23', onBadge: '#FFFFFF' },
  { code: 'KTL', tc: '觀塘綫', en: 'Kwun Tong Line', color: '#00AB4E', badge: '#00AB4E', onBadge: '#111418' },
  { code: 'ISL', tc: '港島綫', en: 'Island Line', color: '#007DC5', badge: '#007BC1', onBadge: '#FFFFFF' },
  { code: 'TKL', tc: '將軍澳綫', en: 'Tseung Kwan O Line', color: '#7D499D', badge: '#7D499D', onBadge: '#FFFFFF' },
  { code: 'SIL', tc: '南港島綫', en: 'South Island Line', color: '#BAC429', badge: '#BAC429', onBadge: '#111418' },
  { code: 'TCL', tc: '東涌綫', en: 'Tung Chung Line', color: '#F7943E', badge: '#F7943E', onBadge: '#111418' },
  { code: 'AEL', tc: '機場快綫', en: 'Airport Express', color: '#00888A', badge: '#008486', onBadge: '#FFFFFF' },
  { code: 'DRL', tc: '迪士尼綫', en: 'Disneyland Resort Line', color: '#F173AC', badge: '#F173AC', onBadge: '#111418' },
]

const LINE_BY_CODE = new Map(LINES.map((l) => [l.code, l]))

export function isLineCode(value: string): value is LineCode {
  return LINE_BY_CODE.has(value as LineCode)
}

export function getLine(code: LineCode): Line {
  return LINE_BY_CODE.get(code)!
}

export function getStation(code: string): Station | undefined {
  const s = (stationData.stations as Record<string, { tc: string; en: string; lines: string[] }>)[code]
  return s && { code, tc: s.tc, en: s.en, lines: s.lines.filter(isLineCode) }
}

export function getLineStations(code: LineCode): { stations: string[]; branches: Branch[] } {
  return stationData.lines[code]
}
