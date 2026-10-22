import { useState } from 'react'
import coords from './data/coords.json'
import { getStation, type Station } from './data/lines'

export type NearbyStation = { station: Station; metres: number }

export type NearestState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'found'; results: NearbyStation[] }
  | { status: 'outside' }
  | { status: 'denied' }
  | { status: 'unavailable' }

// Further than this from every station means the user is not in Hong Kong.
const OUTSIDE_HK_METRES = 50_000
const EARTH_RADIUS_METRES = 6_371_000

function distanceMetres([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLon = rad(lon2 - lon1)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(h))
}

export function nearestStations(position: [number, number], count = 3): NearbyStation[] {
  return Object.entries(coords as Record<string, number[]>)
    .map(([code, [lat, lon]]) => ({ station: getStation(code)!, metres: distanceMetres(position, [lat, lon]) }))
    .sort((a, b) => a.metres - b.metres)
    .slice(0, count)
}

export function useNearestStations() {
  const [state, setState] = useState<NearestState>({ status: 'idle' })

  const locate = () => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unavailable' })
      return
    }
    setState({ status: 'locating' })
    // The position stays in the browser; only the station list is derived from it.
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        const results = nearestStations([latitude, longitude])
        setState(results[0].metres > OUTSIDE_HK_METRES ? { status: 'outside' } : { status: 'found', results })
      },
      (error) => setState({ status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable' }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    )
  }

  return { state, locate }
}
