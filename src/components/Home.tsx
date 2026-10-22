import { useState } from 'react'
import { getLine, getStation, searchStations } from '../data/lines'
import { useFavourites } from '../favourites'
import { useLang } from '../i18n'
import { href } from '../router'
import { LineBadge } from './LineBadge'
import { LineList } from './LineList'
import { StationCard } from './StationCard'

function SearchResults({ query }: { query: string }) {
  const { f, name, lang } = useLang()
  const results = searchStations(query)
  if (results.length === 0) return <p className="muted">{f('noResults', query.trim())}</p>
  return (
    <ul className="list">
      {results.map((s) => (
        <li key={s.code}>
          <a className="list-row" href={href.station(s.code)}>
            <span>{name(s)}</span>
            {lang === 'zh' && <span className="muted" style={{ fontSize: 12 }}>{s.en}</span>}
            <span className="badges" style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {s.lines.map((l) => (
                <LineBadge key={l} code={l} />
              ))}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function Favourites() {
  const { t, name } = useLang()
  const { favourites } = useFavourites()
  if (favourites.length === 0) return <p className="welcome">{t('welcome')}</p>
  return (
    <section className="stack">
      <h2 className="section-title">{t('favourites')}</h2>
      {favourites.map(({ station, line }) => (
        <StationCard
          key={`${station}-${line}`}
          line={line}
          station={station}
          limit={2}
          header={
            <a className="card-header" href={href.station(station, line)}>
              <LineBadge code={line} />
              <span>{name(getStation(station)!)}</span>
              <span className="muted card-header-line">{name(getLine(line))} ›</span>
            </a>
          }
        />
      ))}
    </section>
  )
}

export function Home() {
  const { t } = useLang()
  const [query, setQuery] = useState('')
  return (
    <div className="stack">
      <input
        className="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchLabel')}
        autoComplete="off"
      />
      {query.trim() ? (
        <SearchResults query={query} />
      ) : (
        <>
          <Favourites />
          <LineList />
        </>
      )}
    </div>
  )
}
