# Scam Shield: Next Steps

What's done, what's next, and what's still undecided. The design itself lives in `README.md`.

## Where things stand

- [x] Design spec, Shield Buddy design and tech stack (`README.md`)
- [x] Shield Buddy artwork: six moods in `shield_buddy/`
- [x] React + TypeScript + Vite project set up
- [x] All 5 scenarios written in `scenarios/`, including Buddy's lines and the red flags to highlight
- [x] Fake-screen components for text messages, game chat, a messaging app, email and a shopping website (`src/mockups/`)
- [x] Wireframe: main menu, plus a scenario screen with the text-message screen, three choice buttons and Buddy in the corner

## 1. Make the game playable

Get one scenario working all the way through, using the wireframe style.

- [ ] Make the three choice buttons work (screen 2)
- [ ] **What happened** (screen 3): Buddy reacts to the choice, all three outcomes are shown, and the player's pick is highlighted
- [ ] **Stop, Check, Tell recap** (screen 4): step through STOP, each CHECK flag, then TELL, highlighting each red flag on the scam screen as Buddy explains it. Highlighting is already supported in `src/mockups/Field.tsx` and just needs connecting to the screens.
- [ ] Screen 1 vs. screen 2: show the scam on its own first (with Buddy's intro), then the choices. The wireframe currently puts them on one screen.
- [ ] At the end of a scenario: "Next scenario" and "Back to menu"
- [ ] Remember finished scenarios and show ✅ on the menu
- [ ] Check all 5 scenarios play through correctly

## 2. Fake screens

- [ ] Add styles for the game chat, messaging app, email and shopping website screens. Only the text-message screen has wireframe styles so far.
- [ ] Make sure none of them contain real links or buttons that do something

## 3. Visual design

Replace the grey wireframe with the real look.

- [ ] Bright, friendly style with big buttons and large text (see "Look and feel" in `README.md`)
- [ ] Make each fake screen look realistic
- [ ] Colours for the outcomes (🔴 🟡 🟢) and the Stop, Check, Tell steps
- [ ] Fix Shield Buddy's speech bubble overlapping the fake phone on tablets
- [ ] Check the layout at a real phone width (390px). Only tablet width and 500px have been checked so far.
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
