import { useEffect, useState } from 'react'
import { isLineCode, type LineCode } from './data/lines'

// Hash routes, because GitHub Pages cannot rewrite unknown paths to index.html.
export type Route =
  | { name: 'lines' }
  | { name: 'line'; line: LineCode }
  | { name: 'station'; station: string; line?: LineCode }

export function parseRoute(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?')
  const parts = path.split('/').filter(Boolean)
  if (parts[0] === 'line' && parts[1] && isLineCode(parts[1])) return { name: 'line', line: parts[1] }
  if (parts[0] === 'station' && parts[1]) {
    const line = new URLSearchParams(query).get('line') ?? ''
    return { name: 'station', station: parts[1], line: isLineCode(line) ? line : undefined }
  }
  return { name: 'lines' }
}

export const href = {
  lines: () => '#/',
  line: (line: LineCode) => `#/line/${line}`,
  station: (station: string, line?: LineCode) => `#/station/${station}${line ? `?line=${line}` : ''}`,
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
