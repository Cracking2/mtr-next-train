// Regenerates src/data/coords.json (station code -> [lat, lon]) from OpenStreetMap.
// Run with `npm run coords` after `npm run data`. OSM data is ODbL: credit "© OpenStreetMap contributors".
import { readFile, writeFile } from 'node:fs/promises'

// Public Overpass servers are often overloaded, so try mirrors in turn.
const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
const QUERY = `[out:json][timeout:60];
area["ISO3166-1"="HK"]->.hk;
nwr["railway"="station"]["station"!="light_rail"](area.hk);
out center tags;`
const STATIONS = new URL('../src/data/stations.json', import.meta.url)
const OUT = new URL('../src/data/coords.json', import.meta.url)
const HK_BOUNDS = { minLat: 22.15, maxLat: 22.57, minLon: 113.82, maxLon: 114.45 }

const { stations } = JSON.parse(await readFile(STATIONS, 'utf8'))

async function queryOverpass() {
  const failures = []
  for (const endpoint of OVERPASS) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'User-Agent': 'mtr-next-train (github.com/Cracking2/mtr-next-train)' },
      body: new URLSearchParams({ data: QUERY }),
    }).catch((err) => ({ ok: false, status: err.message }))
    if (res.ok) return res.json()
    failures.push(`${endpoint}: ${res.status}`)
  }
  throw new Error(`All Overpass servers failed:\n${failures.join('\n')}`)
}

const { elements } = await queryOverpass()

// MTR's CSV writes 荔 (Lai) with the variant 茘; OSM uses the standard form.
const normaliseZh = (name) => name?.replaceAll('茘', '荔')

const point = (e) => e.center ?? { lat: e.lat, lon: e.lon }
const byRef = Map.groupBy(elements.filter((e) => e.tags?.ref), (e) => e.tags.ref)
const byZhName = Map.groupBy(elements, (e) => normaliseZh(e.tags?.['name:zh']))

const coords = {}
const problems = []
for (const [code, { tc }] of Object.entries(stations)) {
  const matches = byRef.get(code) ?? byZhName.get(normaliseZh(tc))
  if (!matches) {
    problems.push(`${code} ${tc}: no OSM station`)
    continue
  }
  // A station mapped as several objects (one per line or concourse) is placed at their average.
  const lat = matches.reduce((sum, e) => sum + point(e).lat, 0) / matches.length
  const lon = matches.reduce((sum, e) => sum + point(e).lon, 0) / matches.length
  if (lat < HK_BOUNDS.minLat || lat > HK_BOUNDS.maxLat || lon < HK_BOUNDS.minLon || lon > HK_BOUNDS.maxLon) {
    problems.push(`${code} ${tc}: ${lat},${lon} is outside Hong Kong`)
  }
  const names = new Set(matches.map((e) => normaliseZh(e.tags['name:zh'])))
  if (!names.has(normaliseZh(tc))) problems.push(`${code} ${tc}: OSM name is ${[...names].join('/')} (check)`)
  coords[code] = [Number(lat.toFixed(6)), Number(lon.toFixed(6))]
}

if (problems.length) {
  console.error(problems.join('\n'))
  if (Object.keys(coords).length !== Object.keys(stations).length) process.exit(1)
}

await writeFile(OUT, `${JSON.stringify(coords, null, 2)}\n`)
console.log(`Wrote coordinates for ${Object.keys(coords).length} of ${Object.keys(stations).length} stations`)
