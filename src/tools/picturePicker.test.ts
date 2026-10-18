import { describe, expect, it } from 'vitest'
import { fitWithin, LONGEST_SIDE, MAX_PIXELS, receivePicture, takeReceivedPicture } from './picturePicker'

describe('getting a picture ready', () => {
  it.each([
    // An iPad screenshot (landscape), an iPhone screenshot (portrait), a big photo
    [2732, 2048, 1238, 928],
    [1290, 2796, 723, LONGEST_SIDE],
    [4032, 3024, 1238, 928],
  ])('shrinks %ix%i to %ix%i', (width, height, w, h) => {
    expect(fitWithin(width, height)).toEqual({ width: w, height: h })
  })

  it('keeps every picture under the most pixels the AI looks at without shrinking it', () => {
    for (const [width, height] of [[2732, 2048], [1290, 2796], [4032, 3024], [8000, 8000], [3000, 1000]]) {
      const size = fitWithin(width, height)
      expect(size.width * size.height).toBeLessThanOrEqual(MAX_PIXELS)
      expect(Math.max(size.width, size.height)).toBeLessThanOrEqual(LONGEST_SIDE)
    }
  })

  it('never makes a small picture bigger', () => {
    expect(fitWithin(640, 480)).toEqual({ width: 640, height: 480 })
  })

  it('hands over a shared picture once', () => {
    const picture = new Blob(['x'], { type: 'image/png' })
    receivePicture(picture)
    expect(takeReceivedPicture()).toBe(picture)
    expect(takeReceivedPicture()).toBeNull()
  })
})
