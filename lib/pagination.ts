// Windowed page list for pagination controls: e.g. [1, 'gap', 4, 5, 6, 'gap', 12].
// Mirrors the reference implementation in design/hathmaluwa (Claude Design pagination update).
export function pageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const out: (number | 'gap')[] = [1]
  let from = Math.max(2, current - 1)
  let to = Math.min(total - 1, current + 1)
  if (current <= 3) {
    from = 2
    to = 4
  }
  if (current >= total - 2) {
    from = total - 3
    to = total - 1
  }
  if (from > 2) out.push('gap')
  for (let n = from; n <= to; n++) out.push(n)
  if (to < total - 1) out.push('gap')
  out.push(total)
  return out
}
