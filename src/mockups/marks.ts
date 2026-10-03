import { createContext } from 'react'

export type Mark = { target: string; highlight?: string; state: 'active' | 'seen' }

// The recap passes the red flags to highlight; mock-ups render content through <Field>.
export const MarksContext = createContext<Mark[]>([])
