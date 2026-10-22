import { getLine, type LineCode } from '../data/lines'

export function LineBadge({ code }: { code: LineCode }) {
  const line = getLine(code)
  return (
    <span className="badge" style={{ background: line.badge, color: line.onBadge }} title={line.tc}>
      {code}
    </span>
  )
}
