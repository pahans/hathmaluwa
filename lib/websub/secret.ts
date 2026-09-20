import { randomBytes } from 'crypto'

export function generateSubscriptionSecret(): string {
  return randomBytes(32).toString('hex')
}
