import { getLine, type LineCode } from '../data/lines'
import { useLang } from '../i18n'

export function LineBadge({ code }: { code: LineCode }) {
  const { name } = useLang()
  const line = getLine(code)
  return (
    <>
      <span className="badge" style={{ background: line.badge, color: line.onBadge }} aria-hidden="true">
        {code}
      </span>
      <span className="sr-only">{name(line)}</span>
    </>
  )
}
