import type { CSSProperties } from 'react'
import { getLine, getLineStations, getStation, type LineCode } from '../data/lines'
import { href } from '../router'
import { LineBadge } from './LineBadge'

function StopList({ line, codes }: { line: LineCode; codes: string[] }) {
  return (
    <ol className="route" style={{ '--line': getLine(line).color } as CSSProperties}>
      {codes.map((code) => {
        const station = getStation(code)
        if (!station) return null
        return (
          <li key={code}>
            <a className="route-stop" href={href.station(code, line)}>
              <span>{station.tc}</span>
              <span className="muted" style={{ fontSize: 12 }}>
                {station.en}
              </span>
              <span className="badges">
                {station.lines
                  .filter((l) => l !== line)
                  .map((l) => (
                    <LineBadge key={l} code={l} />
                  ))}
              </span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}

export function LineStations({ line }: { line: LineCode }) {
  const { tc, en } = getLine(line)
  const { stations, branches } = getLineStations(line)
  return (
    <>
      <div className="station-title">
        <LineBadge code={line} />
        <h1>{tc}</h1>
        <span className="muted">{en}</span>
      </div>
      <StopList line={line} codes={stations} />
      {branches.map((branch) => (
        <section key={branch.id}>
          <h2 className="section-title">支綫（由{getStation(branch.from)?.tc}站分出）</h2>
          <StopList line={line} codes={branch.stations} />
        </section>
      ))}
    </>
  )
}
