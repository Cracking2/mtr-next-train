import { useEffect, useState, type CSSProperties } from 'react'
import { getLine, getStation, type LineCode } from '../data/lines'
import { useFavourites, type Favourite } from '../favourites'
import { useLang } from '../i18n'
import { href } from '../router'
import { StationCard } from './StationCard'

type Notice = { message: 'saved' | 'removed'; previous: Favourite[] }

export function StationPage({ code, line }: { code: string; line?: LineCode }) {
  const { t, f, name, lang } = useLang()
  const { favourites, isFavourite, toggle, restore } = useFavourites()
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const station = getStation(code)
  if (!station) return <p className="muted">{f('stationNotFound', code)}</p>

  const selected = line && station.lines.includes(line) ? line : station.lines[0]
  const saved = isFavourite(code, selected)

  const onToggle = () => {
    setNotice({ message: saved ? 'removed' : 'saved', previous: favourites })
    toggle(code, selected)
  }

  return (
    <>
      <div className="station-title">
        <h1>{name(station)}</h1>
        {lang === 'zh' && <span className="muted">{station.en}</span>}
        <button
          type="button"
          className="star"
          aria-pressed={saved}
          aria-label={saved ? t('removeFavourite') : t('addFavourite')}
          onClick={onToggle}
        >
          {saved ? '★' : '☆'}
        </button>
      </div>
      {station.lines.length > 1 && (
        <nav className="tabs" role="tablist" aria-label={t('lines')}>
          {station.lines.map((l) => (
            <a
              key={l}
              className="tab"
              role="tab"
              aria-selected={l === selected}
              href={href.station(code, l)}
              style={{ '--line': getLine(l).color } as CSSProperties}
            >
              {name(getLine(l))}
            </a>
          ))}
        </nav>
      )}
      <StationCard key={selected} line={selected} station={code} />
      <div className="toast-region" role="status" aria-live="polite">
        {notice && (
          <div className="toast">
            <span>{t(notice.message)}</span>
            <button
              type="button"
              onClick={() => {
                restore(notice.previous)
                setNotice(null)
              }}
            >
              {t('undo')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
