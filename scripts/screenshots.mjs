// Captures the README screenshots from the live site at phone size, via the Chrome DevTools Protocol.
// Run with `npm run screenshots`. Set CHROME_PATH if Chrome is not in the default location.
import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = 'https://cracking2.github.io/mtr-next-train/'
const OUT_DIR = new URL('../docs/screenshots/', import.meta.url)
const PORT = 9333
const TSEUNG_KWAN_O = { latitude: 22.3074, longitude: 114.26 }

const CHROME =
  process.env.CHROME_PATH ??
  {
    win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  }[process.platform] ??
  'google-chrome'

const SHOTS = [
  { file: 'home.png', hash: '#/', favourites: [['TKO', 'TKL'], ['ADM', 'ISL']] },
  { file: 'nearest.png', hash: '#/', click: '.locate button' },
  { file: 'station.png', hash: '#/station/ADM?line=TWL' },
  { file: 'line.png', hash: '#/line/TKL' },
  { file: 'station-dark.png', hash: '#/station/TKO?line=TKL', dark: true },
  { file: 'station-en.png', hash: '#/station/ADM?line=ISL', lang: 'en' },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const profile = await mkdtemp(join(tmpdir(), 'mtr-shots-'))
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'])

async function connect() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = targets.find((t) => t.type === 'page')
      if (page) return new WebSocket(page.webSocketDebuggerUrl)
    } catch {
      // Chrome is still starting.
    }
    await sleep(200)
  }
  throw new Error(`Chrome did not open a debugging port. Is ${CHROME} correct?`)
}

const socket = await connect()
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))

let nextId = 1
const pending = new Map()
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  const waiter = pending.get(message.id)
  if (!waiter) return
  pending.delete(message.id)
  if (message.error) waiter.reject(new Error(message.error.message))
  else waiter.resolve(message.result)
})
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })

try {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await send('Emulation.setGeolocationOverride', { ...TSEUNG_KWAN_O, accuracy: 30 })
  await send('Browser.grantPermissions', { origin: new URL(BASE).origin, permissions: ['geolocation'] })

  for (const shot of SHOTS) {
    await send('Page.navigate', { url: BASE })
    await sleep(1500)
    const storage = { 'mtr:favourites': (shot.favourites ?? []).map(([station, line]) => ({ station, line })), 'mtr:lang': shot.lang ?? 'zh' }
    await send('Runtime.evaluate', {
      expression: `Object.entries(${JSON.stringify(storage)}).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)))`,
    })
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: shot.dark ? 'dark' : 'light' }] })
    await send('Page.navigate', { url: `${BASE}?shot=${shot.file}${shot.hash}` })
    await sleep(4000)
    if (shot.click) {
      await send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(shot.click)}).click()` })
      await sleep(1000)
    }
    const { data } = await send('Page.captureScreenshot', { format: 'png' })
    await writeFile(new URL(shot.file, OUT_DIR), Buffer.from(data, 'base64'))
    console.log(`Saved docs/screenshots/${shot.file}`)
  }
} finally {
  socket.close()
  chrome.kill()
  await sleep(500)
  await rm(profile, { recursive: true, force: true }).catch(() => {})
}
