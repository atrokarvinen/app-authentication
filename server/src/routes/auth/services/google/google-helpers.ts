import type { GoogleUserInfoResponse } from './types'

export function isVerifiedEmail(value: string | boolean | undefined): boolean {
  return value === true || value === 'true'
}

export function buildDisplayName(
  profile: GoogleUserInfoResponse,
  email: string
): string {
  return (
    profile.name?.trim() ||
    profile.given_name?.trim() ||
    email.split('@')[0] ||
    'Google User'
  )
}
