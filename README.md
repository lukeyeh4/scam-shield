# Scam Shield: Stop, Check, Tell

A simple game that teaches kids aged 8–12 how to spot and handle scams. Each scenario shows a scam the way it would really appear: a text on a phone, an email in an inbox, a message in game chat, or a pop-up on a shopping site. The player picks one of three choices and sees what happens. The game then walks back through the scam to show how **Stop, Check, Tell** would have helped them spot it.

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

This is a realistic mock-up of wherever the scam would actually appear: a phone's text messages, an email inbox, game chat, or a web page. It should look and feel real, with a few changes:

- **Made-up names and brands** (for example "BlockCraft" instead of a real game, or "ShopZoom" instead of a real store)
- **Red flags planted in it**: a countdown timer, an odd link, a spelling mistake, an unknown sender, a request for a password or code
- **No real working links**

### 2. The choice

There are always the same three big, simple buttons:

| Button | Meaning |
|--------|---------|
| 👆 **Do it** | Click the link, reply, send the code, or buy the thing |
| 🙈 **Ignore it** | Close it and move on |
| 🗣️ **Tell an adult** | Show it to a parent, teacher or other trusted grown-up |

### 3. What happened

After the player chooses, the game reveals **all three outcomes**, with the player's choice highlighted. Kids learn from the paths they didn't take as well.

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

Optional: before the recap, the player taps the red flags themselves as a mini "spot the clues" game.

## The 5 scenarios

Ordered from easiest to hardest:

| # | Scenario | Looks like | The scam | 👆 Do it → | 🙈 Ignore it → |
|---|----------|------------|----------|-----------|---------------|
| 1 | **"You Won!"** | Phone text messages | "You won a free tablet! Claim in 5 mins: prize-claim.co" | Enter your address, and now strangers know where you live | You're safe, but more scam texts keep coming |
| 2 | **Free Coins** | Game chat in "BlockCraft" | A player offers 10,000 free coins if you log in on their site | Your account is stolen, along with all your items | Safe, but your friend falls for it next |
| 3 | **"It's Me, New Account"** | Messaging app | A "friend" on a new account asks for a gift card code | The code is gone, and so is the money | Safe, but your real friend never finds out their account was copied |
| 4 | **Account Locked!** | Email inbox | "Your account will be deleted! Verify now" from a look-alike address | You enter your password, and now someone else has it | Safe, but you're still worried your account might really get deleted |
| 5 | **Mega Deal** | Shopping website with a pop-up | Sneakers 90% off, but only for 10 minutes | Your parent's card is charged and the shoes never arrive | Safe, but you might fall for the next deal |

Telling an adult always leads to the 🟢 outcome: the scam is blocked or reported, and the player learns the clues.

## Look and feel

- **Simple and bright.** Use big buttons, large text, and one idea per screen.
- **Realistic where it matters.** The scam screens should look like the real thing, while the rest of the game stays simple and friendly.
- **Use icons and colours alongside words.** 🔴 🟡 🟢 and 🛑 🔍 🗣️ help younger readers.
- **Realistic, not frightening.** Consequences should feel real without being scary or graphic.
- **No shame.** Wrong choices are part of learning, so say "Here's what to watch for next time," not "You failed."
- **Simple language.** Aim for a reading level of about 8 years old.

## Proposed structure

```
scam-shield/
├── README.md
├── scenarios/            # One data file per scenario
│   ├── 01-you-won.json
│   ├── 02-free-coins.json
│   ├── 03-new-account.json
│   ├── 04-account-locked.json
│   └── 05-mega-deal.json
└── src/
    ├── mockups/          # Reusable fake screens: phone SMS, email, game chat, website
    └── ...               # Game screens: choice, results, recap
```

Each scenario picks a mock-up type and fills it with its own content, so adding a new scenario doesn't require building a new screen.

### Example scenario (draft)

```json
{
  "id": "you-won",
  "title": "You Won!",
  "mockup": "sms",
  "content": {
    "sender": "+1 (555) 019-2834",
    "message": "CONGRATS!! You have WON a FREE tablet 🎉 Claim in 5 mins befor it expires: prize-claim.co/win"
  },
  "outcomes": {
    "do":     { "result": "red",    "text": "The site asked for your name and home address. Now a stranger knows where you live." },
    "ignore": { "result": "yellow", "text": "You stayed safe, but the next day another prize text arrives..." },
    "tell":   { "result": "green",  "text": "Mum blocked the number and reported it as spam. Scam stopped!" }
  },
  "recap": {
    "stop":  "The '5 mins' timer was trying to rush you.",
    "check": ["Unknown number", "You never entered a contest", "Spelling mistake: 'befor'", "Strange link"],
    "tell":  "Show a parent and say: 'I got this text and I'm not sure about it.'"
  }
}
```

## Open questions

- [ ] Platform: web, tablet, or both?
- [ ] Tech stack (for example, plain HTML/JS or React)
- [ ] Mascot or guide character for the recap screens?
- [ ] Should there be an end screen or certificate after all 5 scenarios?
- [ ] Read-aloud audio for younger readers?

## Getting started

_TBD once the tech stack is chosen._
