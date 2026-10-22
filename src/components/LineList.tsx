import { LINES } from '../data/lines'
import { href } from '../router'
import { LineBadge } from './LineBadge'

export function LineList() {
  return (
    <>
      <h2 className="section-title">按路綫瀏覽</h2>
      <ul className="list">
        {LINES.map((line) => (
          <li key={line.code}>
            <a className="list-row" href={href.line(line.code)}>
              <LineBadge code={line.code} />
              <span>{line.tc}</span>
              <span className="en">{line.en}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
