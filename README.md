# Scam Shield: Stop, Check, Tell

A simple game that teaches kids aged 8–12 how to spot and handle scams. Each scenario shows a scam the way it would really appear: texts on a phone, search results on a tablet, a video on YouTube, an email in an inbox, or a pop-up on a shopping site. The player picks one of three choices and sees what happens. The game then walks back through the scam to show how **Stop, Check, Tell** would have helped them spot it.

## The strategy: Stop, Check, Tell

| Step | What it means | In kid words |
|------|---------------|--------------|
| 🛑 **STOP** | Don't act right away. Scammers want you to rush. | "If it's in a hurry, I'm not." |
| 🔍 **CHECK** | Look for clues that something is wrong. | "Does anything look weird?" |
| 🗣️ **TELL** | Tell a trusted adult before doing anything. | "When in doubt, tell someone out loud." |

## How a scenario plays

Every scenario follows the same four screens, so kids always know what to expect.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 1. THE SCAM │ →  │ 2. CHOOSE   │ →  │ 3. WHAT     │ →  │ 4. STOP,    │
│ (realistic  │    │ Do it       │    │  HAPPENED   │    │  CHECK,     │
│  screen)    │    │ Ignore it   │    │ (all 3      │    │  TELL       │
│             │    │ Tell adult  │    │  outcomes)  │    │  recap      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 1. The scam screen

This is a realistic mock-up of wherever the scam would actually appear: a phone's text messages, Safari on an iPad, YouTube Shorts, an email inbox, or a web page. It should look and feel real, with a few rules:

- **Real apps where it helps.** Scenarios 1–3 show real apps and brands (iPhone, Safari, Google, Roblox, YouTube) so they look like what kids actually see. Scenarios 4–5 (set aside for now) use made-up names ("PixelPals", "ShopZoom"). Whether to keep real brands is still being decided.
- **Red flags planted in it**: a countdown timer, an odd link, a spelling mistake, an unknown sender, a request for a password or code
- **No real working links**, buttons or form fields

Shield Buddy then says what's happening in simple words, and lists the choices in the scenario's own words (for example "You can tap the link, scroll past the video, or tell an adult. What would you do?"), without hinting which is best.

### 2. The choice

There are always the same three big, simple buttons:

| Button | Meaning |
|--------|---------|
| 👆 **Do it** | Click the link, reply, send the code, or buy the thing. In some scenarios this first shows where the scam leads, like a fake website. |
| 🙈 **Ignore it** | Close it and move on |
| 🗣️ **Tell an adult** | Show it to a parent, teacher or other trusted grown-up |

### 3. What happened

After the player chooses, Shield Buddy explains what happened. Then **"What if you had…"** cards show the other two outcomes, worded for the scenario (for example "What if you had… …tapped the link"). Kids learn from the paths they didn't take as well.

| Choice | Result | Why |
|--------|--------|-----|
| 👆 Do it | 🔴 **Uh oh** | Shows a realistic, age-appropriate consequence: account stolen, money lost, a stranger has your address |
| 🙈 Ignore it | 🟡 **Safe… for now** | You avoided the trap, but the scam is still out there. It might come back, trick a friend, or a hacked friend's account stays hacked. |
| 🗣️ Tell an adult | 🟢 **Scam stopped!** | The adult helps block, report, or warn others, and you learn what to look for |

The difference between Ignore and Tell is the key lesson. Ignoring keeps *you* safe once, but telling someone stops the scam and helps you get better at spotting the next one.

### 4. Stop, Check, Tell recap

The scam screen comes back, this time with explanations added to it:

- 🛑 **STOP**: points at whatever was trying to rush them. *"See this timer? It was trying to make you hurry so you wouldn't think."*
- 🔍 **CHECK**: circles each red flag one at a time. *"This link doesn't match the real website." "You never entered a contest!"*
- 🗣️ **TELL**: names who they could tell and what to say. *"Show Mum or Dad and say: 'I got this message and I'm not sure about it.'"*

Every scenario ends TELL with **what you can do** next time (the `tip` in its file), with the matching part of the scam screen highlighted. For example, scenario 1 teaches a **family code word**: Shield Buddy explains it, and the phone shows the player asking *"What's our code word?"* and the scammer failing to answer. Scenario 2 teaches never typing your password on a site from an ad or a link, scenario 3 not tapping links for free prizes from strangers (even check marks can be faked), scenario 4 checking in the real app, and scenario 5 shopping only at stores your family trusts.

The recap ends with a **summary card** (the `summary` in each scenario file): **Remember**, then what you can do in one sentence, and a short list under **Make sure to avoid**.

