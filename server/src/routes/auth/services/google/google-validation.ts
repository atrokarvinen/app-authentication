import { normalizeEmail } from '../authShared'
import { AuthServiceError } from '../errors'
import { fetchGoogleTokenInfo, fetchGoogleUserInfo } from './google-api'
import { isVerifiedEmail } from './google-helpers'
import type { GoogleUserInfoResponse } from './types'

export type ResolvedGoogleIdentity = {
  email: string
  providerUserId: string
  profile: GoogleUserInfoResponse
}

export function getAccessTokenFromBody(body: {
  accessToken?: unknown
}): string {
  const accessToken =
    typeof body.accessToken === 'string' ? body.accessToken : ''

  if (!accessToken) {
    throw new AuthServiceError(
      'Google access token is required.',
      400,
      'auth.google.invalid_payload'
    )
  }

  return accessToken
}

export function assertGoogleClientConfigured(googleClientId: string): void {
  if (!googleClientId) {
    throw new AuthServiceError(
      'Google sign-in is not configured.',
      500,
      'auth.google.misconfigured'
    )
  }
}

export async function resolveGoogleIdentity(params: {
  accessToken: string
  googleClientId: string
}): Promise<ResolvedGoogleIdentity> {
  const tokenInfo = await fetchGoogleTokenInfo(params.accessToken)

  if (
    tokenInfo.aud !== params.googleClientId ||
    !isVerifiedEmail(tokenInfo.email_verified)
  ) {
    throw new AuthServiceError(
      'Google sign-in token is not valid for this application.',
      401,
      'auth.google.invalid_token'
    )
  }

  const profile = await fetchGoogleUserInfo(params.accessToken)
  const email = normalizeEmail(profile.email || tokenInfo.email || '')
  const providerUserId = tokenInfo.sub || profile.sub || ''

  if (!email || !providerUserId) {
    throw new AuthServiceError(
      'Google account information is incomplete.',
      401,
      'auth.google.invalid_profile'
    )
  }

  return {
    email,
    providerUserId,
    profile,
  }
}
