import { LINES } from '../data/lines'
import { useLang } from '../i18n'
import { href } from '../router'
import { LineBadge } from './LineBadge'

export function LineList() {
  const { t, lang } = useLang()
  return (
    <section>
      <h2 className="section-title">{t('browseLines')}</h2>
      <ul className="list">
        {LINES.map((line) => (
          <li key={line.code}>
            <a className="list-row" href={href.line(line.code)}>
              <LineBadge code={line.code} />
              <span>{lang === 'zh' ? line.tc : line.en}</span>
              {lang === 'zh' && <span className="en">{line.en}</span>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
