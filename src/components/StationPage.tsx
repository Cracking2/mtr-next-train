import type { CSSProperties } from 'react'
import { getLine, getStation, type LineCode } from '../data/lines'
import { href } from '../router'
import { StationCard } from './StationCard'

export function StationPage({ code, line }: { code: string; line?: LineCode }) {
  const station = getStation(code)
  if (!station) {
    return <p className="muted">找不到車站「{code}」。</p>
  }
  const selected = line && station.lines.includes(line) ? line : station.lines[0]

  return (
    <>
      <div className="station-title">
        <h1>{station.tc}</h1>
        <span className="muted">{station.en}</span>
      </div>
      {station.lines.length > 1 && (
        <nav className="tabs" role="tablist" aria-label="路綫">
          {station.lines.map((l) => (
            <a
              key={l}
              className="tab"
              role="tab"
              aria-selected={l === selected}
              href={href.station(code, l)}
              style={{ '--line': getLine(l).color } as CSSProperties}
            >
              {getLine(l).tc}
            </a>
          ))}
        </nav>
      )}
      <StationCard key={selected} line={selected} station={code} />
    </>
  )
}
