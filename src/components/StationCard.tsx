import { useQuery } from '@tanstack/react-query'
import type { CSSProperties, ReactNode } from 'react'
import { fetchSchedule, type Train } from '../api/schedule'
import { getLine, getStation, type LineCode } from '../data/lines'
import { useLang } from '../i18n'
import { useNow } from '../useNow'

const REFRESH_MS = 15_000
const STALE_AFTER_MS = 45_000
// Keep a train listed briefly after its estimated time; it is often still at the platform.
const DEPARTED_GRACE_MS = 30_000

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-GB', { timeZone: 'Asia/Hong_Kong', hour: '2-digit', minute: '2-digit' })
}

function Eta({ train, now }: { train: Train; now: number }) {
  const { t, f } = useLang()
  const minutes = Math.floor((train.arrival.getTime() - now) / 60_000)
  return (
    <span className="eta">
      <span className="eta-value">{minutes < 1 ? t('arriving') : f('minutes', minutes)}</span>
      <span className="clock">{formatClock(train.arrival)}</span>
    </span>
  )
}

function Direction({ trains, now, limit }: { trains: Train[]; now: number; limit: number }) {
  const { f, name } = useLang()
  const stationName = (code: string) => {
    const s = getStation(code)
    return s ? name(s) : code
  }
  const upcoming = trains.filter((t) => t.arrival.getTime() > now - DEPARTED_GRACE_MS).slice(0, limit)
  if (upcoming.length === 0) return null
  const dests = [...new Set(upcoming.map((t) => stationName(t.dest)))].join(' / ')
  return (
    <section className="direction">
      <h2>{f('towards', dests, upcoming[0].platform)}</h2>
      {upcoming.map((train, i) => (
        <div key={train.seq} className={i === 0 ? 'train first' : 'train'}>
          <span>{stationName(train.dest)}</span>
          <Eta train={train} now={now} />
        </div>
      ))}
    </section>
  )
}

type Props = {
  line: LineCode
  station: string
  limit?: number
  header?: ReactNode
}

export function StationCard({ line, station, limit = 4, header }: Props) {
  const { t, f, name } = useLang()
  const query = useQuery({
    queryKey: ['schedule', line, station],
    queryFn: ({ signal }) => fetchSchedule(line, station, signal),
    refetchInterval: REFRESH_MS,
  })
  const now = useNow()
  const style = { '--line': getLine(line).color } as CSSProperties

  if (query.isPending) {
    return (
      <div className="card" style={style} aria-busy="true" aria-label={t('loading')}>
        {header}
        <div className="skeleton" style={{ width: '40%' }} />
        <div className="skeleton big" />
        <div className="skeleton" style={{ width: '40%' }} />
        <div className="skeleton big" />
      </div>
    )
  }

  if (!query.data) {
    return (
      <div className="card" style={style}>
        {header}
        <div className="banner error" role="alert">
          {t('loadFailed')}
        </div>
        <button type="button" onClick={() => query.refetch()}>
          {t('retry')}
        </button>
      </div>
    )
  }

  const { up, down, isDelayed } = query.data
  const ageSeconds = Math.max(0, Math.round((now - query.dataUpdatedAt) / 1000))
  const stale = query.isError || now - query.dataUpdatedAt > STALE_AFTER_MS
  const hasTrains = [...up, ...down].some((tr) => tr.arrival.getTime() > now - DEPARTED_GRACE_MS)
  // Screen readers hear only each direction's first train, and only when its minute changes.
  const firstTrains = [up, down]
    .map((trains) => trains.find((tr) => tr.arrival.getTime() > now - DEPARTED_GRACE_MS))
    .filter((tr) => tr !== undefined)
    .map((tr) => {
      const minutes = Math.floor((tr.arrival.getTime() - now) / 60_000)
      const dest = getStation(tr.dest)
      return `${dest ? name(dest) : tr.dest} ${minutes < 1 ? t('arriving') : f('minutes', minutes)}`
    })
    .join('；')

  return (
    <div className="card" style={style}>
      {header}
      {isDelayed && (
        <div className="banner warning" role="status">
          {t('delayed')}
        </div>
      )}
      {hasTrains ? (
        <>
          <Direction trains={up} now={now} limit={limit} />
          <Direction trains={down} now={now} limit={limit} />
        </>
      ) : (
        <p className="muted">{t('noTrains')}</p>
      )}
      <p className="sr-only" aria-live="polite">
        {firstTrains}
      </p>
      <div className={stale ? 'updated stale' : 'updated'}>
        <span>
          {ageSeconds < 5 ? t('justUpdated') : f('updatedAgo', ageSeconds)}
          {stale && t('maybeStale')}
        </span>
        {stale && (
          <button type="button" onClick={() => query.refetch()}>
            {t('reload')}
          </button>
        )}
      </div>
    </div>
  )
}
