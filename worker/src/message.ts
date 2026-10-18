import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import { isSign, type MessageFacts, SIGNS } from '../../src/tools/pictureSigns'
import { MAX_CONTEXT, PICTURE_MODEL, SIGN_RULES } from './picture'

// Check a message: Claude reads a text, chat, email or post a kid pasted, and
// answers the same fixed questions as for pictures (picture.ts), quoting the exact
// words that show each warning sign. The app has already blanked out phone numbers,
// emails, addresses and codes; it words everything kids read, highlights the
// quoted words, and runs the links through the link checker. Nothing is kept.

// The longest message checked (the app cuts it to this too)
export const MAX_MESSAGE = 2000

const Answers = z.object({
  kind: z.enum(['text message', 'chat or game chat', 'email', 'social media post', 'other']),
  signs: z
    .array(
      z.object({
        sign: z.string().describe(`Exactly one of: ${SIGNS.map((x) => `"${x}"`).join(', ')}`),
        words: z
          .string()
          .describe('The exact words in the message that show this sign, copied character for character (at most a sentence), so they can be found in it'),
      }),
    )
    .describe('Each warning sign the message shows, once per place it appears. Empty if there are none'),
  links: z
    .array(z.string())
    .describe(
      'Every web address or link in the message, copied letter by letter exactly as written. Never correct it: scam addresses use look-alike letters on purpose (dlscord, rnicrosoft, g00gle, paypa1)',
    ),
  threatOrPhotos: z
    .boolean()
    .describe(
      'A person threatens to hurt, embarrass or expose the reader, or to share or tell things about them, unless they do something (blackmail), or asks them for photos or videos of themselves. Not a company warning that an account will be locked or closed',
    ),
})

const SYSTEM = `You check messages for a safety app used by children aged 8 to 12. A child pasted a message that worried them: a text, a game chat, an email or a post. Phone numbers, emails, addresses and codes may have been replaced with [phone], [email], [address] or [code].
${SIGN_RULES}`

const DECLINED: MessageFacts = { kind: 'other', signs: [], links: [], threatOrPhotos: true, declined: true }

type Message = { text: string; context?: string }

export async function judgeMessage(message: Message, apiKey: string, model = PICTURE_MODEL): Promise<MessageFacts | null> {
  const client = new Anthropic({ apiKey, timeout: 20000, maxRetries: 1 })
  const strip = (text: string) => text.replace(/[<>]/g, '')
  const response = await client.messages.parse({
    model,
    max_tokens: 3000,
    system: SYSTEM,
    output_config: { effort: 'low', format: zodOutputFormat(Answers) },
    messages: [
      {
        role: 'user',
        content: [
          'Check this message.',
          `<message>${strip(message.text)}</message>`,
          ...(message.context ? [`<child_note>${strip(message.context)}</child_note>`] : []),
        ].join('\n'),
      },
    ],
  })
  // Why there's no answer (never what's in the message), for `wrangler tail`
  if (response.stop_reason === 'refusal') {
    console.warn('message: declined', response.stop_details?.category ?? '')
    return DECLINED
  }
  const answers = response.parsed_output
  if (!answers) {
    console.warn('message: no answer', response.stop_reason)
    return null
  }
  return { ...answers, signs: answers.signs.flatMap(({ sign, words }) => (isSign(sign) ? [{ sign, words }] : [])) }
}

// The message from a request body: { text, context? }. Null if it isn't one.
export function readMessage(body: unknown): Message | null {
  const { text, context } = (body ?? {}) as { text?: unknown; context?: unknown }
  if (typeof text !== 'string' || !text.trim()) return null
  const note = typeof context === 'string' ? context.trim().slice(0, MAX_CONTEXT) : ''
  return { text: text.trim().slice(0, MAX_MESSAGE), ...(note ? { context: note } : {}) }
}
