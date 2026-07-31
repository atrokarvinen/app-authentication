import { normalizeEmail } from '../authShared'
import { AuthServiceError } from '../errors'
import { fetchMicrosoftUserInfo } from './microsoft-api'
import type { ResolvedMicrosoftIdentity } from './types'

export function getAccessTokenFromBody(body: {
  accessToken?: unknown
}): string {
  const accessToken =
    typeof body.accessToken === 'string' ? body.accessToken : ''

  if (!accessToken) {
    throw new AuthServiceError(
      'Microsoft access token is required.',
      400,
      'auth.microsoft.invalid_payload'
    )
  }

  return accessToken
}

export async function resolveMicrosoftIdentity(params: {
  accessToken: string
}): Promise<ResolvedMicrosoftIdentity> {
  const profile = await fetchMicrosoftUserInfo(params.accessToken)

  const email = normalizeEmail(profile.mail || profile.userPrincipalName || '')
  const providerUserId = profile.id || ''

  if (!email || !providerUserId) {
    throw new AuthServiceError(
      'Microsoft account information is incomplete.',
      401,
      'auth.microsoft.invalid_profile'
    )
  }

  return {
    email,
    providerUserId,
    profile,
  }
}
