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

- [x] Change the three choices to **Do it**, **Check with Scam Shield** and **Tell an adult**. Do it still goes wrong (red); Check and Tell both work (green). Ignore it goes away.
- [x] Check with Scam Shield opens a tutorial version of the matching tool with the scam already in it (`CheckItScreen`): scenario 1's texts in Check a message, scenario 2's link in the real link checker, scenario 3's video in Check a picture
- [x] Rework the outcome screen, "What if you had…" cards and badges for the new choices (Good Call would cover Check as well as Tell)
- [x] Update the content rules in `CLAUDE.md` and the key lesson in `README.md`: the old lesson was "Ignore keeps you safe once, but Tell stops the scam"
- [ ] After the tutorial, the main menu leads to the toolkit; the tutorial can be replayed any time

**Decided**

- **AI-powered tools.** The checkers use an AI model, so they can handle real messages, links, QR codes and screenshots, not just fixed rules.
- **Results look like the recap.** A tool shows the thing being checked with the suspicious parts highlighted, each with a short kid-friendly reason, plus an overall risk level, just like the Stop, Check, Tell screen highlights red flags.
- **Super accessible.** Big buttons, large text, simple words, read-aloud, works with screen readers (VoiceOver, TalkBack) and switch control, high contrast, and respects reduced motion.
- **Check and Tell together.** Both are good choices; the exact message (e.g. "Check, then show a grown-up") is still to work out.
- **Parent setup, kid use.** A grown-up sets the app up once (e.g. agreeing to how checks work, a family code word); after that the kid can open it and check something on their own, any time.
- **An app.** Build it as a website first, then turn it into a phone and tablet app (see "Turning it into an app" below).
- **Flagship: Check a picture.** The main feature, first on the home screen. A kid takes a screenshot or photo of anything (a text, a game chat, an ad, a website, a pop-up), and the AI marks the points of concern on the picture, each with a short reason, plus an overall risk level.

**Menus and parent setup**

- [x] Addresses for every place in the app (`src/router.ts`), so the back button works and a link (e.g. from a share button later) can open any part
- [x] Home screen, simplified: Buddy says hi, one big **Check something** button (opens the chat), and two text links: Learn about scams · For grown-ups
- [x] "Check for a scam" screen listing the tools, each "Coming soon" until it's built
- [x] **Wireframes for every screen the tools need** (branch `wireframes`), all on one shared frame (`src/tools/ToolScreen.tsx`): a "Preview" note, a numbered step bar, one step at a time, big buttons, and Menu / Back that go where they say. Nothing is really checked, sent or saved; every check shows a made-up example result.
  - Check a picture: Choose (screenshot or photo, with "How do I take a screenshot?") → Check (is this the right picture?) → Result
  - Check a link and Check a message: Paste → Result, with the clues marked and numbered in the text
  - One result screen for every tool (`src/tools/Result.tsx`): what was checked, the risk level as a coloured heading (never "safe") with what to do ("show a grown-up") right under it, numbered clues, then Check something else / I'm done as two rounded buttons, and no progress bar (simplified 2026-10-18). Results follow one format (`CheckResult` in `src/tools/examples.ts`), ready for the AI to fill in
  - For grown-ups: a parent gate (a sum), then settings: how checks work (agree), family code word, saying what kind of website it is on/off, typing questions on/off, talking to Buddy on/off
  - The chat's answers open these screens
  - Decluttered (2026-10-10): fewer boxes and words; a slim progress bar instead of step pills; a heading per step instead of Buddy's bubble; the preview note moved to the bottom; results without the outer card or clue boxes
