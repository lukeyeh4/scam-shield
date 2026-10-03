# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Pre-implementation. The repo contains only `README.md`, which is the design spec. There is no code, tech stack, build, lint, or test tooling yet. The stack (plain HTML/JS vs. React) and platform (web, tablet, or both) are open questions. Don't pick one without asking the user. Update this file with real commands once tooling exists.

## What this is

"Scam Shield: Stop, Check, Tell" is a game that teaches kids aged 8–12 to spot scams. The README is the source of truth for the design. Read it before building anything.

## Architecture (as designed)

The game is data-driven. Every scenario uses the same four-screen flow, and scenarios differ only in their data:

1. **Scam screen**: a realistic mock-up (`sms`, email, game chat, website) filled with scenario content.
2. **Choice**: always the same three buttons: `do` / `ignore` / `tell`.
3. **What happened**: reveals all three outcomes and highlights the player's pick. The results are `do` → red, `ignore` → yellow, `tell` → green, always.
4. **Recap**: the scam screen comes back with notes added for STOP (what rushed you), CHECK (each red flag), and TELL (who to tell and what to say).

Planned layout:
- `scenarios/NN-<slug>.json`: one file per scenario (5 planned, ordered easiest to hardest). The schema is shown in the README's "Example scenario" (`id`, `title`, `mockup`, `content`, `outcomes.{do,ignore,tell}`, `recap.{stop,check[],tell}`).
- `src/mockups/`: reusable fake screens, one per mock-up type. Adding a scenario should mean adding a JSON file, not building a new screen.
- `src/`: the shared game screens (choice, results, recap).

To support the recap and the optional "tap the red flags" mini-game, the mock-up components need some way to point to specific elements (timer, link, sender, typo). The current draft schema doesn't define this yet.

## Content rules (these apply to all scenario text and UI copy)

- Use only made-up names and brands (e.g. "BlockCraft", "ShopZoom", `prize-claim.co`). Never use real brands, and never include working links.
- Write at about an 8-year-old reading level. Keep one idea per screen, with big buttons and large text.
- Consequences should feel realistic but not frightening or graphic.
- No shame. Wrong choices get "Here's what to watch for next time," never "You failed."
- Use icons and colours (🔴🟡🟢, 🛑🔍🗣️) alongside the words.
- Keep the key lesson: Ignore keeps *you* safe once, but Tell stops the scam. The yellow outcomes should show why ignoring isn't the full answer.
