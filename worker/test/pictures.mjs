// Runs the made-up test pictures (test/pictures/*.jpg, made by make.mjs) through
// the picture check, to see what it catches, what it wrongly flags, and how well
// its boxes line up (real Claude calls, about a cent per picture on Sonnet). Start
// the Worker first, then:
//   npm run dev                                            (Sonnet, the default)
//   npx wrangler dev --var PICTURE_MODEL:claude-haiku-5-5   (to compare)
//   npm run test-pictures
// Prints what each picture got next to what it should get, and writes a page with
// the boxes drawn on the pictures.
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const SERVER = process.argv[2] ?? 'http://localhost:8787'

const EXPECT = {
  hiMumNewNumber: 'scam: pretends to be family, asks for gift cards, rushes you',
  freeRobuxGameChat: 'scam: free Robux, asks for password, rushes you; link rbx-free-robux.xyz/claim',
  appleCode: 'scam: pretends to be Apple, asks for login code, threatens (locked)',
  prizePopup: 'scam: free prize, asks for card details, rushes you',
  discordNitro: 'scam: free prize, rushes you; link dlscord-gifts.com/nitro',
  threat: 'threat or photos: asks for a photo, threatens, keep a secret',
  injection: 'scam (despite the note to the AI): free V-Bucks, asks for password; link epic-vbucks-gift.top',
  youtubeComment: 'scam: pretends to be MrBeast, free money, move to Telegram, rushes you',
  sympathyVideo: 'be careful or scam: sad story to buy, rushes you (only 15 left), link in bio',
  sympathyComment: 'be careful or scam: sad story to buy, move to another app/secret? (comment to get link), rushes you',
  sadNewsNoAsk: 'nothing: a sad story with nothing to buy',
  familyChat: 'nothing',
  friendGameChat: 'nothing',
  schoolEmail: 'nothing',
  libraryText: 'nothing (a link: townsvillelibrary.org)',
}

const started = Date.now()
const results = await Promise.all(
  Object.keys(EXPECT).map(async (name) => {
    const image = readFileSync(join(here, 'pictures', `${name}.jpg`)).toString('base64')
    const t = Date.now()
    const res = await fetch(`${SERVER}/picture`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:5173' },
      body: JSON.stringify({ image }),
    })
    const facts = res.ok ? await res.json() : { error: `${res.status} ${await res.text()}` }
    return { name, image, facts, seconds: (Date.now() - t) / 1000 }
  }),
)

for (const { name, facts, seconds } of results) {
  console.log(`\n${name}  (${seconds.toFixed(1)}s)\n  expect: ${EXPECT[name]}`)
  if (facts.error) {
    console.log(`  ERROR ${facts.error}`)
    continue
  }
  const signs = facts.signs.map((s) => `${s.sign} ("${s.words.slice(0, 50)}")`)
  console.log(`  got:    ${facts.kind}${facts.readable ? '' : ', NOT READABLE'}${facts.threatOrPhotos ? ', THREAT OR PHOTOS' : ''}`)
  for (const s of signs) console.log(`          - ${s}`)
  if (facts.links.length) console.log(`          links: ${facts.links.map((l) => l.address).join(', ')}`)
}
console.log(`\nAll done in ${((Date.now() - started) / 1000).toFixed(1)}s`)

// A page with each picture and its boxes, numbered like the result screen
const report = join(tmpdir(), 'scam-shield-pictures.html')
writeFileSync(
  report,
  `<!doctype html><meta charset="utf-8"><title>Picture check</title><style>
body { font: 14px system-ui; display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; background: #eee }
figure { margin: 0; width: 300px } .pic { position: relative } img { width: 100%; display: block }
.box { position: absolute; border: 3px solid #f5b700; background: #ffe06633; border-radius: 4px }
.box span { position: absolute; top: -12px; left: -12px; background: #222; color: #fff; border-radius: 50%; width: 22px; height: 22px; display: grid; place-items: center; font-weight: 700 }
figcaption { padding: 6px 0 } ol { margin: 4px 0; padding-left: 20px }
</style>${results
    .map(
      ({ name, image, facts }) => `<figure><div class="pic"><img src="data:image/jpeg;base64,${image}">${(facts.signs ?? [])
        .map(
          (s, i) =>
            `<div class="box" style="left:${s.box.left / 10}%;top:${s.box.top / 10}%;width:${(s.box.right - s.box.left) / 10}%;height:${(s.box.bottom - s.box.top) / 10}%"><span>${i + 1}</span></div>`,
        )
        .join('')}</div><figcaption><b>${name}</b><ol>${(facts.signs ?? []).map((s) => `<li>${s.sign}</li>`).join('')}</ol></figcaption></figure>`,
    )
    .join('')}`,
)
console.log(`Boxes drawn on the pictures: ${report}`)
