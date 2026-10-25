// Prompt caching: each check's instructions are the same every time, so they're
// marked to be kept for 5 minutes (renewed on every use). A request within that
// time reads them at a small part of the usual price, instead of paying for them
// again. They must never change between requests (no dates or ids in them), or
// nothing is reused. Too-short instructions just aren't kept: no error.
export const cachedSystem = (text: string) => [{ type: 'text' as const, text, cache_control: { type: 'ephemeral' as const } }]
