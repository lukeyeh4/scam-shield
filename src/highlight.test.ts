import { describe, expect, it } from 'vitest'
import { splitByHighlights } from './highlight'

describe('splitByHighlights', () => {
  it('returns the whole text when there is nothing to highlight', () => {
    expect(splitByHighlights('Hi Mom', [])).toEqual([{ text: 'Hi Mom' }])
  })

  it('marks a highlight in the middle of the text', () => {
    expect(splitByHighlights('Limited time! Log in now', [{ index: 0, text: 'Log in' }])).toEqual([
      { text: 'Limited time! ' },
      { text: 'Log in', mark: 0 },
      { text: ' now' },
    ])
  })

  it('marks highlights at the very start and end', () => {
    expect(
      splitByHighlights('Hurry, claim it', [
        { index: 0, text: 'Hurry' },
        { index: 1, text: 'claim it' },
      ]),
    ).toEqual([{ text: 'Hurry', mark: 0 }, { text: ', ' }, { text: 'claim it', mark: 1 }])
  })

  it('puts highlights in text order, whatever order they are given in', () => {
    expect(
      splitByHighlights('one two three', [
        { index: 0, text: 'three' },
        { index: 1, text: 'one' },
      ]),
    ).toEqual([{ text: 'one', mark: 1 }, { text: ' two ' }, { text: 'three', mark: 0 }])
  })

  it('marks the whole text when the highlight is all of it', () => {
    expect(splitByHighlights('Sponsored', [{ index: 2, text: 'Sponsored' }])).toEqual([
      { text: 'Sponsored', mark: 2 },
    ])
  })

  it('skips a highlight that is not in the text', () => {
    expect(splitByHighlights('Hi Mom', [{ index: 0, text: 'Dad' }])).toEqual([{ text: 'Hi Mom' }])
  })

  it('only marks the first place a repeated highlight appears', () => {
    expect(splitByHighlights('free free', [{ index: 0, text: 'free' }])).toEqual([
      { text: 'free', mark: 0 },
      { text: ' free' },
    ])
  })

  it('keeps the earlier highlight when two overlap', () => {
    expect(
      splitByHighlights('claim your free Robux', [
        { index: 0, text: 'free Robux' },
        { index: 1, text: 'your free' },
      ]),
    ).toEqual([{ text: 'claim ' }, { text: 'your free', mark: 1 }, { text: ' Robux' }])
  })
})
