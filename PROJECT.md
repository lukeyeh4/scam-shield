# Scam Shield: Next Steps

What's done, what's next, and what's still undecided. The design itself lives in `README.md`.

## Where things stand

- [x] Design spec, Shield Buddy design and tech stack (`README.md`)
- [x] Shield Buddy artwork: six moods in `shield_buddy/`
- [x] React + TypeScript + Vite project set up
- [x] All 5 scenarios written. Only scenarios 1–3 are in the game for now; 4 and 5 are set aside in `scenarios/later/` until their fake screens are built.
- [x] Main menu, and the full flow for each scenario: the scam, the choice, What happened, and Stop, Check, Tell (wireframe style)
- [x] Commit the work on branch `try/result-screens` and merge it into `main`

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

Vitest is installed, but there's no test script or tests yet.

- [ ] Add a `test` script to `package.json`
- [ ] Test that every scenario file is valid: every recap `target` is a real content field, and every `highlight` appears exactly in that field's text
- [ ] Test the red-flag highlighting helper (`src/highlight.ts`)
- [ ] Add the test command to `CLAUDE.md` and the "Getting started" section of `README.md`

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
