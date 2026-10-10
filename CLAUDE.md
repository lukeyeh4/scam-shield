# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Scam Shield: Stop, Check, Tell" is a game that teaches kids aged 8–12 to spot scams. It's a React + TypeScript + Vite web app that works on tablets and is hosted as static files. `README.md` is the design spec and `PROJECT.md` tracks next steps. Read both before building anything.

## Commands

- Install: `npm install`
- Run: `npm run dev`
- Build (type-checks first): `npm run build`
- Lint: `npm run lint` (oxlint)
- Tests: `npm test` (Vitest). `src/scenarios.test.ts` checks every scenario file; its list of target names per fake screen mirrors the `<Field name=...>` and `useMark` names in `src/mockups/`, so update it when you add or rename one

## Architecture

The game is data-driven. Every scenario uses the same screens, and scenarios differ only in their data in `scenarios/NN-<slug>.json` (loaded in filename order by `src/scenarios.ts`; the format is `Scenario` in `src/types.ts`). Scenarios 4–5 are set aside in `scenarios/later/`, which isn't loaded.

**Flow** (`src/screens/`):
1. `MainMenu`: Start plays the scenarios in order (the dev console can jump to any one).
2. `ScenarioScreen`: the scam plays in on a fake screen; Shield Buddy says `buddy.intro`, `buddy.explain` and `buddy.choices`; then the Do it / Ignore it / Tell an adult buttons slide up.
3. `DoItScreen` (only after Do it, only if the scenario has `doIt`): where the scam leads, e.g. a fake website.
4. `OutcomeScreen`: Buddy explains the result, then "What if you had…" cards (worded by `whatIf`) show the other two choices. Results are always `do` → red, `ignore` → yellow, `tell` → green.
   Then `SpotScreen`: the scam comes back and the player taps the clues on a short checklist.
5. `RecapScreen`: Stop, Check, Tell with a 3-step progress bar. Each step highlights a red flag on the fake screen while Buddy explains it. Tell ends with `recap.tip` (what you can do, e.g. a family code word), then `SummaryCard` (`recap.summary`: what you can do, and "Make sure to avoid").
6. `EndScreen`: after "Finish" on the last scenario, with the player's badges.

**Badges** (`src/badges.ts`): earned during play (all clues found, telling an adult, finishing) and saved in `localStorage`. `BadgeToast` (`screens/Badges.tsx`) shows "New badge!" when one is earned; `BadgeList` shows them all on the end screen.

**Fake screens** (`src/mockups/`): `Mockup` picks the component for a scenario's `mockup` type. Devices are `PhoneFrame` (iPhone; `dark` for full-screen apps, optional message box) and `TabletFrame` (iPad held sideways, scales to fit with container query units); `SafariBar` is the iPad Safari toolbar. Nothing on a fake screen is a real link, button or form field. Images (logos, photos) live in `public/images/` and are named by path in the scenario files.

**Recap targets:** recap items are `{ target, highlight?, text, screen? }`. `target` names a content field, `highlight` is an exact piece of text inside it, and `screen: "doIt"` points at the Do it screen instead. Mock-ups render text through `<Field name=...>` (`Field.tsx`), and non-text parts (a video, a box of comments) use `useMark` (`marks.ts`); both highlight and scroll into view. A list of texts is targeted as `message1`, `message2`, and so on. A recap item with a `spot` name (e.g. "Someone rushing you") is also on the "Spot the clues" checklist (`SpotScreen`); `spotAlso` lists other places on the screen that count as finding it (e.g. the video as well as the caption for "A free prize"), and `spotHint` is what Buddy says when the player taps Hint.

**Shield Buddy** (`src/buddy/`): one image per mood from `shield_buddy/` (`happy`, `curious`, `thinking`, `worried`, `cheering`, `neutral`), with typed-out speech bubbles (`useTypewriter`: a slow, kid-friendly pace with pauses after punctuation, then a reading pause before the next bubble; tapping anywhere on the screen except a button finishes the typing or skips the pause). Every bubble stays: messages added later type out under the earlier ones, and the stack fades out at the top and scrolls (no scroll bar). Buddy does a move per mood with each new message (CSS in `index.css`). Read-aloud is planned, so keep Buddy's lines in the scenario data, not in markup.

Animations respect `prefers-reduced-motion` (`src/motion.ts`).

**Dev console** (`src/dev/`, dev server only): fast mode plus jumps to any screen, for testing. It must be removed before shipping; the steps are in `PROJECT.md`, and every touchpoint is marked `DEV CONSOLE`. Keep that list up to date if you add to it.

## Content rules (these apply to all scenario text and UI copy)

- Write at about an 8-year-old reading level, with simple words. Keep one idea per screen, with big buttons and large text. The text on the fake screens can be realistic; everything Buddy and the game say must be simple.
- Scenarios 1–3 show real apps and brands (iPhone, Safari, Google, Roblox, YouTube) so they match what kids actually see; scenarios 4–5 (set aside for now) use made-up names (PixelPals, ShopZoom). Never include working links. Whether to keep real brands is still being decided (see `PROJECT.md`).
- Consequences should feel realistic but not frightening or graphic.
- No shame. Wrong choices get "Here's what to watch for next time," never "You failed."
- No emojis in the game's own interface (buttons, labels, headings). Emojis are fine inside the fake scam screens.
- Shield Buddy never hints before the choice: its intro, explanation and list of choices stay neutral. It isn't a trusted adult: its lines always send kids to a real grown-up. All its lines are scripted, never generated.
- Keep the key lesson: Ignore keeps *you* safe once, but Tell stops the scam. The yellow outcomes should show why ignoring isn't the full answer.
- Every scenario ends with what the kid can do next time (`tip` and `summary`), worded gently.
