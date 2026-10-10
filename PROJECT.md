# Scam Shield: Next Steps

What's done, what's next, and what's still undecided. The design itself lives in `README.md`.

## Where things stand

- [x] Design spec, Shield Buddy design and tech stack (`README.md`)
- [x] Shield Buddy artwork: six moods in `shield_buddy/`
- [x] React + TypeScript + Vite project set up
- [x] All 5 scenarios written. Only scenarios 1–3 are in the game for now; 4 and 5 are set aside in `scenarios/later/` until their fake screens are built.
- [x] Main menu, and the full flow for each scenario: the scam, the choice, What happened, and Stop, Check, Tell (wireframe style)
- [x] Commit the work on branch `try/result-screens` and merge it into `main`

## New direction: Scam Shield as a toolkit

The game becomes the **tutorial** for a bigger Scam Shield app: a set of tools kids can use when something looks wrong in real life. The scenarios teach the habit; the tools are where kids practise it for real. Nothing below is built yet.

**Tutorial changes**

- [ ] Change the three choices to **Do it**, **Check with Scam Shield** and **Tell an adult**. Do it still goes wrong (red); Check and Tell both work (green). Ignore it goes away.
- [ ] Check with Scam Shield opens a tutorial version of the matching tool (e.g. a link checker for the Robux site), with the scenario's scam already filled in, so the kid learns to use the tool for real
- [ ] Rework the outcome screen, "What if you had…" cards and badges for the new choices (Good Call would cover Check as well as Tell)
- [ ] Update the content rules in `CLAUDE.md` and the key lesson in `README.md`: the old lesson was "Ignore keeps you safe once, but Tell stops the scam"
- [ ] After the tutorial, the main menu leads to the toolkit; the tutorial can be replayed any time

**Decided**

- **AI-powered tools.** The checkers use an AI model, so they can handle real messages, links, QR codes and screenshots, not just fixed rules.
- **Results look like the recap.** A tool shows the thing being checked with the suspicious parts highlighted, each with a short kid-friendly reason, plus an overall risk level, just like the Stop, Check, Tell screen highlights red flags.
- **Super accessible.** Big buttons, large text, simple words, read-aloud, works with screen readers (VoiceOver, TalkBack) and switch control, high contrast, and respects reduced motion.
- **Check and Tell together.** Both are good choices; the exact message (e.g. "Check, then show a grown-up") is still to work out.
- **Parent setup, kid use.** A grown-up sets the app up once (e.g. who the kid's trusted adults are, a family code word); after that the kid can open it and check something on their own, any time.
- **An app.** Build it as a website first, then turn it into a phone and tablet app (see "Turning it into an app" below).
- **First tool: the link checker.**

**Tools (in order)**

- [ ] **Link checker** (first): paste a web address; it spots lookalike names (`rob1ox`), odd endings and shortened links, highlights each one in the address, and gives a risk level
- [ ] **QR code scanner:** scan a code with the camera, show where it really goes, then run it through the link checker before anything opens
- [ ] **Message checker:** paste a text, email or DM; the AI highlights the red flags in it (rushing you, a prize, asking for a code, password, gift card or money, a new number) and explains each one
- [ ] **Screenshot checker ("scam recogniser"):** take or pick a screenshot of anything (a game chat, an ad, a pop-up); the AI marks the suspicious areas on the image with a risk level
- [ ] **"Is this real?" questions:** a short tap-through checklist for when there's nothing to scan (Is someone rushing me? Do they want money, a code or a password? Did I expect this?)
- [ ] **Tell an adult helper:** send what was checked, with the highlights, to a trusted adult set up by the parent, or show the kid what to say ("I got this and I'm not sure")
- [ ] **Family code word:** set up a secret word with a grown-up (the tip from scenario 1)
- [ ] **Scam library:** short cards on common scams kids meet (free Robux, fake giveaways, "new number" texts, account locked)

**Ideas for how the AI fits in**

- The AI returns the exact pieces of text to highlight (and, for screenshots, boxes on the image) with a reason for each, the same idea as the recap's `target` and `highlight`, so the result screen can reuse the recap's highlighting.
- The AI's reasons must follow the content rules: simple words, not scary, no shame. Test it on many real and fake examples (including the tutorial scenarios) before kids use it.
- The AI can be wrong. Never say "This is safe"; say something like "I didn't spot any clues, but show a grown-up if you're not sure."
- Keep the AI behind our own small server; the app never holds the AI key.

**Turning it into an app**

- Plan: keep building a website, then wrap the same code as an iOS and Android app with a tool like Capacitor. Most of the code stays the same.
- What only works in a real app: a share button from Messages, Safari or games straight into Scam Shield, and reliable camera access for QR codes.
- App store accounts cost money (Apple about $99 a year, Google $25 once), and apps for kids have extra store rules (no ads or tracking, a parent gate before outside links or purchases).

**Still to decide**

- [ ] Which AI model and where the server runs; cost per check, and limits so it can't be overused
- [ ] Privacy: kids will scan real messages with names and numbers. What's sent, whether anything is stored, and parent consent (children's privacy laws such as COPPA)
- [ ] How Check and Tell fit together in the tutorial and in every tool result
- [ ] What Shield Buddy says in the tools: today every Buddy line is scripted. Either Buddy only says scripted lines around the AI's result, or the rule changes
- [ ] What the parent setup includes, and whether parents get alerts or a history of checks

