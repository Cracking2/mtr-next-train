import type { LineCode } from '../data/lines'

export type Train = {
  seq: number
  dest: string
  platform: string
  arrival: Date
}

export type Schedule = {
  serverTime: Date
  isDelayed: boolean
  up: Train[]
  down: Train[]
}

type RawTrain = {
  seq: string
  dest: string
  plat: string
  time: string
  valid: string
}

type RawResponse = {
  status: number
  message: string
  isdelay?: string
  error?: { errorCode: string }
  data?: Record<string, { curr_time: string; UP?: RawTrain[]; DOWN?: RawTrain[] }>
}

const ENDPOINT = 'https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php'

// The API answers NT-204 for a valid station that has no trains, e.g. outside service hours.
const NO_TRAINS = 'NT-204'

// API timestamps are Hong Kong local time with no offset.
function parseHkTime(value: string): Date {
  return new Date(`${value.replace(' ', 'T')}+08:00`)
}

function parseTrains(raw: RawTrain[] | undefined): Train[] {
  return (raw ?? [])
    .filter((t) => t.valid === 'Y')
    .map((t) => ({ seq: Number(t.seq), dest: t.dest, platform: t.plat, arrival: parseHkTime(t.time) }))
}

export function parseSchedule(raw: RawResponse, line: LineCode, station: string): Schedule {
  if (raw.status === 0 && raw.error?.errorCode === NO_TRAINS) {
    return { serverTime: new Date(), isDelayed: false, up: [], down: [] }
  }
  const entry = raw.data?.[`${line}-${station}`]
  if (raw.status !== 1 || !entry) throw new Error(raw.message || 'Unexpected response')
  return {
    serverTime: parseHkTime(entry.curr_time),
    isDelayed: raw.isdelay === 'Y',
    up: parseTrains(entry.UP),
    down: parseTrains(entry.DOWN),
  }
}

export async function fetchSchedule(line: LineCode, station: string, signal?: AbortSignal): Promise<Schedule> {
  const res = await fetch(`${ENDPOINT}?line=${line}&sta=${station}&lang=TC`, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return parseSchedule((await res.json()) as RawResponse, line, station)
}
