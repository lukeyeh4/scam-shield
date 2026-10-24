import type { Clue } from './examples'

// What Shield Buddy says when a kid taps "Why? Ask Shield Buddy" on a clue
// (Result.tsx): where to look, why it's a warning sign in a couple of short
// lines, and what to do next time. Always scripted, never generated, and always
// with a grown-up. Picture and message clues carry their own lines (Clue.why, from
// pictureLookup.ts); the link checker's clues are looked up here by their name.

// The link checker's clues (linkCheck.ts, linkLookup.ts), by name or its start
const LINK_WHY: [string, string[]][] = [
  ['Pretending to be ', ['Scammers make addresses that look like a real website.', "The website's real name is the part just before the ending, like .com.", 'Next time, check that part carefully. Ask a grown-up if you are not sure.']],
  ['Uses ', ['Anyone can put a famous name in a website address.', "It doesn't mean the website belongs to them.", 'Next time, ask a grown-up to find the real website with you.']],
  ['Some letters are fakes', ['Some letters from other alphabets look just like ours.', 'Scammers use them to copy real addresses.', 'Next time, if an address looks odd, show a grown-up.']],
  ['The address is hiding something', ['In a web address, everything before an @ is ignored.', 'Scammers put a real name there to fool you.', 'Next time, look after the @. Ask a grown-up if you are not sure.']],
  ['No website name', ['Real websites have names, like roblox.com.', 'A link that is only numbers hides who owns it.', "Don't tap it. Show a grown-up."]],
  ['Made with a free website maker', ['Anyone can make a free website in minutes.', 'Nobody checks who made it, so scammers use them.', 'Next time, ask a grown-up before you type anything on one.']],
  ['A short link', ["Short links hide the real address.", "You can't see where they go until you tap.", 'Next time, ask a grown-up to check it first.']],
  ['A very long address', ["Only the end of an address tells you whose website it is.", 'Long addresses push the real name out of sight.', 'Next time, look at the end. A grown-up can help.']],
  ["A real website's name in the wrong place", ["A real website's name later in a link doesn't change where it goes.", "It's only there to look real.", 'Ask a grown-up if you are not sure.']],
  ['An unusual ending', ['Some address endings are very cheap to buy.', 'Scammers buy lots of them for fake websites.', 'Next time, be careful with odd endings and ask a grown-up.']],
  ['Words that tempt you', ["Words like 'free' or 'claim' make you excited.", 'Scammers use them so you tap without thinking.', 'Next time, stop and ask a grown-up.']],
  ['Not a safe connection', ["Websites that start with http aren't private.", 'Other people could see what you type.', 'Never type a password there. Ask a grown-up.']],
  ['On a list of dangerous websites', ['Safety experts check millions of websites.', 'They found this one is dangerous.', "Don't open it. Show a grown-up."]],
  ['The short link has a warning', ['The short link company itself warned about this link.', "That's a big sign it isn't safe.", "Don't open it. Show a grown-up."]],
  ['A brand-new website', ['Scam websites are often brand new.', 'Old ones get reported and shut down, so scammers keep making new ones.', 'Ask a grown-up before you use it.']],
  ['A new website', ['Scam websites are often new.', 'Most real websites have been around for years.', 'Ask a grown-up before you use it.']],
  ["This website can't be found", ["There's no website at this address right now.", 'Scam websites often disappear fast.', 'If someone sent it to you, show a grown-up.']],
  ['Copies ', ["This page copies a real company's name or look.", "But it's on a different website.", "Don't type anything. Show a grown-up."]],
  ['Asks for private things', ['Passwords and card details are like keys.', 'Never type them on a website someone sent you a link to.', 'Show a grown-up first.']],
  ['Free prizes', ["Nobody gives free prizes to people they don't know.", "It's bait, like a worm on a fishing hook.", 'Next time, ask a grown-up before you tap.']],
  ['A deal too good to be true', ['Prices that are much too low are a trick.', 'Fake shops take the money and send nothing.', 'Next time, ask a grown-up before buying.']],
  ['Wants you to download something', ['Downloads from strangers can hide bad apps.', 'They can spy on you or break your device.', 'Next time, ask a grown-up before downloading anything.']],
  ['Rushing you', ["When you hurry, you don't have time to think.", 'Real offers can wait.', 'Next time, take a breath and ask a grown-up.']],
  ['Free shows or sports without paying', ["Websites that give away paid shows for free don't have permission.", "They're full of tricky ads.", 'Ask a grown-up for a safe way to watch.']],
  ['Tricky ads', ['Some ads pretend to be buttons, like Play or Download.', 'Tapping them can take you to scams.', 'Next time, ask a grown-up which button is real.']],
  ['A betting website', ['This website is made for grown-ups.', "It isn't a place for kids.", "Don't open it. Show a grown-up."]],
  ['Not for kids', ['This website is made for grown-ups.', "It isn't a place for kids.", "Don't open it. Show a grown-up."]],
  ["Couldn't look inside", ["This website wouldn't let me look at it.", "So I can't tell what's on it.", 'Ask a grown-up before you open it.']],
  ["Couldn't check it", ["I couldn't check this one properly.", 'A grown-up can look at it with you.']],
  ['Hard to read', ["I couldn't read this picture well.", 'Try a clearer screenshot, or look at it with a grown-up.']],
]

// What Buddy says about the clue numbered `number`: where to look, then its lines
// (or, for a clue with none, its reason and a grown-up)
export function buddyWhy(clue: Clue, number: number): string[] {
  const lines =
    clue.why ??
    LINK_WHY.find(([name]) => (name.endsWith(' ') ? clue.label.startsWith(name) : clue.label === name))?.[1] ??
    [clue.reason, "If you're still not sure, ask a grown-up."]
  const where = clue.boxes?.length ? `Look at number ${number} on the picture.` : clue.highlight ? `Look at number ${number}, in yellow.` : null
  return where ? [where, ...lines] : lines
}

// The clue names that have lines here (for tests)
export const LINK_WHY_NAMES = LINK_WHY.map(([name]) => name)
