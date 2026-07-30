import type { FacebookUserInfoResponse } from './types'

export function buildDisplayName(
  profile: FacebookUserInfoResponse,
  email: string
): string {
  return profile.name?.trim() || email.split('@')[0] || 'Facebook User'
}
