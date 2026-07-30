import { normalizeEmail } from '../authShared'
import { AuthServiceError } from '../errors'
import { exchangeFacebookCode, fetchFacebookUserInfo } from './facebook-api'
import type { ResolvedFacebookIdentity } from './types'

export function getCodeAndRedirectUriFromBody(body: {
  code?: unknown
  redirectUri?: unknown
}): { code: string; redirectUri: string } {
  const code = typeof body.code === 'string' ? body.code : ''
  const redirectUri =
    typeof body.redirectUri === 'string' ? body.redirectUri : ''

  if (!code || !redirectUri) {
    throw new AuthServiceError(
      'Facebook authorization code and redirect URI are required.',
      400,
      'auth.facebook.invalid_payload'
    )
  }

  return { code, redirectUri }
}

export function assertFacebookClientConfigured(
  facebookAppId: string,
  facebookAppSecret: string
): void {
  if (!facebookAppId || !facebookAppSecret) {
    throw new AuthServiceError(
      'Facebook sign-in is not configured.',
      500,
      'auth.facebook.misconfigured'
    )
  }
}

export async function resolveFacebookIdentity(params: {
  code: string
  redirectUri: string
  facebookAppId: string
  facebookAppSecret: string
}): Promise<ResolvedFacebookIdentity> {
  const accessToken = await exchangeFacebookCode({
    code: params.code,
    redirectUri: params.redirectUri,
    appId: params.facebookAppId,
    appSecret: params.facebookAppSecret,
  })

  const profile = await fetchFacebookUserInfo(accessToken)
  const providerUserId = profile.id || ''
  const email = normalizeEmail(profile.email || '')

  if (!providerUserId) {
    throw new AuthServiceError(
      'Facebook account information is incomplete.',
      401,
      'auth.facebook.invalid_profile'
    )
  }

  if (!email) {
    throw new AuthServiceError(
      'A verified email address is required to sign in with Facebook. Please ensure your Facebook account has a confirmed email and that you granted email permissions.',
      401,
      'auth.facebook.email_required'
    )
  }

  return { email, providerUserId, profile, accessToken }
}
