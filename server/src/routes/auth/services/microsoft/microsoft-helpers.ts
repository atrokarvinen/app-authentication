import type { MicrosoftUserInfoResponse } from './types'

export function buildDisplayName(
  profile: MicrosoftUserInfoResponse,
  email: string
): string {
  return (
    profile.displayName?.trim() ||
    profile.givenName?.trim() ||
    email.split('@')[0] ||
    'Microsoft User'
  )
}
