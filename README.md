# Scam Shield: Stop, Check, Tell

**Play it: [lukeyeh4.github.io/scam-shield](https://lukeyeh4.github.io/scam-shield/)**

A game that teaches kids aged 8–12 to spot scams. Each scam looks like the real thing: a text from "Mom", a Google search, a YouTube Short. The kid picks what to do, sees what happens, then learns the clues with **Stop, Check, Tell**.

![A scam text on an iPhone, with Shield Buddy and the three choices](docs/screenshots/scam-texts.png)

## Stop, Check, Tell

| | | In kid words |
|---|---|---|
| **Stop** | Scammers want you to rush. Slow down. | "If it's in a hurry, I'm not." |
| **Check** | Look for clues that something is wrong. | "Does anything look weird?" |
| **Tell** | Show a trusted adult before doing anything. | "When in doubt, tell someone out loud." |

## How it plays

Every scam follows the same steps, so kids always know what's coming.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/scam-search.png" alt="Google search results with a fake sponsored ad"></td>
    <td width="50%"><img src="docs/screenshots/outcome.png" alt="The outcome screen after choosing Ignore it"></td>
  </tr>
  <tr>
    <td><b>1. The scam.</b> A realistic fake screen with red flags planted in it. Shield Buddy explains what's happening, without hinting. Then: <i>Do it</i>, <i>Ignore it</i> or <i>Tell an adult</i>.</td>
    <td><b>2. What happened.</b> Do it is red ("Uh oh"), Ignore is yellow ("Safe… for now"), Tell is green ("Scam stopped!"). "What if you had…" cards show the other two paths.</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/spot-the-clues.png" alt="Spot the clues: a checklist of three clues and a Hint button"></td>
    <td><img src="docs/screenshots/recap.png" alt="The recap highlighting a red flag on the phone"></td>
  </tr>
  <tr>
    <td><b>3. Spot the clues.</b> Kids tap the red flags from a short checklist. Buddy answers every tap kindly, and the <i>Hint</i> button nudges toward the next clue.</td>
    <td><b>4. Stop, Check, Tell.</b> The scam comes back and each red flag lights up while Buddy explains it, then what to do next time (like a family code word).</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/summary.png" alt="The summary card: Remember, and Make sure to avoid"></td>
    <td><img src="docs/screenshots/end-screen.png" alt="The end screen with badges"></td>
  </tr>
  <tr>
    <td><b>5. Remember.</b> One thing to do next time, and what to avoid.</td>
    <td><b>6. The end.</b> Badges earned along the way, and a tip from every scam.</td>
  </tr>
</table>

**The key lesson:** ignoring keeps *you* safe once, but telling an adult stops the scam.

## The scams

| | Scam | Looks like | Teaches |
|---|---|---|---|
| 1 | **It's Mom, New Number** | iPhone text messages | Pick a family code word; never share a code sent to your phone |
| 2 | **Free Robux** | Google in Safari on an iPad | Never type your password on a site from an ad or a link |
| 3 | **Famous Giveaway** | A YouTube Short | Free prizes from strangers are a trick; even check marks can be faked |
| 4 | Account Locked! *(coming later)* | Email inbox | |
| 5 | Mega Deal *(coming later)* | Shopping site pop-up | |

<img src="docs/screenshots/scam-shorts.png" alt="A fake giveaway on YouTube Shorts" width="50%">

*The screenshots show an earlier look (grey colours and the old robot Buddy); the game now uses the cream look below.*

## Shield Buddy

A friendly yellow shield with a face and little hands, who guides each scam in short speech bubbles. It has six moods (`happy`, `curious`, `thinking`, `worried`, `cheering`, `neutral`) and a little move for each.

- **No hints before the choice.** Kids find the clues themselves.
- **Not a trusted adult.** It always sends kids to a real grown-up.
- **Every line is scripted** in the scenario files. Nothing is generated.
- **Read aloud:** a "Read aloud" switch in the top corner (off by default) has the device's own voice read Buddy's lines; each bubble waits until the voice has finished.
- **A conversation that carries on:** in Ask Shield Buddy, leaving to check something and coming back continues the same chat. Buddy greets once, then reacts to what the check found, in a different way each time.

## Check a link

Kids paste a link (or a whole message with a link in it) and see whether it looks like a scam, with each clue marked in the link and explained in kid words: what the trick is, and what the real website looks like. Results are soft red ("This looks like a scam"), yellow ("Be careful") or green ("No clues found", with good signs). It never says "safe", and always ends with "show a grown-up".

It checks in three layers, and never opens the link on the kid's device:

1. **The address, on the device (instant):** the real website is found with the Public Suffix List; then it looks for brand copies (rob1ox, ronlox, letters from other alphabets, roblox.com.evil.net), a real address hidden after an @ or in the path, free website makers, short links, cheap endings, tempting words and http. Fan websites of games get a gentler clue than copies of accounts and money services like PayPal.
2. **Facts from our small server** (a Cloudflare Worker): Google Safe Browsing, how new the website is, whether it exists, and where a short link really goes (that address gets every check too).
3. **Claude reads the page** (Claude Haiku 5.5), only when nothing strong was found: fixed yes/no questions, like "Does it copy a brand?", "Does it ask for a password?", "Free prizes?", "Free paid sports or shows?", "Pop-up ads?". The AI never writes what kids read and can't say a website is fine.

Tested against 140 real websites (no false alarms) and 40 live phishing links (39 caught or flagged).

## Look and feel

Warm and friendly, so it feels safe to use:

- **Cream colours:** a warm cream background with soft peach and yellow glows, off-white cards with big rounded corners and gentle shadows, dark brown text, and orange buttons. Icon tiles use warm tones that sit close together (orange, peach, gold, amber), so nothing clashes.
- **One rounded font:** Nunito, friendly but very easy to read.
- **Big, calm screens:** few boxes and few words, one main button, simple line icons.
- **Fake screens stay real:** the scam screens keep the real phone colours and font, so they look like what kids actually see.

## Design rules

- **Simple words:** about an 8-year-old reading level, one idea per screen, big buttons.
- **Realistic, not scary:** consequences feel real but never graphic.
- **No shame:** "Here's what to watch for next time," never "You failed."
- **Real-looking, but harmless:** fake screens copy real apps, but nothing on them is a working link, button or form.
- **No emojis in the game's own buttons and labels.** They only appear inside the fake screens.

## Getting started

```sh
npm install
npm run dev      # play it locally
npm run build    # type-check and build static files for hosting
npm run lint
npm test         # check every scenario file, the red-flag highlighting, the link checker and the chat script
```

The link checker's server is in `worker/` (`npm install`, then `npm run dev` or `npm run deploy` there). Its keys (Google Safe Browsing, Claude) are secrets: locally in `worker/.dev.vars`, which git ignores, and on Cloudflare with `npx wrangler secret put`. Never put them in a committed file; this repo is public.

While running `npm run dev`, a **Dev** button in the corner jumps to any screen, has a fast mode that skips Buddy's typing, and lets you try other colour palettes and fonts. It's left out of the build and must be removed before shipping (see `PROJECT.md`).

## How it's built

React + TypeScript + Vite, as a web app for tablets. Every push to `main` rebuilds the game and puts it on GitHub Pages (`.github/workflows/deploy.yml`). The link checker's server is a Cloudflare Worker at scam-shield-links.lukeyeh4.workers.dev (its address is in `.env.production`); it keeps nothing it's sent, and allows 20 checks a minute per person.

The game is **data-driven**: every scam uses the same screens, and each one is just a JSON file in `scenarios/` (format: `Scenario` in `src/types.ts`). A scenario picks a fake screen (`sms`, `search`, `shorts`, …), fills in its content, and lists Buddy's lines, the outcomes, and the red flags for the recap and Spot the clues.

```
scenarios/        one JSON file per scam (later/ holds scams 4 and 5)
shield_buddy/     Buddy's artwork, one image per mood
public/images/    logos and photos on the fake screens
src/screens/      menu, scam, outcome, Spot the clues, recap, end screen
src/mockups/      fake iPhone and iPad screens: texts, Safari, Google, YouTube Shorts
src/buddy/        Shield Buddy and its speech bubbles
src/badges.ts     badges, saved on the device
src/chat/         Ask Shield Buddy: the chat, its script, and the conversation so far
src/tools/        the checkers: linkCheck.ts (the address), brands.ts (official websites),
                  linkLookup.ts (the server's facts as clues), the result screen
src/readAloud.ts  read-aloud with the device's voice
worker/           the link checker's server: lookups, and Claude reading pages
```

`PROJECT.md` tracks what's next. `CLAUDE.md` has the full details for working on the code.

## Open questions

- Keep real brands and people (Apple, Google, Roblox, YouTube, MrBeast) in scams 1–3, or switch to made-up names?
- Read-aloud: Buddy now has one voice everywhere (Google Cloud Text-to-Speech, with the device's voice as a backup). Which voice suits Buddy best? Where should the switch go (it covers the home screen's gear on phones)?
- Add VirusTotal (about 90 security companies' verdicts) to catch sites like vmsvedaweb.com that web filters block but Google doesn't list?
