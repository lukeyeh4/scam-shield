import { type Place, PLACES } from './pictureLookup'

type PlacePickerProps = {
  place: Place | null
  onPlace: (place: Place | null) => void
  typed: string
  onTyped: (typed: string) => void
  // What was typed has personal details, so it won't be sent (contextFor)
  personal: boolean
}

// "Where is it from? You can skip this.": chips to tap (one at a time), and a
// short box for "Something else". Used by the picture and message checkers.
export function PlacePicker({ place, onPlace, typed, onTyped, personal }: PlacePickerProps) {
  return (
    <fieldset className="picture-place">
      <legend>Where is it from? You can skip this.</legend>
      <div className="picture-place-options">
        {PLACES.map((p) => (
          <button key={p} className="chip" type="button" aria-pressed={place === p} onClick={() => onPlace(place === p ? null : p)}>
            {p}
          </button>
        ))}
      </div>
      {place === 'Something else' && (
        <>
          <label className="sr-only" htmlFor="place-note">
            Tell me about it
          </label>
          <input
            id="place-note"
            className="tool-input picture-note"
            type="text"
            maxLength={200}
            placeholder="Tell me about it"
            value={typed}
            onChange={(e) => onTyped(e.target.value)}
          />
          {personal && (
            <p className="tool-problem" role="alert">
              Keep names, addresses and numbers private. I won't send what you typed.
            </p>
          )}
        </>
      )}
    </fieldset>
  )
}
