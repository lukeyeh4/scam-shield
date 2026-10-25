// Letters that only look like ours. A web address can use letters from any
// alphabet; the browser stores them as "xn--..." (Punycode). Scammers use letters
// that look the same as ours (a Cyrillic "о" in rоblox.com) to copy real websites.
// Everything here works on the address alone, on the device.

// Turns one "xn--" part of an address back into the letters it shows (RFC 3492)
export function decodePunycode(label: string): string {
  if (!label.startsWith('xn--')) return label
  const input = label.slice(4)
  const base = 36
  const tMin = 1
  const tMax = 26
  const adapt = (delta: number, points: number, first: boolean) => {
    delta = first ? Math.floor(delta / 700) : delta >> 1
    delta += Math.floor(delta / points)
    let k = 0
    while (delta > ((base - tMin) * tMax) >> 1) {
      delta = Math.floor(delta / (base - tMin))
      k += base
    }
    return k + Math.floor(((base - tMin + 1) * delta) / (delta + 38))
  }
  const dash = input.lastIndexOf('-')
  const output = dash > 0 ? [...input.slice(0, dash)].map((c) => c.codePointAt(0)!) : []
  let n = 128
  let i = 0
  let bias = 72
  for (let at = dash > 0 ? dash + 1 : 0; at < input.length; ) {
    const oldI = i
    let w = 1
    for (let k = base; ; k += base) {
      if (at >= input.length) return label
      const c = input.charCodeAt(at++)
      const digit = c >= 48 && c <= 57 ? c - 22 : c >= 65 && c <= 90 ? c - 65 : c >= 97 && c <= 122 ? c - 97 : base
      if (digit >= base) return label
      i += digit * w
      const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias
      if (digit < t) break
      w *= base - t
    }
    const length = output.length + 1
    bias = adapt(i - oldI, length, oldI === 0)
    n += Math.floor(i / length)
    i %= length
    output.splice(i++, 0, n)
  }
  return String.fromCodePoint(...output)
}

// Letters from other alphabets (and Latin letters with marks) that look like ours
const CONFUSABLES: Record<string, string> = {
  // Cyrillic
  а: 'a', е: 'e', ё: 'e', о: 'o', р: 'p', с: 'c', у: 'y', х: 'x', ѕ: 's', і: 'i', ї: 'i', ј: 'j', ԁ: 'd', ӏ: 'l',
  һ: 'h', ԛ: 'q', ԝ: 'w', к: 'k', м: 'm', п: 'n', г: 'r', в: 'b', т: 't',
  // Greek
  α: 'a', ο: 'o', ν: 'v', ρ: 'p', ι: 'i', κ: 'k', υ: 'u', χ: 'x', ε: 'e', τ: 't', β: 'b', η: 'n',
  // Latin that isn't plain a to z
  ı: 'i', ł: 'l', ø: 'o', ɑ: 'a', ɡ: 'g', ß: 'b', đ: 'd', ħ: 'h',
}

// What a name looks like, written in plain a to z: rоblox (Cyrillic о) → roblox,
// röblox → roblox. Letters with no lookalike are kept as they are.
export function skeleton(text: string): string {
  return [...text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')].map((c) => CONFUSABLES[c] ?? c).join('')
}

// Mixes our alphabet with one whose letters look like ours (Cyrillic or Greek) in
// one part of the name, which real websites don't do
export function mixesAlphabets(label: string): boolean {
  const latin = /[a-z]/i.test(label)
  return latin && /[Ͱ-ϿЀ-ӿԀ-ԯ]/.test(label)
}

// Characters that look like letters: rob1ox, g00gle, paypa1
const LOOKALIKES: [RegExp, string][] = [
  [/0/g, 'o'], [/1/g, 'l'], [/i/g, 'l'], [/3/g, 'e'], [/4/g, 'a'], [/5/g, 's'], [/7/g, 't'], [/rn/g, 'm'], [/vv/g, 'w'],
]
export const plain = (word: string) => LOOKALIKES.reduce((w, [from, to]) => w.replace(from, to), word)

// One letter added, missing, changed or swapped: robloxx, robox, ronlox, rbolox
export function oneSlip(a: string, b: string) {
  if (a === b) return false
  if (Math.abs(a.length - b.length) > 1) return false
  if (a.length === b.length) {
    const diff = [...a].flatMap((c, i) => (c === b[i] ? [] : [i]))
    if (diff.length === 1) return true
    return diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]]
  }
  const [long, short] = a.length > b.length ? [a, b] : [b, a]
  for (let i = 0; i < long.length; i++) {
    if (long.slice(0, i) + long.slice(i + 1) === short) return true
  }
  return false
}
