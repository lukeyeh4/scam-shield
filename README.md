# Scam Shield: Stop, Check, Tell

**Try it: [lukeyeh4.github.io/scam-shield](https://lukeyeh4.github.io/scam-shield/)** · [phone demo](https://lukeyeh4.github.io/scam-shield/demo.html) (the app in an iPhone frame, for showing on a computer)

An app that helps kids aged 8–12 spot scams, with two parts:

- **Check something:** when a text, link, picture or website feels weird, kids check it with Shield Buddy and see the clues in kid words, with what to do next.
- **Learn about scams:** a game where each scam looks like the real thing. Kids pick what to do, see what happens, then learn the clues.

![The home screen: Check something and Learn about scams](docs/screenshots/app-home.png)

**The key lesson:** don't do what the scam asks. Check it with Scam Shield, and show a grown-up.

| | | In kid words |
|---|---|---|
| **Stop** | Scammers want you to rush. Slow down. | "If it's in a hurry, I'm not." |
| **Check** | Look for clues that something is wrong. | "Does anything look weird?" |
| **Tell** | Show a trusted adult before doing anything. | "When in doubt, tell someone out loud." |

## Check something

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/check-ask-buddy.png" alt="Ask Shield Buddy: Buddy asks what to check, with A picture, A link, A message and I'm not sure"></td>
    <td width="50%"><img src="docs/screenshots/check-link-result.png" alt="A link result: This looks like a scam, with the clues Pretending to be Roblox and Words that tempt you"></td>
  </tr>
  <tr>
    <td>Shield Buddy asks what it is and opens the right checker. Kids can also type or say a question.</td>
    <td>The result: a risk level, what to do, and the clues. Tap a clue to see why.</td>
  </tr>
</table>

- **A link:** checked without ever opening it on the kid's device. The address itself is checked on the device (copies of brands like rob1ox, hidden addresses, short links, betting and adult websites). Then a small server adds Google Safe Browsing, Cloudflare's filters, how new the website is and where short links really go, and Claude reads the page with fixed yes/no questions.
- **A picture:** a screenshot or photo, plus up to two more of the same thing. Claude looks for warning signs from a fixed list (asking for a password, code, money or photos, free prizes, pretending to be someone, rushing, threats, and more) and the result draws numbered boxes around them.
- **A message:** a pasted text, chat, email or post. Phone numbers, emails, codes and addresses are blanked out on the device first, and the words that show each warning sign are highlighted.

Every result has a risk level, never "safe": red "This looks like a scam", yellow "Be careful", or green "No clues found". It always ends with showing a grown-up. Kids only ever read the app's own words; the AI just answers fixed questions. A threat, a request for photos or a stranger getting too personal gets a calm "Show a grown-up right now" with three simple steps.

## Learn about scams

![A scam text on an iPhone, with Shield Buddy and the three choices](docs/screenshots/game-scam-texts.png)

| Scam | Looks like | Teaches |
|---|---|---|
| **It's Mom, New Number** | iPhone text messages | Pick a family code word; never share a code sent to your phone |
| **Free Robux** | Google in Safari on an iPad | Never type your password on a site from an ad or a link |
| **Famous Giveaway** | A YouTube Short | Free prizes from strangers are a trick; even check marks can be faked |

Each scam plays the same way:

1. **The scam** appears on a realistic fake screen, and Shield Buddy explains what's happening without hinting. Kids choose *Do it*, *Check with Scam Shield* or *Tell an adult*.
2. **What happened:** Do it ends in "Uh oh"; Check and Tell stop the scam. "What if you had…" cards show the other choices.
3. **Spot the clues:** kids tap the red flags on the screen, with a *Hint* button.
4. **Stop, Check, Tell:** each red flag lights up while Buddy explains it, then one thing to do next time.

The Learn screen shows how many scams are done, lets kids pick any scam, and shows the badges they've earned. On computers the scams appear on a fake phone or iPad; on phones and tablets they fill the screen, as if you were in the app yourself.

## Shield Buddy

A friendly yellow shield who guides every scam and the checkers. It never hints before a choice, and it always sends kids to a real grown-up. Everything it says is written in the app, except its answers to questions kids type: those come from AI, only about scams and staying safe, are checked in code, and are always followed by a line pointing to a grown-up. **Read aloud** (off by default, in the top corner) reads Buddy's lines in its own voice.

## For grown-ups

Behind the gear on the home screen, past a parent gate (a grown-up PIN, or a sum that changes every time):

- **Checks:** nothing a child checks or asks is sent anywhere until a grown-up turns this on.
- **Shield Buddy:** whether Buddy answers typed questions, and whether the child can ask out loud.
- **Results:** "Name the type of unsafe website" (betting, adult, pirated streaming), or just say it isn't for kids.
- **History:** the child's recent checks, kept only on this device, never the pictures or messages.
- **Grown-up PIN** and **Family code word** advice.

Each home can check up to 40 pictures and 100 messages a day.

## Running it

```sh
npm install
npm run dev      # play it locally
npm run build    # type-check and build for hosting
npm run lint
npm test
```

React + TypeScript + Vite, hosted on GitHub Pages: every push to `main` rebuilds the site. The server in `worker/` is a Cloudflare Worker that checks links, pictures and messages, answers Buddy's questions and makes its voice; it keeps nothing it's sent. Run it with `npm install` and `npm run dev` there. Its keys are secrets: keep them in `worker/.dev.vars` (ignored by git) and on Cloudflare with `npx wrangler secret put`, never in a committed file, since this repo is public.

Each scam is a JSON file in `scenarios/` that fills in the same screens. `PROJECT.md` tracks what's next, and `CLAUDE.md` has the full details for working on the code.