Optional: before the recap, the player taps the red flags themselves as a mini "spot the clues" game.

## Shield Buddy

Shield Buddy is a friendly shield with a face who guides the player through each scenario. It talks in short speech bubbles and its face changes to match what's happening.

| Screen | What Shield Buddy does | Mood |
|--------|------------------------|------|
| 1. The scam | Says a neutral intro, then what's happening in simple words, like "Someone says they're your mom. They want the code that just came to your phone." | `curious` |
| 2. The choice | Lists the choices in the scenario's own words, with no hints: "You can send them the code, ignore the texts, or tell an adult. What would you do?" | `curious` |
| 3. What happened | Reacts to each outcome and explains it | `worried` (🔴), `thinking` (🟡), `cheering` (🟢) |
| 4. Recap | Narrates Stop, Check, Tell while each red flag is highlighted on the scam screen, then what you can do next time | `neutral`, then `happy` and `cheering` |

Rules for Shield Buddy:

- **No hints before the choice.** On screens 1 and 2 it stays neutral, so kids learn to find the clues themselves.
- **It isn't a trusted adult.** It always sends kids to a real grown-up: *"I can't block scammers, but a grown-up can!"*
- **One or two short sentences per bubble**, at the same reading level as the rest of the game.
- **Every line is scripted** in the scenario files. Nothing is generated on the fly.
- **It starts with a fixed set of moods:** `happy`, `curious`, `thinking`, `worried`, `cheering`, `neutral`. Each mood is one image of the character, stored in `shield_buddy/`.

## The 5 scenarios

Ordered from easiest to hardest. Only scenarios 1–3 are in the game for now; 4 and 5 wait in `scenarios/later/` until their fake screens are built.

| # | Scenario | Looks like | The scam | 👆 Do it → | 🙈 Ignore it → |
|---|----------|------------|----------|-----------|---------------|
| 1 | **"It's Mom, New Number"** | Phone text messages | "Mom" texts from a new number and asks for the code that just came to your phone | The code unlocks your game account, and now a stranger can log in as you | You're safe, but the scammer keeps texting and might trick someone else |
| 2 | **Free Robux** | Google search results in Safari, on an iPad | Searching "free robux", the top result is a sponsored ad for an "official giveaway"; it opens an official-looking prize site that asks for your password | Your account is stolen, along with all your Robux | Safe, but your friend falls for it next |
| 3 | **Famous Giveaway** | A YouTube Shorts video on a phone | A fake (possibly AI-made) video of a famous YouTuber holding a sign: free gift cards from a link | The site takes a parent's card number to "pay for shipping", and no gift card comes | Safe, but the fake video keeps spreading and fools a friend |
| 4 | **Account Locked!** | Email inbox | "Your account will be deleted! Verify now" from a look-alike address | You enter your password, and now someone else has it | Safe, but you're still worried your account might really get deleted |
| 5 | **Mega Deal** | Shopping website with a pop-up | Sneakers 90% off, but only for 10 minutes | Your parent's card is charged and the shoes never arrive | Safe, but you might fall for the next deal |

Telling an adult always leads to the 🟢 outcome: the scam is blocked or reported, and the player learns the clues.

## Look and feel

- **Simple and bright.** Use big buttons, large text, and one idea per screen.
- **Realistic where it matters.** The scam screens should look like the real thing, while the rest of the game stays simple and friendly.
- **Plain, readable text.** No emojis in the game's own buttons and labels: large, clear words are easier for kids to read. Emojis only appear inside the fake scam screens, to make them look real.
- **Realistic, not frightening.** Consequences should feel real without being scary or graphic.
- **No shame.** Wrong choices are part of learning, so say "Here's what to watch for next time," not "You failed."
- **Simple language.** Aim for a reading level of about 8 years old.

## Tech stack

- **React + TypeScript**, built with **Vite**. Every scenario reuses the same screens, fake-screen mock-ups and Shield Buddy, so reusable components are a good fit. TypeScript checks the scenario files against one shared format.
- **A web app that works on tablets.** Layouts adapt to the screen, and the buttons are big enough to tap easily. It can be hosted as plain static files (for example, on GitHub Pages).

## Project structure

```
scam-shield/
├── README.md             # The design (this file)
├── PROJECT.md            # Next steps
├── scenarios/            # One data file per scenario
│   ├── 01-new-number.json
│   ├── 02-free-robux.json
│   ├── 03-ai-video.json
│   └── later/            # Scenarios 4 and 5, set aside for now
├── shield_buddy/         # Shield Buddy artwork, one image per mood
├── public/images/        # Logos and photos used on the fake screens
└── src/
    ├── mockups/          # Fake screens: iPhone and iPad frames, Safari, texts, search, YouTube Shorts, websites
    ├── buddy/            # Shield Buddy: the picture and typed-out speech bubbles
    └── screens/          # Game screens: menu, scam, Do it, What happened, Stop Check Tell
```

