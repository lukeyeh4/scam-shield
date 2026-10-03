export type Segment = { text: string; mark?: number }

// Splits text into plain and marked segments. `highlights[i]` is the exact text
// for mark i; a highlight that isn't in the text is skipped.
export function splitByHighlights(text: string, highlights: { index: number; text: string }[]): Segment[] {
  const ranges = highlights
    .map((h) => ({ mark: h.index, start: text.indexOf(h.text), end: text.indexOf(h.text) + h.text.length }))
    .filter((r) => r.start >= 0)
    .sort((a, b) => a.start - b.start)

  const segments: Segment[] = []
  let pos = 0
  for (const r of ranges) {
    if (r.start < pos) continue // overlapping highlights: keep the first
    if (r.start > pos) segments.push({ text: text.slice(pos, r.start) })
    segments.push({ text: text.slice(r.start, r.end), mark: r.mark })
    pos = r.end
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) })
  return segments
}
