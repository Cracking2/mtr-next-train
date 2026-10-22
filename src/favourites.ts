import { useState } from 'react'
import { getStation, isLineCode, type LineCode } from './data/lines'
import { readJson, writeJson } from './storage'

export type Favourite = { station: string; line: LineCode }

const STORAGE_KEY = 'mtr:favourites'

function load(): Favourite[] {
  const raw = readJson<unknown>(STORAGE_KEY, [])
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (f): f is Favourite =>
      typeof f?.station === 'string' &&
      typeof f?.line === 'string' &&
      isLineCode(f.line) &&
      getStation(f.station)?.lines.includes(f.line) === true,
  )
}

export function useFavourites() {
  const [favourites, setFavourites] = useState(load)

  const update = (change: (prev: Favourite[]) => Favourite[]) =>
    setFavourites((prev) => {
      const next = change(prev)
      writeJson(STORAGE_KEY, next)
      return next
    })

  const matches = (f: Favourite, station: string, line: LineCode) => f.station === station && f.line === line

  const isFavourite = (station: string, line: LineCode) => favourites.some((f) => matches(f, station, line))

  const toggle = (station: string, line: LineCode) =>
    update((prev) =>
      prev.some((f) => matches(f, station, line))
        ? prev.filter((f) => !matches(f, station, line))
        : [...prev, { station, line }],
    )

  const restore = (previous: Favourite[]) => update(() => previous)

  return { favourites, isFavourite, toggle, restore }
}
