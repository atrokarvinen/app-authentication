import { AuthServiceError } from '../errors'
import type { MicrosoftUserInfoResponse } from './types'

export async function fetchMicrosoftUserInfo(
  accessToken: string
): Promise<MicrosoftUserInfoResponse> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new AuthServiceError(
      'Microsoft account profile could not be loaded.',
      502,
      'auth.microsoft.profile_unavailable'
    )
  }

  return (await response.json()) as MicrosoftUserInfoResponse
}
