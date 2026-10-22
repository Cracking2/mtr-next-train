import { useQuery } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { fetchSchedule, type Train } from '../api/schedule'
import { getLine, getStation, type LineCode } from '../data/lines'
import { useNow } from '../useNow'

const REFRESH_MS = 15_000
const STALE_AFTER_MS = 45_000
// Keep a train listed briefly after its estimated time; it is often still at the platform.
const DEPARTED_GRACE_MS = 30_000

function stationName(code: string) {
  return getStation(code)?.tc ?? code
}

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-GB', { timeZone: 'Asia/Hong_Kong', hour: '2-digit', minute: '2-digit' })
}

function Eta({ train, now }: { train: Train; now: number }) {
  const minutes = Math.floor((train.arrival.getTime() - now) / 60_000)
  return (
    <span className="eta">
      <span className="eta-value">{minutes < 1 ? '即將抵達' : `${minutes} 分`}</span>
      <span className="clock">{formatClock(train.arrival)}</span>
    </span>
  )
}

function Direction({ trains, now }: { trains: Train[]; now: number }) {
  const upcoming = trains.filter((t) => t.arrival.getTime() > now - DEPARTED_GRACE_MS)
  if (upcoming.length === 0) return null
  const dests = [...new Set(upcoming.map((t) => stationName(t.dest)))].join('／')
  return (
    <section className="direction">
      <h2>
        往 {dests} · {upcoming[0].platform} 號月台
      </h2>
      {upcoming.map((train, i) => (
        <div key={train.seq} className={i === 0 ? 'train first' : 'train'}>
          <span>{stationName(train.dest)}</span>
          <Eta train={train} now={now} />
        </div>
      ))}
    </section>
  )
}

function Skeleton() {
  return (
    <div className="card" aria-busy="true" aria-label="載入班次中">
      <div className="skeleton" style={{ width: '40%' }} />
      <div className="skeleton big" />
      <div className="skeleton" />
      <div className="skeleton" style={{ width: '40%' }} />
      <div className="skeleton big" />
    </div>
  )
}

export function StationCard({ line, station }: { line: LineCode; station: string }) {
  const query = useQuery({
    queryKey: ['schedule', line, station],
    queryFn: ({ signal }) => fetchSchedule(line, station, signal),
    refetchInterval: REFRESH_MS,
  })
  const now = useNow()
  const style = { '--line': getLine(line).color } as CSSProperties

  if (query.isPending) return <Skeleton />

  if (!query.data) {
    return (
      <div className="card" style={style}>
        <div className="banner error" role="alert">
          未能載入班次。請檢查網絡後重試。
        </div>
        <button type="button" onClick={() => query.refetch()}>
          重試
        </button>
      </div>
    )
  }

  const { up, down, isDelayed } = query.data
  const ageSeconds = Math.max(0, Math.round((now - query.dataUpdatedAt) / 1000))
  const stale = query.isError || now - query.dataUpdatedAt > STALE_AFTER_MS
  const hasTrains = [...up, ...down].some((t) => t.arrival.getTime() > now - DEPARTED_GRACE_MS)

  return (
    <div className="card" style={style}>
      {isDelayed && (
        <div className="banner warning" role="status">
          列車服務延誤
        </div>
      )}
      {hasTrains ? (
        <>
          <Direction trains={up} now={now} />
          <Direction trains={down} now={now} />
        </>
      ) : (
        <p className="muted">暫時沒有班次資料。可能是非服務時間。</p>
      )}
      <div className={stale ? 'updated stale' : 'updated'}>
        <span>
          {ageSeconds < 5 ? '剛剛更新' : `${ageSeconds} 秒前更新`}
          {stale && '，班次可能已過時'}
        </span>
        {stale && (
          <button type="button" onClick={() => query.refetch()}>
            重新載入
          </button>
        )}
      </div>
    </div>
  )
}
