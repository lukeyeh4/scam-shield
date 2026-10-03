# Scam Shield: Next Steps

What's done, what's next, and what's still undecided. The design itself lives in `README.md`.

## Where things stand

- [x] Design spec, Shield Buddy design and tech stack (`README.md`)
- [x] Shield Buddy artwork: six moods in `shield_buddy/`
- [x] React + TypeScript + Vite project set up
- [x] All 5 scenarios written in `scenarios/`, including Buddy's lines and the red flags to highlight
- [x] Fake-screen components for text messages, game chat, a messaging app, email and a shopping website (`src/mockups/`)
- [x] Wireframe: main menu, plus a scenario screen with the text-message screen, three choice buttons and Buddy in the corner
- [x] iPhone-style text-message screen: texts arrive one by one with typing dots, plus a notification banner
- [x] Shield Buddy speaks in typed-out chat bubbles; the choices slide up once it has finished

## 1. Make the game playable

Get one scenario working all the way through, using the wireframe style.

- [x] Make the three choice buttons work (screen 2)
- [x] **What happened** (screen 3, wireframe, on branch `try/result-screens`): Buddy explains the result of the player's choice, then "What if you had…" cards show the other two
- [x] **Stop, Check, Tell recap** (screen 4, wireframe, on branch `try/result-screens`): a 3-step progress bar; each step highlights a red flag on the scam screen while Buddy explains it, with Back and Next buttons
- [x] Screen 1 vs. screen 2: the scam plays on its own first, then the choices slide up
- [x] At the end of a scenario: "Next scenario" (or "Finish" after the last one); "Menu" is always in the header
- [ ] Decide whether to keep the two result screens (merge `try/result-screens` into `main`, or drop it)
- [ ] Remember finished scenarios and show ✅ on the menu
- [ ] Check all 5 scenarios play through correctly

## Potential simplifications

Ideas to make the game shorter or gentler, to try after kids have played it.

- [ ] Remove the "What if you had…" cards from the What happened screen, if it feels like too much reading. Only do this if the difference between Ignore and Tell is still taught somewhere (it's the main lesson).
- [ ] Add a "Try again" button so kids who pick Do it or Ignore it can go back and choose again, so a wrong pick doesn't feel like a punishment. For now, the end of each scenario only offers "Next scenario".

## 2. Fake screens

- [ ] Add styles for the game chat, messaging app, email and shopping website screens. Only the text-message screen has wireframe styles so far.
- [ ] Make sure none of them contain real links or buttons that do something

## 3. Visual design

Replace the grey wireframe with the real look.

- [ ] Bright, friendly style with big buttons and large text (see "Look and feel" in `README.md`)
- [ ] Make each fake screen look realistic
- [ ] Colours for the outcomes and the Stop, Check, Tell steps (the wireframe has soft placeholder tints)
- [ ] In the recap the phone is a little smaller, so the notification's phone number gets cut off on tablets
- [ ] Shrink Buddy's images. Each is a 1000×1000 PNG of about 360 KB, much bigger than they're shown.

## 4. Tests and checks

Vitest is installed, but there's no test script or tests yet.

- [ ] Add a `test` script to `package.json`
- [ ] Test that every scenario file is valid: every recap `target` is a real content field, and every `highlight` appears exactly in that field's text
- [ ] Test the red-flag highlighting helper (`src/highlight.ts`)
- [ ] Add the dev, build, lint and test commands to `CLAUDE.md` and the "Getting started" section of `README.md`

## 5. Content review

- [ ] Project owner reviews all scenario text: reading level, tone (realistic but not scary), no shaming
- [ ] Confirm every name, brand and web address is made up

## 6. Put it online

- [ ] Host it on GitHub Pages (or similar). This needs Vite's `base` setting to match the repo name.

## Later

- [ ] "Spot the clues" mini-game: tap the red flags before the recap. It can reuse the recap targets.
- [ ] Read-aloud audio for Shield Buddy's lines
- [ ] More scenarios

## Still to decide

- [ ] Should there be an end screen or certificate after all 5 scenarios?
