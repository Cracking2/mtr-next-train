import { useLang } from '../i18n'
import { useNearestStations } from '../nearest'
import { href } from '../router'
import { LineBadge } from './LineBadge'

type Props = {
  onSearch: () => void
  onBrowse: () => void
}

export function NearestStations({ onSearch, onBrowse }: Props) {
  const { t, f, name } = useLang()
  const { state, locate } = useNearestStations()

  if (state.status === 'found') {
    return (
      <section>
        <h2 className="section-title">
          {t('nearest')} · {t('straightLine')}
        </h2>
        <ul className="list">
          {state.results.map(({ station, metres }) => (
            <li key={station.code}>
              <a className="list-row" href={href.station(station.code)}>
                <span>{name(station)}</span>
                <span className="badges" style={{ display: 'flex', gap: 4 }}>
                  {station.lines.map((l) => (
                    <LineBadge key={l} code={l} />
                  ))}
                </span>
                <span className="distance">{f('distance', metres)}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const problem =
    state.status === 'denied'
      ? t('locationDenied')
      : state.status === 'unavailable'
        ? t('locationUnavailable')
        : state.status === 'outside'
          ? t('outsideHk')
          : null

  return (
    <section className="locate" aria-live="polite">
      {problem ? (
        <>
          <p className="banner warning">{problem}</p>
          <div className="button-row">
            <button type="button" onClick={onSearch}>
              {t('searchInstead')}
            </button>
            <button type="button" onClick={onBrowse}>
              {t('browseLines')}
            </button>
            {state.status === 'unavailable' && (
              <button type="button" onClick={locate}>
                {t('tryAgain')}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <button type="button" className="primary" onClick={locate} disabled={state.status === 'locating'}>
            {state.status === 'locating' ? t('locating') : t('locate')}
          </button>
          <p className="hint">{t('locatePrivacy')}</p>
        </>
      )}
    </section>
  )
}
