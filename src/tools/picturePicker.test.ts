import { describe, expect, it } from 'vitest'
import { fitWithin, LONGEST_SIDE, receivePicture, takeReceivedPicture } from './picturePicker'

describe('getting a picture ready', () => {
  it.each([
    // An iPad screenshot (landscape), an iPhone screenshot (portrait), a big photo
    [2732, 2048, LONGEST_SIDE, 1175],
    [1290, 2796, 723, LONGEST_SIDE],
    [4032, 3024, LONGEST_SIDE, 1176],
  ])('shrinks %ix%i to %ix%i', (width, height, w, h) => {
    expect(fitWithin(width, height)).toEqual({ width: w, height: h })
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
