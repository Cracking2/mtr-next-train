import { Home } from './components/Home'
import { LineStations } from './components/LineStations'
import { StationPage } from './components/StationPage'
import { getLine } from './data/lines'
import { useLang } from './i18n'
import { href, useRoute, type Route } from './router'

function BackLink({ route }: { route: Route }) {
  const { t, name } = useLang()
  if (route.name === 'station' && route.line) {
    return (
      <a className="back" href={href.line(route.line)}>
        ‹ {name(getLine(route.line))}
      </a>
    )
  }
  return (
    <a className="back" href={href.lines()}>
      ‹ {t('allLines')}
    </a>
  )
}

export default function App() {
  const route = useRoute()
  const { t, lang, setLang } = useLang()
  return (
    <div className="app">
      <header className="app-header">
        {route.name === 'lines' ? <h1>{t('appTitle')}</h1> : <BackLink route={route} />}
        <button
          type="button"
          className="lang-toggle"
          aria-label={t('switchLangLabel')}
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
        >
          {t('switchLang')}
        </button>
      </header>
      <main>
        {route.name === 'lines' && <Home />}
        {route.name === 'line' && <LineStations line={route.line} />}
        {route.name === 'station' && (
          <StationPage key={`${route.station}-${route.line}`} code={route.station} line={route.line} />
        )}
      </main>
      <footer className="footer">{t('footer')}</footer>
    </div>
  )
}
