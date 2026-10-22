import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { readJson, writeJson } from './storage'

export type Lang = 'zh' | 'en'

const STORAGE_KEY = 'mtr:lang'

const messages = {
  appTitle: { zh: '港鐵下一班車', en: 'MTR Next Train' },
  switchLang: { zh: 'EN', en: '中' },
  switchLangLabel: { zh: 'Switch to English', en: '切換至中文' },
  browseLines: { zh: '按路綫瀏覽', en: 'Browse by line' },
  allLines: { zh: '所有路綫', en: 'All lines' },
  lines: { zh: '路綫', en: 'Lines' },
  searchPlaceholder: { zh: '搜尋車站，例如將軍澳', en: 'Search stations, e.g. Tseung Kwan O' },
  searchLabel: { zh: '搜尋車站', en: 'Search stations' },
  favourites: { zh: '收藏', en: 'Favourites' },
  welcome: {
    zh: '收藏常用車站，下次一開就見到班次。',
    en: 'Save the stations you use, and their trains show here next time.',
  },
  addFavourite: { zh: '收藏', en: 'Save' },
  removeFavourite: { zh: '取消收藏', en: 'Remove from favourites' },
  saved: { zh: '已收藏', en: 'Saved' },
  removed: { zh: '已取消收藏', en: 'Removed' },
  undo: { zh: '復原', en: 'Undo' },
  arriving: { zh: '即將抵達', en: 'Arriving' },
  delayed: { zh: '列車服務延誤', en: 'Train service delayed' },
  noTrains: {
    zh: '暫時沒有班次資料。可能是非服務時間。',
    en: 'No train data right now. Service may have ended for the day.',
  },
  loadFailed: { zh: '未能載入班次。請檢查網絡後重試。', en: "Couldn't load trains. Check your connection and try again." },
  retry: { zh: '重試', en: 'Retry' },
  reload: { zh: '重新載入', en: 'Reload' },
  justUpdated: { zh: '剛剛更新', en: 'Just updated' },
  maybeStale: { zh: '，班次可能已過時', en: ', times may be out of date' },
  loading: { zh: '載入班次中', en: 'Loading trains' },
  footer: {
    zh: '資料來源：DATA.GOV.HK · 本 App 與港鐵公司無關',
    en: 'Data: DATA.GOV.HK · Not affiliated with MTR Corporation',
  },
} satisfies Record<string, Record<Lang, string>>

export type MessageKey = keyof typeof messages

const formats = {
  minutes: (n: number) => ({ zh: `${n} 分`, en: `${n} min` }),
  updatedAgo: (s: number) => ({ zh: `${s} 秒前更新`, en: `Updated ${s}s ago` }),
  towards: (dests: string, platform: string) => ({
    zh: `往 ${dests} · ${platform} 號月台`,
    en: `To ${dests} · Platform ${platform}`,
  }),
  branchFrom: (station: string) => ({ zh: `支綫（由${station}站分出）`, en: `Branch from ${station}` }),
  noResults: (q: string) => ({
    zh: `找不到「${q}」。試試英文名或車站代號。`,
    en: `No station matches "${q}". Try the Chinese name or station code.`,
  }),
  stationNotFound: (code: string) => ({ zh: `找不到車站「${code}」。`, en: `Station "${code}" not found.` }),
}

type Named = { tc: string; en: string }

function makeTranslator(lang: Lang) {
  return {
    lang,
    t: (key: MessageKey) => messages[key][lang],
    f: <K extends keyof typeof formats>(key: K, ...args: Parameters<(typeof formats)[K]>) =>
      (formats[key] as (...a: unknown[]) => Record<Lang, string>)(...args)[lang],
    name: (item: Named) => (lang === 'zh' ? item.tc : item.en),
  }
}

type LangContextValue = ReturnType<typeof makeTranslator> & { setLang: (lang: Lang) => void }

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (readJson<string>(STORAGE_KEY, 'zh') === 'en' ? 'en' : 'zh'))

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-HK' : 'en'
    document.title = messages.appTitle[lang]
  }, [lang])

  const setLang = (next: Lang) => {
    setLangState(next)
    writeJson(STORAGE_KEY, next)
  }

  return <LangContext.Provider value={{ ...makeTranslator(lang), setLang }}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const value = useContext(LangContext)
  if (!value) throw new Error('useLang must be used inside LangProvider')
  return value
}
