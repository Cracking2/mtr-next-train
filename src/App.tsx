import { LineList } from './components/LineList'
import { LineStations } from './components/LineStations'
import { StationPage } from './components/StationPage'
import { getLine } from './data/lines'
import { href, useRoute, type Route } from './router'

function BackLink({ route }: { route: Route }) {
  if (route.name === 'lines') return null
  if (route.name === 'station' && route.line) {
    return (
      <a className="back" href={href.line(route.line)}>
        ‹ {getLine(route.line).tc}
      </a>
    )
  }
  return (
    <a className="back" href={href.lines()}>
      ‹ 所有路綫
    </a>
  )
}

export default function App() {
  const route = useRoute()
  return (
    <div className="app">
      <header className="app-header">
        {route.name === 'lines' ? <h1>港鐵下一班車</h1> : <BackLink route={route} />}
      </header>
      <main>
        {route.name === 'lines' && <LineList />}
        {route.name === 'line' && <LineStations line={route.line} />}
        {route.name === 'station' && <StationPage code={route.station} line={route.line} />}
      </main>
      <footer className="footer">資料來源：DATA.GOV.HK · 本 App 與港鐵公司無關</footer>
    </div>
  )
}