## 1. The game

- [x] The scam plays in on a realistic fake screen, then Shield Buddy explains what's happening and lists the choices in simple words, with no hints
- [x] The choices slide up once Buddy has finished talking
- [x] Optional "Do it" step (`doIt`): shows where the scam leads first. Scenario 2 opens a fake Roblox prize site on the iPad; scenario 3 a fake MrBeast gift card site on the phone.
- [x] **What happened**: Buddy explains the result, then "What if you had…" cards show the other two choices, worded for each scenario (`whatIf`)
- [x] **Stop, Check, Tell**: a 3-step progress bar; each step highlights a red flag on the fake screen (or the Do it screen) while Buddy explains it; each step only highlights its own clues
- [x] Every scenario ends Tell with what you can do next time (`tip`, e.g. a family code word), then a summary card: what you can do, and "Make sure to avoid" (`summary`)
- [x] "Next scenario" (or "Finish" after the last one); "Menu" is always in the header
- [x] **Spot the clues** (`SpotScreen`, between What happened and the recap): the player taps about 3 easy clues from a checklist (recap items with a `spot` name); Buddy answers every tap kindly; the Hint button nudges towards the next clue (Buddy's `spotHint` and a soft glow where to look, then its exact words), and the recap still covers every clue
- [x] Shield Buddy moves to match its mood with each new message (a hop, a wobble, a spin…), bobs while talking and floats when quiet; all bubbles stay, fading out at the top, and can be scrolled back to
- [x] **Badges** (`src/badges.ts`, saved on the device): Clue Finder, Good Call, Super Spotter and Scam Shield, each with a "New badge!" notification when earned, and all shown on the end screen (grey until earned, with how to earn them)
- [x] End screen after the last scenario (`EndScreen`): Buddy cheers, Stop, Check, Tell in kid words, "What you can do" from each scenario's summary, then Play again or Menu (wireframe style)
- [ ] End screen: decide whether it becomes a certificate (e.g. with the player's name), and give it the real look
- [ ] Remember how far the player got, so Start can pick up where they left off (the menu no longer lists the scenarios)
- [ ] Bring back scenarios 4 and 5: style their fake screens, move their files from `scenarios/later/` back into `scenarios/`, decide whether they get a "Do it" step (e.g. the shopping site in scenario 5, or a fake login page in scenario 4), and play them through

## Potential simplifications

Ideas to make the game shorter or gentler, to try after kids have played it.

- [ ] Remove the "What if you had…" cards from the What happened screen, if it feels like too much reading. Only do this if the difference between Ignore and Tell is still taught somewhere (it's the main lesson).
- [ ] Add a "Try again" button so kids who pick Do it or Ignore it can go back and choose again, so a wrong pick doesn't feel like a punishment. For now, the end of each scenario only offers "Next scenario".

## 2. Fake screens

Done: iPhone text messages with a notification banner (scenario 1), Google search results in Safari on an iPad and a fake prize site (scenario 2), YouTube Shorts and a fake gift card site in Safari on a phone (scenario 3).

- [ ] Style the email screen (scenario 4) and the shopping website (scenario 5)
- [ ] The messaging-app and Discord-style fake screens (`MessengerMockup`, `ChatAppMockup`) are no longer used by any scenario: reuse them or remove them
- [ ] Make sure none of them contain real links or buttons that do something

## 3. Visual design

Replace the grey wireframe with the real look.

- [ ] Bright, friendly style with big buttons and large text (see "Look and feel" in `README.md`)
- [ ] Colours for the outcomes and the Stop, Check, Tell steps (the wireframe has soft placeholder tints)
- [ ] In the recap the phone is a little smaller, so the notification's phone number gets cut off on tablets
- [ ] Shrink large images: Buddy's (each a 1000×1000 PNG of about 360 KB) and `public/images/robux-avatar.png` (about 520 KB), all shown much smaller

## 4. Tests and checks

Run them with `npm test`.

- [x] Add a `test` script to `package.json`
- [x] Test that every scenario file is valid, including those in `scenarios/later/` (`src/scenarios.test.ts`): every recap `target` is a real part of its screen, every `highlight` appears exactly in that part's text, and each choice has its usual result
- [x] Test the red-flag highlighting helper (`src/highlight.ts`)
- [x] Add the test command to `CLAUDE.md` and the "Getting started" section of `README.md`
- [ ] Run the tests in the deploy workflow too, so a broken scenario never goes live

## 5. Content review

- [ ] Project owner reviews all scenario text: reading level (simple words), tone (realistic but not scary), no shaming
- [ ] Check the realistic details against the real thing: Apple's verification text (scenario 1), Google results for "free robux" (scenario 2)

## 6. Put it online

- [ ] **Remove the dev console** (see below) before shipping
- [x] Hosted on GitHub Pages at https://lukeyeh4.github.io/scam-shield/ (the repo is public). Every push to `main` redeploys it (`.github/workflows/deploy.yml`). Vite's `base` is `/scam-shield/`, and scenario image paths get it added in `src/scenarios.ts`.

## Later

- [ ] Spot the clues: on narrow phones the checklist takes a lot of room under the iPad screen
- [ ] Read-aloud audio for Shield Buddy's lines
- [ ] More scenarios

## Still to decide

- [ ] Real brands and people: scenarios 1–3 now show Apple, Google, Roblox, Microsoft, YouTube and MrBeast (including his photo and a real scam web address) so they look like what kids actually see. Keep them, or switch to made-up names? Scenarios 4–5 still use made-up names.
- [x] `mrbeast.webp`: kept as the original in `source-images/` (the game uses the cropped `public/images/mrbeast-video.jpg`)
- [ ] Should the end screen become a certificate?

## Dev console (remove before shipping)

A testing panel that only appears with `npm run dev`. Click "Dev" in the bottom-right corner, or press the `` ` `` key. It can:

- Turn on **fast mode**: Buddy's text appears at once and nothing waits, so you don't have to sit through each conversation. It stays on after a reload.
- Jump to the menu, the end screen, or any scenario at any stage (the scam, the Do it page, the outcome for a chosen answer, the recap, or the summary card).

It's left out of `npm run build`, but remove it before shipping anyway. Everything is marked `DEV CONSOLE`:

- [ ] Delete the `src/dev/` folder
- [ ] `src/App.tsx`: remove the `DevConsole` import, `DevJump`, `run` and `jump`, and the `key={run}` parts
- [ ] `src/motion.ts`: remove `isFast()`
- [ ] `src/buddy/Buddy.tsx`: remove `isFast()` from the wait between messages
- [ ] `src/screens/ScenarioScreen.tsx`: remove `ScenarioStart` and the `start` prop
- [ ] `src/screens/RecapScreen.tsx`: remove the `startAtSummary` prop
- [ ] `src/badges.ts`: remove `resetBadges`
- [ ] Remove this section and the dev console note in `CLAUDE.md`
