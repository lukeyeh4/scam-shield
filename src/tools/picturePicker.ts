// Getting a picture to check, and getting it ready to send.
//
// Every way a picture comes in goes through here, so the picture checker doesn't
// care where it came from:
// - `pickPicture`: the Choose a screenshot / Take a photo buttons. On the website
//   this is the browser's picker (photo library, camera or files).
//   IN THE APP: replace the inside of `pickPicture` with the phone's own picker,
//   e.g. Capacitor's Camera.getPhoto({ source: Photos or Camera }), returning the
//   picture as a Blob. Nothing else needs to change.
// - `receivePicture`: a picture pasted (Cmd+V) or dragged in now, and IN THE APP the
//   share button ("Share → Scam Shield"): the app hands the shared picture to
//   `receivePicture`, then opens #/check/picture, which picks it up with
//   `takeReceivedPicture`.
//
// `preparePicture` then shrinks it and saves it again as a JPEG. That keeps it small
// (faster and cheaper to check) and removes hidden details photos carry, like where
// they were taken.

export type PictureSource = 'library' | 'camera'

// A picture ready to show and to send
export type PreparedPicture = {
  blob: Blob
  // For showing it (an object URL: call `forgetPicture` when done with it)
  url: string
  width: number
  height: number
}

// Why a picture couldn't be used
export type PictureProblem = 'notAPicture' | 'unreadable' | 'tooBig'

// The longest side we send, in pixels: big enough to read the small print on a
// screenshot, the size Claude reads best
export const LONGEST_SIDE = 1568
// Pictures bigger than this aren't opened at all
const MAX_BYTES = 40 * 1024 * 1024

// Phones and tablets can take a photo; on a computer only "Choose" makes sense
export const canTakePhoto = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

// Opens the device's picker for a picture. Resolves with the picture, or null if
// the player closed the picker without choosing one.
export function pickPicture(source: PictureSource): Promise<Blob | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    // Straight to the camera on phones and tablets (computers ignore it)
    if (source === 'camera') input.capture = 'environment'
    // On the page while it's open: iOS Safari can drop the choice from an input
    // that isn't
    input.hidden = true
    document.body.append(input)
    const done = (picture: Blob | null) => {
      input.remove()
      resolve(picture)
    }
    input.addEventListener('change', () => done(input.files?.[0] ?? null), { once: true })
    input.addEventListener('cancel', () => done(null), { once: true })
    input.click()
  })
}

// A picture that came in from outside the checker (see the top of this file)
let received: Blob | null = null

export function receivePicture(picture: Blob) {
  received = picture
}

// The picture that came in, if any (once: it's forgotten after this)
export function takeReceivedPicture() {
  const picture = received
  received = null
  return picture
}

// The size that fits within `longest` pixels on its longest side, never bigger
export function fitWithin(width: number, height: number, longest = LONGEST_SIDE) {
  const scale = Math.min(1, longest / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

// Shrinks the picture and saves it again as a JPEG (which leaves out its hidden
// details). The browser turns it the right way up while reading it.
export async function preparePicture(picture: Blob): Promise<PreparedPicture | PictureProblem> {
  if (picture.type && !picture.type.startsWith('image/')) return 'notAPicture'
  if (picture.size > MAX_BYTES) return 'tooBig'

  const original = URL.createObjectURL(picture)
  try {
    const image = new Image()
    image.src = original
    // e.g. a HEIC photo on a computer whose browser can't open them
    await image.decode().catch(() => null)
    if (!image.naturalWidth) return 'unreadable'

    const size = fitWithin(image.naturalWidth, image.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext('2d')
    if (!context) return 'unreadable'
    // A white background, for pictures with see-through parts
    context.fillStyle = '#fff'
    context.fillRect(0, 0, size.width, size.height)
    context.drawImage(image, 0, 0, size.width, size.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (!blob) return 'unreadable'
    return { blob, url: URL.createObjectURL(blob), ...size }
  } finally {
    URL.revokeObjectURL(original)
  }
}

export function forgetPicture(picture: PreparedPicture | null | undefined) {
  if (picture) URL.revokeObjectURL(picture.url)
}
