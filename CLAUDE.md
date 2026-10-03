# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Pre-implementation. The repo contains only `README.md`, which is the design spec. The stack has been chosen: React + TypeScript + Vite, as a web app that works on tablets and is hosted as static files. The project hasn't been set up yet, so there are no build, lint or test commands. Add the real commands here once they exist.

## What this is

"Scam Shield: Stop, Check, Tell" is a game that teaches kids aged 8–12 to spot scams. The README is the source of truth for the design. Read it before building anything.

## Architecture (as designed)

The game is data-driven. Every scenario uses the same four-screen flow, and scenarios differ only in their data:

1. **Scam screen**: a realistic mock-up (`sms`, email, game chat, website) filled with scenario content.
2. **Choice**: always the same three buttons: `do` / `ignore` / `tell`.
3. **What happened**: reveals all three outcomes and highlights the player's pick. The results are `do` → red, `ignore` → yellow, `tell` → green, always.
4. **Recap**: the scam screen comes back with notes added for STOP (what rushed you), CHECK (each red flag), and TELL (who to tell and what to say).

Planned layout:
- `scenarios/NN-<slug>.json`: one file per scenario (5 planned, ordered easiest to hardest). The schema is shown in the README's "Example scenario" (`id`, `title`, `mockup`, `content`, `outcomes.{do,ignore,tell}`, `buddy`, `recap.{stop,check[],tell}`).
- `src/mockups/`: reusable fake screens, one per mock-up type. Adding a scenario should mean adding a JSON file, not building a new screen.
- `src/buddy/`: Shield Buddy, which shows one image per mood plus a speech bubble.
- `src/`: the shared game screens (choice, results, recap).

**Recap targets:** each `recap.stop` and `recap.check[]` item is `{ target, highlight?, text }`. `target` names a field in `content`, and `highlight` is an exact piece of text inside that field. Mock-up components must be able to find and highlight the part each target points at. The recap and the "spot the clues" mini-game both rely on this.

**Shield Buddy:** a shield character with a face. The artwork is in `shield_buddy/` (one 1000×1000 transparent PNG per mood). Its lines come from each scenario's `buddy` block (`intro` and `reactions.{do,ignore,tell}`), and it also shows the `outcomes` and `recap` text. The moods are a fixed set: `happy`, `curious`, `thinking`, `worried`, `cheering`, `neutral`. Read-aloud is planned for later, so keep Buddy's lines in data and out of the markup.

## Content rules (these apply to all scenario text and UI copy)

- Use only made-up names and brands (e.g. "BlockCraft", "ShopZoom", `prize-claim.co`). Never use real brands, and never include working links.
- Write at about an 8-year-old reading level. Keep one idea per screen, with big buttons and large text.
- Consequences should feel realistic but not frightening or graphic.
- No shame. Wrong choices get "Here's what to watch for next time," never "You failed."
- No emojis in the game's own interface (buttons, labels, headings): keep it plain, large, readable text. Emojis are fine inside the fake scam screens and scam messages, where they make them look real.
- Shield Buddy never hints before the choice (screens 1–2 stay neutral). It isn't a trusted adult: its lines always send kids to a real grown-up. All its lines are scripted, never generated.
- Keep the key lesson: Ignore keeps *you* safe once, but Tell stops the scam. The yellow outcomes should show why ignoring isn't the full answer.