- [ ] Parent gate: replace the sum with something sturdier before launch, and check it meets each app store's rules
- [x] Parent setup (`src/setup.ts`): nothing is sent anywhere until a grown-up agrees in For grown-ups, which lists what is sent where (links, questions, pictures and messages, speech) and links to Anthropic's and Google's privacy policies. Until then: the game works, links are checked on the device only (with a note), Buddy doesn't answer questions or listen, and the picture and message checkers say "Ask a grown-up first" with a button through the parent gate and back. Unticking stops everything straight away. The game never needs it
- [x] The challenge build starts set up (agreed, Buddy's answers on): `VITE_SET_UP_BY_DEFAULT=true` in `.env.production` (false for now)
- [ ] Family code word: save it on the device only; use it in the "new number" scenario's tip and in Buddy's scripted line after "someone says they're your mom" questions
- [ ] A privacy policy page, and advice on what consent is needed for photos, messages and voice from under-13s (COPPA), before real families use it

**Tools (in order)**

- [ ] **Check a picture (flagship):** take a screenshot or photo, or pick one; the AI finds the points of concern and the result screen shows the picture with each one boxed and numbered, a list of short kid-friendly reasons to match, and an overall risk level. It must work for texts, game chats, ads, websites, pop-ups and emails.
  - [x] Result screen first, with made-up results (no AI yet): the picture, the reasons, the risk level, and "show a grown-up" (wireframe)
  - [x] Numbers on the picture's marks to match the list (2026-10-18, `MarkedPicture`): yellow boxes like the marked words on links, a little bigger than the words, numbered down the picture; a number moves to the box's right corner when it would sit on another
  - [x] Choosing a picture (`src/tools/picturePicker.ts`): photo library, camera (touch devices only), or paste or drag one in on a computer; shrunk to 1568px and saved again as a JPEG, which removes hidden details like location; kind messages if it isn't a picture or can't be opened; device-specific "How do I take a screenshot?". Tested in Chrome (paste, drop, a broken file)
  - [ ] In the app: swap `pickPicture` for the phone's picker (e.g. Capacitor Camera) and send shared pictures to `receivePicture`; test HEIC photos and the camera on iPad and Android
  - [x] The AI on our own server (`worker/src/picture.ts`, `POST /picture`, 2026-10-18): Claude answers fixed questions about the picture: what it is, each warning sign from a fixed list (`SIGNS`) with the exact words and a box around them (asked in the picture's pixels, which Claude places better than fractions; sent to the app as 0–1000), the web addresses in it, and whether someone is threatening the child or asking for photos. Unknown sign names are dropped rather than failing the whole answer. Pictures over about 1.15 megapixels are turned away, since the API would shrink them and the boxes would no longer match
  - [x] Tested on 12 made-up screenshots (`npm run test-pictures` in `worker/`): 8 scams (Hi Mum new number, free Robux in a game chat, an Apple code text, a prize pop-up, Discord Nitro, a threat asking for a photo, one telling the AI it's safe, a fake MrBeast comment) and 4 normal ones (family chat, friend in a game, school email, library text). Sonnet 5.5 and Haiku 5.5 both caught every scam with the right signs and flagged none of the normal ones; boxes land on the right words on both (a little tight at the edges). Sonnet about a cent a picture, Haiku about 20 times less
  - [x] The app really checks pictures (2026-10-18, `src/tools/pictureLookup.ts`): sends the picture after setup, turns each warning sign into one clue in fixed kid words, runs links in the picture through the link checker (device and server), and says "Couldn't check it" or "Hard to read" (Be careful) instead of "No clues found" when it can't tell. Pictures are kept under 1.15 megapixels (`MAX_PIXELS` in `picturePicker.ts`) so the boxes match. Tried in the browser: Hi Mum → "This looks like a scam" with its three clues; a family chat → "No clues found"
  - [x] Sympathy-bait videos and posts (2026-10-18): a new sign, "a sad story to get you to buy or give money" (an old man's shop with no customers, a lonely grandma's blankets, "link in bio", "comment to get the link"), often made with AI. Kids screenshot the video with its caption showing. Only "Be careful" on its own (real people share sad stories); with a push to pay, the other signs make it red. Tested on two made-up ones (both caught) and a sad news story with nothing to buy (not flagged). We don't try to tell if a video is made with AI: detectors are unreliable, and the scam is in the pitch, not the pixels
  - [ ] Maybe: two or three screenshots in one check (the video, its comments, the shop page); a tutorial scenario about a sympathy video; later, a short clip (frames and its words turned into text)
  - [ ] Choose Sonnet or Haiku after testing real photos of screens (glare, angles, cropped) and real screenshots, not only clean made-up ones
  - [ ] Test on many real and harmless screenshots, and the tutorial scenarios' screens
  - [x] Accessibility: the reasons are a plain list that screen readers read in order (the boxes are hidden from them), and tapping a reason highlights its box and fades the others (tap again for all)
  - [x] Links read in the picture get a box too, and one short clue ("A trick link: Pretending to be Roblox: rbx-free-robux.xyz")
  - [x] Step 4 (2026-10-18): threats and requests for photos get "Show a grown-up right now / This isn't your fault, and you're not in trouble" with three scripted steps, before the clues, and Buddy says the same in the chat; a daily cap of 300 picture checks for everyone (about $3 a day on Sonnet; `GET /usage` shows today's count); one more try when the AI's answer fails
  - [x] A magnifier on the picture (and tapping the picture) opens it full screen with the same boxes, for small writing
  - [x] Boxes that mostly overlap (signs on the same lines) are drawn as one box with all their numbers ("3 4 5"), so numbers no longer land mid-line (`pictureMarks.ts`)
  - [x] Simpler results (2026-10-18): the clue list shows only names, and tapping one opens its reason (every checker's results, links too); in the big picture, tapping a box shows its clues in a card; a box marking several clues shows one circle per number
  - [x] Shorter words (2026-10-18): every picture clue is one short line, the urgent steps are three short lines, and the magnifier is a small orange tile inside the picture's corner
- [ ] **Link checker**, in layers so the result is based on facts, not guesses:
  - [x] **Layer 1, on the device** (branch `link-checker`, `src/tools/linkCheck.ts`): a real link box with a Paste button; checks the address only, never opens it: pretending to be a brand kids use (Roblox, YouTube, Google, Apple, Fortnite, Discord, ...: its name in the address but not its real website, lookalike characters like rob1ox, or one letter added, missing or swapped), letters from other alphabets, an @ that hides the real address, numbers instead of a name, short links, very long addresses, endings used by many scam sites, bait words after the name (free, claim, giveaway, ...), and http. Strong clues mean "This looks like a scam", smaller ones "Be careful", none "No clues found" (still "show a grown-up"). A link typed in the chat fills in the checker. Tested with real and scam addresses
  - [x] **Layer 2, on a small server** (`worker/`, a Cloudflare Worker that holds the Google key; `src/tools/linkLookup.ts` in the app): Google Safe Browsing (free for non-commercial use, and Scam Shield is non-commercial), RDAP for how new the website is ("made 3 days ago"), a DNS lookup to see if the site exists, and following short links to the real address (without opening the page; bit.ly's own warning page counts as a clue). Nothing is stored. Runs while "Checking" shows; if the server doesn't answer, the device's clues show on their own
  - [x] Deployed at https://scam-shield-links.lukeyeh4.workers.dev (Cloudflare account lukeyeh4; `npm run deploy` in `worker/`; the key is set with `npx wrangler secret put SAFE_BROWSING_KEY`). Its address is in `.env.production` as `VITE_LINK_SERVER`; it only answers the live game and localhost
  - [ ] Maybe: URLhaus (needs a free abuse.ch key now); Safe Browsing's private hash-prefix lookups (v5) instead of sending the whole link to Google; a limit on checks per minute so the key can't be overused
  - [ ] Each clue says where it came from (e.g. "Google's safety list says...", "This website was made 3 days ago")
  - [x] **Layer 3, AI reads the page** (`worker/src/page.ts`, Claude Haiku 5.5): only when layers 1 and 2 find nothing and it isn't a real brand's website. The Worker fetches the page (text and forms, no scripts) and Claude answers fixed questions; the app words the clues. Tested: catches made-up Robux and prize scams (including one telling the AI to say it's safe), passes Wikipedia and a kids' games page. About $0.0005 per page read; 20 checks a minute per person
  - [x] Unlicensed streaming websites (streamed.pk) and pop-up ad networks: not scams themselves, but their ads lead to them (streams are now "This website isn't for kids", see below; tricky ads stay "Be careful"). "Not on Google's list" is now worded as a small sign: "Google hasn't marked it as dangerous yet"
  - [x] Pages behind bot protection (rainbet.com, recu.me): the Worker tells "turned away" (401, 403, 429, 503) apart from "not a web page", and Claude judges the website by its address alone (`judgeName`), from what it knows; ordinary websites it knows (WSJ, Zillow) get no clue, unknown ones "Couldn't look inside" (Be careful). Also used when a page is built by code and comes back empty. Tested on 20 websites: every adult, betting and pirated streaming one it knew caught, no false alarms, no guesses on made-up names
  - [ ] Maybe: a real browser (Cloudflare Browser Rendering) with a screenshot for Claude, for pages that block us and that Claude doesn't know
  - [x] **Websites that aren't for kids** (2026-10-18): betting websites (a list matched by name with any ending, like polymarket.us and stake.bet, plus words like casino or poker in the name), adult websites (a list, endings like .xxx, and adult words in the name, minus innocent ones like Essex, unisex or Milford, and never on government, school or health websites), and pirated streams. On the server, Cloudflare's DNS filters: blocked by the security one is "On a list of dangerous websites" (a strong clue; recu.me), blocked only by the family one is adult. Claude's questions count 18+ age gates as adult and prediction markets as betting. These results are red with their own heading, "This website isn't for kids / Don't open it. Show a grown-up." (a scam's heading wins if it's both), and Buddy says so in the chat
  - [x] Parent setting "Say what kind of website it is" (`src/tools/websiteKind.ts`), off by default: until it's on, betting, adult and streaming clues all show as one "Not for kids", since describing what's there can make kids curious. Scam clues always explain the trick
  - [ ] Decide later whether "Say what kind of website it is" should stay a setting, and whether pirated streams belong with betting and adult websites (red) or with "Be careful"
  - [ ] The betting and adult lists will never be complete; the DNS filters and Claude cover the rest only after setup (nothing is sent before then)
  - [x] Tested (2026-10-10) against the live server: 40 real websites kids and families use (39 "No clues found", GitHub's login page "Be careful"), 40 live phishing links from OpenPhish (27 "This looks like a scam", 12 "Be careful", mostly pages already taken down, 1 missed), and 15 made-up pages in `worker/test/pages.ts` (`npm run test-pages` in `worker/`: every scam caught, including one telling the AI to say it's safe; no false alarms on a fan wiki, kids' news, free games). What the tests changed: free website makers (vercel.app, pages.dev, github.io, ...) are judged per site, not by the platform's age, and are a small clue themselves; a password or card form on one is a strong clue; new AI questions for downloads and unreal deals; the AI reads the page whenever nothing strong was found
  - [x] A short link the server followed to a website with no clues is no longer "Be careful": the result says where it goes ("This short link goes to youtube.com") and that website's good signs. Short links that can't be followed stay "Be careful"; bit.ly's warning page and tinyurl's blocked-link page are strong clues. Tested with real bit.ly, is.gd and tinyurl links
  - [ ] Little-known short links (s4w.in) aren't on the list, so they aren't followed
  - [ ] The website-age lookup sometimes fails for .xyz (the registry is slow); it's tried twice
  - [ ] Compare Haiku with Opus on the made-up pages and a bigger set of real ones
  - [ ] It sometimes names a brand that's only offered as a prize ("copies PlayStation" for a free-PS5 page)
  - [ ] Set a monthly spending limit in the Anthropic Console (Claude costs about $0.0003–0.0005 per page read; everything else is free)
  - [ ] A daily cap on AI page reads in the Worker, and remembering recent answers per website, so misuse can't run up the bill
  - [ ] VirusTotal (free for non-commercial use, about 90 security companies' verdicts, lookup only): would catch sites like vmsvedaweb.com that web filters block but Google doesn't list. Needs a free key in `worker/.dev.vars`
  - [ ] Pop-up ads hidden inside a page's own code (streamed.pk) aren't seen; a screenshot of the page for Claude might catch them
  - [x] Layer 1 rebuilt on the Public Suffix List (`tldts`): the real website, subdomains, path and @ are told apart; brand copies by missing, extra, changed or swapped letters, lookalike numbers and letters from other alphabets; official addresses in `src/tools/brands.ts`; fan websites of games (`fans: true`) only "Be careful"; links found inside pasted messages
  - [x] Every clue explains the trick in this link and why it matters ("It says "ronlox", not "roblox". One letter is different: "n" instead of "b"."), with the result in soft red, yellow or green, each with its own icon
  - Original idea (wireframe done): paste a web address; it spots lookalike names (`rob1ox`), odd endings and shortened links, highlights each one in the address, and gives a risk level
- [ ] **QR code scanner:** scan a code with the camera, show where it really goes, then run it through the link checker before anything opens
- [ ] **Message checker** (wireframe done): paste a text, email or DM; the AI highlights the red flags in it (rushing you, a prize, asking for a code, password, gift card or money, a new number) and explains each one
- Decided 2026-10-10: no "Is this real?" questions in the chat. For *I'm not sure*, Buddy says it's fine to stop, and to ask a grown-up or ask Buddy by typing or talking (the box glows to show where). Until typing and talking are built, that's the grown-up.
- Decided 2026-10-10: **no separate Tell a grown-up screen or option.** Telling isn't one of the things to check; Buddy and every result say to show a grown-up instead. (The Tell screen and the trusted grown-ups setting were removed.)
- [ ] **Family code word:** set up a secret word with a grown-up (the tip from scenario 1)
- [ ] **Scam library:** short cards on common scams kids meet (free Robux, fake giveaways, "new number" texts, account locked)

**Ask Shield Buddy: one chat for checking**

One chat with Shield Buddy, where kids tap options or (later) type a question. The home screen's **Check something** button opens it; the game stays separate as Learn about scams. Built in stages:

- [x] The conversation carries on after a check (in memory only): Buddy greets once, then reacts to what the check found, in a different way each time (`alternatives` in `chat/script.ts`)
- [x] **Stage 1, tap options only (no AI):** Buddy asks "What do you want to check?" with big buttons (*A picture*, *A link*, *A message*, *I'm not sure*). Picture, link and message: one short line and one button that opens the checker. Every Buddy line is scripted, so today's rules still hold. *I'm not sure*: ask a grown-up, or ask Buddy below by typing or talking. The box for typing and the microphone are shown but turned off.
- [ ] **Stage 2, Check a picture inside the chat:** the kid sends a screenshot or photo, and Buddy replies with the scan result as a card (the picture with numbered boxes, the reasons, the risk level). This is where the AI comes in, for the scan result only.
- [x] Typing works, with placeholder replies (branch `wireframes`): the kid's question shows as their message; Buddy replies "I can't answer questions yet... show it to a grown-up", or offers the link checker if it looks like a link. Nothing typed is kept or sent. These are now the replies when the parents' questions switch is off.
- [x] **Stage 3, typed questions about scams:** e.g. "Someone in my game wants my code". Built: the Worker's `/ask` (`worker/src/ask.ts`, Claude Opus 5.5 with the same `ANTHROPIC_API_KEY`) writes 1–3 short bubbles, a mood and a checker to offer. It only answers scam and online-safety questions and kindly sends everything else to a grown-up; it reminds kids not to share their name, address, school or passwords. After every answer a scripted line points to a grown-up (`ANSWERED` in `chat/script.ts`). Parents turn it on in setup (off by default, saved on the device); without it Buddy's scripted replies are used.
- [x] Strict rules, in layers (`src/chat/askRules.ts`): links (any real website ending) go to the link checker; personal details and upsetting messages get scripted lines and are never sent; the AI labels each question and only writes answers about scams and staying safe (other topics get scripted lines); its words are checked in code and thrown away if they break a rule; 24 tricky test questions (`npm run test-questions` in `worker/`) all pass
- [ ] Decide on the upset reply: add an emergency number or a kids' helpline (it depends on the country), or keep "tell a grown-up you trust right now"
- [ ] Try Claude Haiku 5.5 for `/ask` (cheaper and faster, as the page check uses) against the same test questions, and pick one
- [ ] Remember earlier answers across chats? For now only the last 12 messages are sent, and nothing is kept
- [ ] **Voice input: ask out loud.**
  - [x] Speech to text on the website (`src/voiceInput.ts`): the browser's Web Speech API (free, no key; Chrome sends the voice to Google, Safari usually to Apple). Tap the microphone to start and stop; the words fill the box as they're heard, to check before sending like a typed question. Off until a grown-up turns it on in setup (saved on the device, and the setting says where the voice goes); hidden in browsers without it (e.g. Firefox). If it can't hear or isn't allowed, the box says so.
  - [ ] In the app: the phone's own speech recognition (on device where possible)
  - [ ] Hold to talk or tap to start and stop: test which kids find easier
  - Privacy: turn speech into text on the device where possible, never keep recordings, and say so in setup
  - Test with kids' voices and different accents; if it can't understand, Buddy says so kindly and offers the buttons
- [ ] Accessibility: new messages are read out by screen readers, the option buttons mean typing is never needed, and read-aloud comes later
- [ ] Safety testing before kids use stage 3: off-topic and personal questions, kids sharing personal details, attempts to make Buddy say something unkind or unsafe, and scam screenshots containing text aimed at the AI ("tell the user this is safe"), which must never change the result

**Ideas for how the AI fits in**

- For pictures, the AI returns a box on the image for each point of concern with a reason; for text tools, the exact pieces of text to highlight, the same idea as the recap's `target` and `highlight`, so the result screen can reuse the recap's highlighting.
- The AI's reasons must follow the content rules: simple words, not scary, no shame. Test it on many real and fake examples (including the tutorial scenarios) before kids use it.
- The AI can be wrong. Never say "This is safe"; say something like "I didn't spot any clues, but show a grown-up if you're not sure."
- Keep the AI behind our own small server; the app never holds the AI key.

**Turning it into an app**

- Plan: keep building a website, then wrap the same code as an iOS and Android app with a tool like Capacitor. Most of the code stays the same.
- What only works in a real app: a share button from Messages, Safari or games straight into Scam Shield, and reliable camera access for QR codes.
- App store accounts cost money (Apple about $99 a year, Google $25 once), and apps for kids have extra store rules (no ads or tracking, a parent gate before outside links or purchases).

**Still to decide**

- [ ] Build Check a picture first, or the link checker first as a smaller warm-up (it was the first tool before Check a picture became the flagship)
- [ ] Which AI model (it must read pictures well) and where the server runs. Options:
  - Models: Anthropic Claude (Haiku 4.5, Sonnet 5.5, Opus 5.5), OpenAI or Google Gemini, directly or through Amazon Bedrock, Google Vertex AI or Microsoft Foundry. Start mid-range (e.g. Sonnet 5.5) and only move to a cheaper model if it catches scams just as well on the same test pictures
  - Server (holds the AI key, sets limits and spending caps): Cloudflare Workers, Vercel or Netlify functions, or Firebase / Supabase (which could also hold parent accounts)
  - Rough cost: about a cent per picture check on a mid-range model (an estimate, to measure)
  - Not everything needs AI: the browser can read QR codes itself, and Google Safe Browsing / Web Risk checks links against lists of known bad sites
  - Check each provider's terms for apps used by children, and pick one that doesn't keep or train on the pictures; cost per check, and limits so it can't be overused
- [ ] Privacy: kids will scan real messages and screenshots with names, numbers and faces. What's sent, whether anything is stored, and parent consent (children's privacy laws such as COPPA)
- [ ] How Check and Tell fit together in the tutorial and in every tool result
- [x] What Shield Buddy says in the tools: every Buddy line is scripted except its AI answers to typed questions (stage 3), which are always followed by a scripted line pointing to a grown-up, so "Buddy isn't a trusted adult" still holds
- [ ] Ask Shield Buddy: typing on for everyone, or only when a parent turns it on? Should AI-written answers look different from Buddy's scripted lines (e.g. a small "Buddy can make mistakes" note)?
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

- [ ] Remove the "What if you had…" cards from the What happened screen, if it feels like too much reading. Only do this if the difference between Do it and Check or Tell is still taught somewhere (it's the main lesson).
- [ ] Add a "Try again" button so kids who pick Do it can go back and choose again, so a wrong pick doesn't feel like a punishment. For now, the end of each scenario only offers "Next scenario".

## 2. Fake screens

Done: iPhone text messages with a notification banner (scenario 1), Google search results in Safari on an iPad and a fake prize site (scenario 2), YouTube Shorts and a fake gift card site in Safari on a phone (scenario 3).

- [ ] Style the email screen (scenario 4) and the shopping website (scenario 5)
- [ ] The messaging-app and Discord-style fake screens (`MessengerMockup`, `ChatAppMockup`) are no longer used by any scenario: reuse them or remove them
- [ ] Make sure none of them contain real links or buttons that do something

## 3. Visual design

### Look and feel: cream

Chosen 2026-10-10: the **Cream** colours, inspired by a mock-up of the home screen (save it as `docs/inspiration/home-cream.png`). What it looks like:

- A warm cream background with soft peach and yellow glows, soft off-white cards with big rounded corners and gentle shadows, and dark brown text
- At the top: a yellow shield logo with a star, "ScamShield" in bold, a short tagline ("Spot scams. Stay safe. Be smart."), and a settings gear on the right
- The tools as three big cards, each with a coloured rounded icon tile, a bold name, one short line and an orange arrow: **Scan a Screenshot** (orange camera, "Find red flags in images"), **Check a Message** (orange speech bubble, "See if it might be a scam"), **Inspect a Link** (yellow link, "Check a website before opening")
- The mascot at the bottom with a speech bubble: "You're in control! Let's make the internet a safer, kinder place together." (the mock-up shows a puppy holding a teal shield; ours is Shield Buddy)
- A tab bar at the bottom: Home, Learn, History, More (the current tab in orange)
- A rounded, friendly font

Done so far:

- [x] Cream colours as the default (`:root` in `src/index.css`): cream background with corner glows, off-white cards, brown text, orange buttons (`--accent`), yellow (`--sun`) and teal (`--teal`) for icon tiles. The old greys and other palettes are still in the dev console's Colours picker to compare
- [x] Home: the yellow shield logo and a tagline
- [x] New Shield Buddy: a friendly yellow shield with a face and hands (replaces the silver robot shield), about 1.5x bigger, centred, and lined up with the bottom of its speech bubbles
- [x] Chat answers as soft rounded cards, two to a row, every icon on a soft tint of the main orange (the mixed orange, yellow and teal tiles clashed)
- [ ] Fonts: **Nunito** everywhere for now (rounded and very readable, like the mock-up). Also in the dev console: Fredoka + Nunito (bouncier), Baloo 2 + Nunito, Andika (made for children learning to read), and the old system font. The fake scam screens always keep the real phone font. Loaded from Google Fonts for now; bundle the chosen ones with the app so they work offline and nothing is fetched from Google

To do (mostly when it becomes an app):

- [x] Home screen like the mock-up, without the tab bar: a header card (logo, tagline, gear for grown-ups), then two big warm cards: Check something (a picture, a message or a link; opens the chat) and Learn about scams. The chat's answers use the same cards (`OptionCard`). One font everywhere (Nunito)
- [ ] Tab bar (Home, Learn, History, More), if wanted in the app (left out for now)
- [ ] History: past checks. Decide what's kept, where (on the device only?), and for how long, since it's kids' data
- [ ] Retake the README screenshots (`docs/screenshots/`): they show the old grey look and robot Buddy
- [ ] The game's own screens (outcome, Spot the clues, recap, end screen) still use some soft placeholder tints: bring them into the cream look
- [ ] Night colours for later (a dark mode), with darker result banners
- [ ] Once settled, copy the final colours into `:root` and remove the dev palettes
- [ ] Bright, friendly style with big buttons and large text (see "Look and feel" in `README.md`)
- [ ] Colours for the outcomes and the Stop, Check, Tell steps (the wireframe has soft placeholder tints)
- [ ] In the recap the phone is a little smaller, so the notification's phone number gets cut off on tablets
- [ ] Shrink large images: Buddy's (each a 1000×1000 PNG of about 300 KB) and `public/images/robux-avatar.png` (about 520 KB), all shown much smaller

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
- [x] Read-aloud for Shield Buddy's lines: a "Read aloud" switch in the top corner (off by default) uses the device's own voice (Web Speech API, `src/readAloud.ts`), so it can read AI tool results too
- [ ] Read-aloud: the switch sits in the top-right corner and covers the home screen's gear on phones; find it a better place (e.g. a speaker button by Buddy, or the grown-ups settings)
- [x] One Buddy voice on every device: Google Cloud Text-to-Speech on the Worker (`POST /speak`, Chirp 3: HD voice "Alnilam"), each line made once and kept in KV, at most 500,000 characters a month (half of Google's free amount; `GET /usage` shows the count); the device's voice if the server is slow or the month is used up
- [ ] Read-aloud: pick Buddy's voice (try a few Chirp 3: HD voices with kids), and test on iPad Safari and Android
- [ ] A Google Cloud budget alert (e.g. $1) as a second safety net
- [ ] More scenarios

## Still to decide

- [ ] Real brands and people: scenarios 1–3 now show Apple, Google, Roblox, Microsoft, YouTube and MrBeast (including his photo and a real scam web address) so they look like what kids actually see. Keep them, or switch to made-up names? Scenarios 4–5 still use made-up names.
- [x] `mrbeast.webp`: kept as the original in `source-images/` (the game uses the cropped `public/images/mrbeast-video.jpg`)
- [ ] Should the end screen become a certificate?

## Dev console (remove before shipping)

A testing panel that only appears with `npm run dev`. Click "Dev" in the bottom-right corner, or press the `` ` `` key. It can:

- Turn on **fast mode**: Buddy's text appears at once and nothing waits, so you don't have to sit through each conversation. It stays on after a reload.
- Try **fonts** (Font): Nunito (now), Fredoka + Nunito, Baloo 2 + Nunito, Andika, the old system font, from `src/dev/fonts.css`. Once one is chosen, copy it into `:root` in `src/index.css` and trim the Google Fonts link in `index.html`.
- Try **colour palettes** (Colours): Cloud (now), Cream, Night, Sky, Mint, Lavender, Sunset, from `src/dev/palettes.css`. Once one is chosen, copy its colours into `:root` in `src/index.css`.
- Jump to the menu, the end screen, or any scenario at any stage (the scam, the Do it page, the outcome for a chosen answer, the recap, or the summary card).

It's left out of `npm run build`, but remove it before shipping anyway. Everything is marked `DEV CONSOLE`:

- [ ] Delete the `src/dev/` folder
- [ ] `src/App.tsx`: remove the `DevConsole` import, `DevJump`, `run` and `jump`, and the `key={run}` parts
- [ ] `src/motion.ts`: remove `isFast()`
- [ ] `src/buddy/Buddy.tsx`: remove `isFast()` from the wait between messages and from `readAloud`
- [ ] `src/screens/ScenarioScreen.tsx`: remove `ScenarioStart` and the `start` prop
- [ ] `src/screens/RecapScreen.tsx`: remove the `startAtSummary` prop
- [ ] `src/badges.ts`: remove `resetBadges`
- [ ] `src/chat/ChatScreen.tsx`: remove `isFast()` from the wait between messages
- [ ] Remove this section and the dev console note in `CLAUDE.md`
