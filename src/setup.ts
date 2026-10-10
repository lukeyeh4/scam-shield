import { storedSwitch } from './storedSwitch'

// Parent setup: until a grown-up agrees to how checks work (GrownUpsScreen),
// nothing is sent anywhere. The game always works; the link checker only checks on
// the device; Shield Buddy doesn't answer questions or listen; the picture and
// message checkers ask the kid to get a grown-up first (SetupFirst).
//
// The challenge build starts already set up, so it works on first open: set
// VITE_SET_UP_BY_DEFAULT=true in .env.production. That also turns on Buddy's
// answers to questions (chat/askBuddy.ts). A grown-up can still turn either off.
export const SET_UP_BY_DEFAULT = import.meta.env.VITE_SET_UP_BY_DEFAULT === 'true'

const agreed = storedSwitch('scam-shield-set-up', SET_UP_BY_DEFAULT)

export const isSetUp = agreed.get
export const setSetUp = agreed.set
export const useSetUp = agreed.use
