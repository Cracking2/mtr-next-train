// Regenerates src/data/stations.json from MTR's open-data station list.
// Run with `npm run data` whenever MTR adds or renames a station.
import { writeFile } from 'node:fs/promises'

const SOURCE = 'https://opendata.mtr.com.hk/data/mtr_lines_and_stations.csv'
const OUT = new URL('../src/data/stations.json', import.meta.url)

const res = await fetch(SOURCE)
if (!res.ok) throw new Error(`Fetching ${SOURCE} failed: HTTP ${res.status}`)
const text = (await res.text()).replace(/^﻿/, '')

const rows = text
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.split(',').map((cell) => cell.replace(/^"|"$/g, '').trim()))
  .filter((cells) => cells[0] && cells[2])
  .map(([line, direction, code, , tc, en, seq]) => ({ line, direction, code, tc, en, seq: Number(seq) }))

const stations = {}
const lines = {}

for (const r of rows) {
  stations[r.code] ??= { tc: r.tc, en: r.en, lines: [] }
  if (!stations[r.code].lines.includes(r.line)) stations[r.code].lines.push(r.line)
}

const byLine = Map.groupBy(rows, (r) => r.line)
for (const [line, lineRows] of byLine) {
  const ordered = (direction) =>
    lineRows.filter((r) => r.direction === direction).sort((a, b) => a.seq - b.seq).map((r) => r.code)

  const main = ordered('UT')
  const branchIds = [...new Set(lineRows.map((r) => r.direction).filter((d) => d.endsWith('-UT')))]
  const branches = branchIds.map((id) => {
    const all = ordered(id)
    const firstOwn = all.findIndex((code) => !main.includes(code))
    return { id: id.replace('-UT', ''), from: all[firstOwn - 1], stations: all.slice(firstOwn) }
  })
  lines[line] = { stations: main, branches }
}

if (Object.keys(lines).length !== 10) throw new Error(`Expected 10 lines, got ${Object.keys(lines).length}`)
for (const [line, { stations: list }] of Object.entries(lines)) {
  if (list.length < 2) throw new Error(`${line} has only ${list.length} stations`)
}

await writeFile(OUT, `${JSON.stringify({ source: SOURCE, lines, stations }, null, 2)}\n`)
console.log(`Wrote ${Object.keys(stations).length} stations across ${Object.keys(lines).length} lines`)
