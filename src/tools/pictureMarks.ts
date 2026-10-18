import type { Box, Clue } from './examples'

// Where the boxes go on a checked picture (MarkedPicture in Result.tsx)

// Boxes a little bigger than the words they mark, inside the picture (from 0 to
// 1000), so the edges of the words aren't covered
const PAD = { across: 12, down: 8 }
function padded(box: Box) {
  return {
    left: Math.max(0, box.left - PAD.across),
    top: Math.max(0, box.top - PAD.down),
    right: Math.min(1000, box.right + PAD.across),
    bottom: Math.min(1000, box.bottom + PAD.down),
  }
}

// Boxes that mostly overlap (signs on the same lines) are drawn as one box with
// all their numbers, so they don't tangle
export type Mark = { box: Box; clues: number[] }
const area = (b: Box) => Math.max(0, b.right - b.left) * Math.max(0, b.bottom - b.top)
function overlaps(a: Box, b: Box) {
  const shared = area({ left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) })
  return shared > 0.3 * Math.min(area(a), area(b))
}
export function marksOf(clues: Clue[]): Mark[] {
  const marks: Mark[] = []
  clues.forEach((c, i) =>
    (c.boxes ?? []).forEach((raw) => {
      let mark: Mark = { box: padded(raw), clues: [i] }
      // Join every mark it overlaps (and keep going: a joined box is bigger)
      for (let joined = true; joined; ) {
        joined = false
        for (const other of marks) {
          if (!overlaps(mark.box, other.box)) continue
          marks.splice(marks.indexOf(other), 1)
          mark = {
            box: {
              left: Math.min(mark.box.left, other.box.left),
              top: Math.min(mark.box.top, other.box.top),
              right: Math.max(mark.box.right, other.box.right),
              bottom: Math.max(mark.box.bottom, other.box.bottom),
            },
            clues: [...new Set([...other.clues, ...mark.clues])].sort((x, y) => x - y),
          }
          joined = true
          break
        }
      }
      marks.push(mark)
    }),
  )
  return marks
}