Each scenario picks a mock-up type and fills it with its own content, so adding a new scenario doesn't require building a new screen.

### Example scenario

```json
{
  "id": "new-number",
  "title": "It's Mom, New Number",
  "mockup": "sms",
  "content": {
    "sender": "+1 (555) 019-2834",
    "time": "4:12 PM",
    "messages": [
      "Hey sweetie, it’s Mom. I had to get a new number because my phone stopped working.",
      "I need a favor really quick.",
      "Can you send me the code that just came to your phone?"
    ],
    "notification": {
      "sender": "+1 (555) 386-7720",
      "text": "Your Apple Account code is: 482913. Use it to reset your password. Don't share it with anyone."
    }
  },
  "whatIf": { "do": "sent the code", "ignore": "ignored the texts", "tell": "told an adult" },
  "outcomes": {
    "do":     { "result": "red",    "text": "You sent the code. It was the key to your game account. Now a stranger can log in as you." },
    "ignore": { "result": "yellow", "text": "You didn't send the code. But the scammer keeps texting, and might trick someone else." },
    "tell":   { "result": "green",  "text": "Dad called Mom on her old number. Her phone was fine! They blocked the fake number and reported it. Scam stopped!" }
  },
  "buddy": {
    "intro": "Ooh, a new text message just came in!",
    "explain": "Someone says they're your mom. They want the code that just came to your phone.",
    "choices": "You can send them the code, ignore the texts, or tell an adult. What would you do?",
    "reactions": {
      "do":     { "mood": "worried",  "text": "Uh oh! Let's see what went wrong." },
      "ignore": { "mood": "thinking", "text": "Safe for now… but the scam is still out there." },
      "tell":   { "mood": "cheering", "text": "Great call! Checking with a grown-up stopped it!" }
    }
  },
  "recap": {
    "stop": { "target": "message2", "highlight": "really quick", "text": "'Really quick' was trying to rush you, so you wouldn't stop and think." },
    "check": [
      { "target": "sender", "text": "This number isn't saved as Mom in your phone." },
      { "target": "message1", "highlight": "I had to get a new number", "text": "'I got a new number' is a trick scammers use a lot. Anyone can say they're your mom." },
      { "target": "message3", "highlight": "send me the code", "text": "Never share a code sent to your phone. Codes are like keys to your accounts." },
      { "target": "notificationText", "highlight": "Don't share it with anyone", "text": "The code itself says not to share it. Someone is trying to get into your account." }
    ],
    "tell": "Show a grown-up and say: 'Someone says they're Mom and wants my code. Can we call her old number?'",
    "tip": {
      "label": "Secret code word",
      "buddy": [
        "Here's a trick: pick a secret code word with your family. Only your family knows it.",
        "If someone says they're Mom, ask for the code word. A scammer won't know it!"
      ],
      "phone": [
        { "from": "me", "text": "What's our code word?" },
        { "from": "them", "text": "I forgot. Just send the code, quick!" }
      ]
    },
    "summary": {
      "solution": "Pick a secret code word with your family. Ask for it if someone says they're family.",
      "checks": [
        "A new number saying it's someone you know",
        "Someone rushing you",
        "Anyone asking for a code sent to your phone"
      ]
    }
  }
}
```

Shield Buddy shows the existing `outcomes` and `recap` text in its speech bubble, so each scenario only adds a few extra Buddy lines (`intro`, `explain`, `choices` and `reactions`). `whatIf` words the "What if you had…" cards, `tip` is what you can do next time, and `summary` fills the card at the end. Each recap item points at part of the scam screen. `target` names a field in `content` (separate texts in a list are `message1`, `message2`, and so on), and the optional `highlight` is the exact text inside that field to circle. The "spot the clues" mini-game uses the same targets.

## Open questions

- [x] Platform: a web app that works on tablets
- [x] Tech stack: React + TypeScript + Vite
- [x] Mascot: Shield Buddy (artwork in `shield_buddy/`)
- [x] End screen after the last scenario (could become a certificate later)
- [ ] Read-aloud audio for younger readers? (Planned for later. Shield Buddy's lines would be read aloud.)

## Getting started

```
npm install
npm run dev      # start the game locally
npm run build    # type-check and build for hosting
npm run lint     # check the code
```
