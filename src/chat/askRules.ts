// Shield Buddy's strict rules for questions, checked in code so the AI can't get
// around them. Used on the device (before anything is sent) and on the server
// (worker/src/ask.ts, again, since anyone can call the server):
// - personal details and upsetting things are never sent to the AI, and get
//   Buddy's scripted lines instead (script.ts)
// - the AI's answer is thrown away if it breaks a rule (`answerProblem`), and the
//   kid is sent to a grown-up instead
// Tests in askRules.test.ts; add one for every new rule.

// Personal details: the kid's own email, phone number, home address, password or
// login code, name or school. Kept strict: a false alarm only means Buddy says
// "don't share that" instead of answering.
const PERSONAL = [
  /[^\s@]+@[^\s@]+\.[a-z]{2,}/i, // an email address
  /(\+?\d[\s().-]*){7,}/, // a phone number (7 or more digits)
  /\b(code|pin|passcode)\b\D{0,15}\d{4,}/i, // a login code
  /\bmy (password|pass|pin|passcode|login)( is|\s*[:=])/i,
  /\b\d+\s+([a-z]+\s+){1,3}(street|st|road|rd|avenue|ave|lane|ln|drive|dr|court|ct|way|close|crescent|place|pl|boulevard|blvd)\b/i,
  /\bi live (at|on)\b/i,
  /\bmy (full |real |last )?(name|address|school|phone number|number|email|username) is\b/i,
  /\bi go to \w+( \w+)? (school|elementary|primary|middle|academy)\b/i,
]

export const hasPersonalDetails = (text: string) => PERSONAL.some((rule) => rule.test(text))

// Things a kid needs a real grown-up for straight away: hurting themselves,
// someone asking for private photos, touching, bullying, threats
const UPSET = [
  /\b(kill(ing)?|hurt(ing)?|cut(ting)?) myself\b/i,
  /\b(want|wanna) to die\b|\bsuicid\w*|\bself[- ]harm/i,
  /\b(nudes?|naked)\b/i,
  /\b(send|sent|asked for|asking for|wants?) (me )?(a |some |my )?(private|secret) (photos?|pics?|pictures?|videos?)\b/i,
  /\btouch(ed|es|ing)? me\b/i,
  /\bbull(y|ied|ies|ying)\b/i,
  /\b(threaten\w*|blackmail\w*)\b/i,
]

export const soundsUpset = (text: string) => UPSET.some((rule) => rule.test(text))

// What the AI must never say to a kid
const NEVER = [
  { rule: /[^\s@]+@[^\s@]+\.[a-z]{2,}/i, why: 'an email address' },
  { rule: /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|gg|co|xyz|info|app|me|ly|uk)\b/i, why: 'a link' },
  { rule: /(\+?\d[\s().-]*){7,}/, why: 'a phone number' },
  { rule: /\p{Extended_Pictographic}/u, why: 'an emoji' },
  // "Safe" at all, except in "stay safe", "staying safe" or "keep you safe"
  { rule: /(?<!\b(stay|stays|staying|keep you|keeps you|keeping you|keep yourself)\s)\bsafe(ly)?\b/i, why: 'says something is safe or real' },
  // Saying something is real, fine or legit
  {
    rule: /\b(it'?s|it is|that'?s|that is|this is|they'?re|they are|is|are|looks|seems|sounds|totally|completely|definitely|probably|100%)\s+(safe|real|legit|legitimate|genuine|trustworthy|fine)\b(?!\s+to\b)/i,
    why: 'says something is safe or real',
  },
  {
    rule: /\b(not a scam|isn'?t a scam|nothing to worry|no need to worry|(stop|don'?t|do not) worry(ing)?|you can trust (it|them|this|that)|go ahead)\b/i,
    why: 'says not to worry',
  },
  // Scary
  { rule: /\b(kill\w*|die|dead|death|kidnap\w*|stalk\w*|find you|come to your house|police|jail|arrest\w*|hacker\w* will)\b/i, why: 'scary words' },
]

// Free game money is always a scam, so Buddy says so in no uncertain terms. A
// question about it needs a bubble that names it and says "always", "never",
// "only", "no such thing" or "doesn't exist" (e.g. "Free Robux is always a scam",
// "Real Robux only come from Roblox"); a softer answer ("a common trick") isn't shown.
const GAME_MONEY = /\b(robux|v-?\s?bucks|minecoins)\b/i
const FREE = /\b(free|generators?|gen|hacks?|unlimited|giveaways?|giving away|glitch)\b/i
const ABSOLUTE = /\b(always|never|only|no such thing|(does not|doesn'?t|do not|don'?t) exist)\b/i

export const asksAboutFreeGameMoney = (text: string) => GAME_MONEY.test(text) && FREE.test(text)

export const saysItPlainly = (lines: string[]) => lines.some((line) => GAME_MONEY.test(line) && ABSOLUTE.test(line))

// The longest bubble (about 25 words), and the most bubbles
const MAX_LINE = 160
const MAX_LINES = 3

// Why an AI answer to `question` can't be shown to a kid, or null if it can
export function answerProblem(lines: string[], question = ''): string | null {
  if (!lines.length) return 'no answer'
  if (asksAboutFreeGameMoney(question) && !saysItPlainly(lines)) return "doesn't say free game money is always a scam"
  if (lines.length > MAX_LINES) return 'too many bubbles'
  for (const line of lines) {
    if (line.length > MAX_LINE) return 'a bubble is too long'
    const broken = NEVER.find(({ rule }) => rule.test(line))
    if (broken) return broken.why
    if (hasPersonalDetails(line)) return 'personal details'
  }
  return null
}
