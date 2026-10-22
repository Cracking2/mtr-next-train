import type { CSSProperties } from 'react'
import { getLine, getLineStations, getStation, type LineCode } from '../data/lines'
import { useLang } from '../i18n'
import { href } from '../router'
import { LineBadge } from './LineBadge'

function StopList({ line, codes }: { line: LineCode; codes: string[] }) {
  const { lang } = useLang()
  return (
    <ol className="route" style={{ '--line': getLine(line).color } as CSSProperties}>
      {codes.map((code) => {
        const station = getStation(code)
        if (!station) return null
        return (
          <li key={code}>
            <a className="route-stop" href={href.station(code, line)}>
              <span>{lang === 'zh' ? station.tc : station.en}</span>
              {lang === 'zh' && (
                <span className="muted" style={{ fontSize: 12 }}>
                  {station.en}
                </span>
              )}
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
  const { name, f, lang } = useLang()
  const info = getLine(line)
  const { stations, branches } = getLineStations(line)
  return (
    <>
      <div className="station-title">
        <LineBadge code={line} />
        <h1>{name(info)}</h1>
        {lang === 'zh' && <span className="muted">{info.en}</span>}
      </div>
      <StopList line={line} codes={stations} />
      {branches.map((branch) => {
        const from = getStation(branch.from)
        return (
          <section key={branch.id}>
            <h2 className="section-title">{f('branchFrom', from ? name(from) : branch.from)}</h2>
            <StopList line={line} codes={branch.stations} />
          </section>
        )
      })}
    </>
  )
}
