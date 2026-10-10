// Brands kids use, with their verified official websites and the names scammers
// copy. `domains` are registered domains (what's left of an address once its
// subdomains are taken off, so mail.google.com counts as google.com); the first
// is the one shown to kids as "the real website". Only add domains the brand
// really owns: a domain here is trusted and gets "This is the real ... website".
//
// `words` are matched against the parts of a website's name. Short ones (under 5
// letters) only count as a whole part, so they don't catch everyday words.
//
// `fans`: games and shows that have lots of fan websites (roblox.fandom.com,
// planetminecraft.com), so their name in someone else's address is only a
// smaller clue. Nobody makes fan websites for accounts and money (PayPal,
// WhatsApp, Apple), so their name anywhere else is always a strong one.

export type Brand = { name: string; domains: string[]; words: string[]; fans?: true }

export const BRANDS: Brand[] = [
  { name: 'Roblox', domains: ['roblox.com', 'rbxcdn.com', 'robloxlabs.com', 'rbx.com'], words: ['roblox', 'robux', 'rbx'], fans: true },
  {
    name: 'YouTube',
    domains: ['youtube.com', 'youtu.be', 'youtubekids.com', 'youtube-nocookie.com'],
    words: ['youtube'],
  },
  {
    name: 'Google',
    domains: [
      'google.com', 'gmail.com', 'goo.gl', 'g.co', 'google.co.uk', 'google.ca', 'google.com.au', 'google.co.nz', 'google.ie',
      'google.de', 'google.fr', 'google.es', 'google.it', 'google.nl', 'google.co.in', 'google.com.br', 'google.co.jp',
    ],
    words: ['google', 'gmail'],
  },
  { name: 'Apple', domains: ['apple.com', 'icloud.com', 'me.com', 'apple.co'], words: ['apple', 'icloud', 'appleid'] },
  { name: 'Minecraft', domains: ['minecraft.net', 'microsoft.com', 'xbox.com'], words: ['minecraft'], fans: true },
  { name: 'Xbox', domains: ['xbox.com', 'microsoft.com'], words: ['xbox'], fans: true },
  {
    name: 'Microsoft',
    domains: [
      'microsoft.com', 'microsoftonline.com', 'live.com', 'outlook.com', 'office.com', 'hotmail.com', 'xbox.com',
      'minecraft.net', 'bing.com', 'msn.com',
    ],
    words: ['microsoft', 'outlook', 'hotmail'],
  },
  { name: 'Fortnite', domains: ['fortnite.com', 'epicgames.com'], words: ['fortnite', 'epicgames', 'vbucks'], fans: true },
  {
    name: 'Discord',
    domains: ['discord.com', 'discord.gg', 'discord.gift', 'discordapp.com', 'discordapp.net', 'discord.new'],
    words: ['discord'],
    // Server lists and bot websites
    fans: true,
  },
  { name: 'TikTok', domains: ['tiktok.com'], words: ['tiktok'] },
  { name: 'Instagram', domains: ['instagram.com', 'instagr.am'], words: ['instagram'] },
  { name: 'Snapchat', domains: ['snapchat.com', 'snap.com'], words: ['snapchat'] },
  { name: 'Netflix', domains: ['netflix.com'], words: ['netflix'] },
  {
    name: 'Amazon',
    domains: ['amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.com.au', 'amazon.de', 'amazon.in', 'amzn.to', 'primevideo.com'],
    words: ['amazon'],
  },
  { name: 'PayPal', domains: ['paypal.com', 'paypal.me'], words: ['paypal'] },
  { name: 'Steam', domains: ['steampowered.com', 'steamcommunity.com'], words: ['steampowered', 'steamcommunity'] },
  { name: 'PlayStation', domains: ['playstation.com', 'playstation.net'], words: ['playstation'], fans: true },
  { name: 'Nintendo', domains: ['nintendo.com', 'nintendo.net', 'nintendo.co.uk', 'nintendo.co.jp'], words: ['nintendo'], fans: true },
  { name: 'WhatsApp', domains: ['whatsapp.com', 'whatsapp.net', 'wa.me'], words: ['whatsapp'] },
  { name: 'Facebook', domains: ['facebook.com', 'fb.com', 'fb.me', 'messenger.com'], words: ['facebook'] },
  { name: 'Spotify', domains: ['spotify.com', 'spoti.fi'], words: ['spotify'] },
  { name: 'Twitch', domains: ['twitch.tv'], words: ['twitch'], fans: true },
  { name: 'Pokémon', domains: ['pokemon.com'], words: ['pokemon'], fans: true },
  { name: 'Disney', domains: ['disney.com', 'disneyplus.com', 'go.com'], words: ['disney', 'disneyplus'], fans: true },
]

// The brand whose official website this is, if any
export const officialBrand = (domain: string) => BRANDS.find((b) => b.domains.includes(domain))

// The brand with this name (any capitals or accents), e.g. as the AI names it
export const brandNamed = (name: string) => {
  const simple = (text: string) => text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  return BRANDS.find((b) => simple(b.name) === simple(name))
}

// Real words one letter away from a brand, which aren't typos of it
export const NEAR_BRAND_WORDS = new Set(['discard', 'switch', 'youtuber', 'googly'])

// Brand words that are also everyday words, so they don't count inside a longer
// name (apple is in pineapple)
export const EVERYDAY_WORDS = new Set(['apple', 'outlook'])
