import { AuthServiceError } from '../errors'
import { GoogleTokenInfoResponse, GoogleUserInfoResponse } from './types'

export async function fetchGoogleTokenInfo(
  accessToken: string
): Promise<GoogleTokenInfoResponse> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
  )

  if (!response.ok) {
    throw new AuthServiceError(
      'Google sign-in token could not be verified.',
      401,
      'auth.google.invalid_token'
    )
  }

  return (await response.json()) as GoogleTokenInfoResponse
}

export async function fetchGoogleUserInfo(
  accessToken: string
): Promise<GoogleUserInfoResponse> {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new AuthServiceError(
      'Google account profile could not be loaded.',
      502,
      'auth.google.profile_unavailable'
    )
  }

  return (await response.json()) as GoogleUserInfoResponse
}
