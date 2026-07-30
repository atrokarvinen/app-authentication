import { AuthServiceError } from '../errors'
import type { FacebookUserInfoResponse } from './types'

type CodeExchangeResponse = {
  access_token?: string
}

export async function exchangeFacebookCode(params: {
  code: string
  redirectUri: string
  appId: string
  appSecret: string
}): Promise<string> {
  const url = new URL('https://graph.facebook.com/v21.0/oauth/access_token')
  url.searchParams.set('client_id', params.appId)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('client_secret', params.appSecret)
  url.searchParams.set('code', params.code)

  const response = await fetch(url)

  if (!response.ok) {
    throw new AuthServiceError(
      'Facebook sign-in could not be completed.',
      401,
      'auth.facebook.code_exchange_failed'
    )
  }

  const data = (await response.json()) as CodeExchangeResponse

  if (!data.access_token) {
    throw new AuthServiceError(
      'Facebook sign-in did not return an access token.',
      401,
      'auth.facebook.invalid_token_response'
    )
  }

  return data.access_token
}

export async function fetchFacebookUserInfo(
  accessToken: string
): Promise<FacebookUserInfoResponse> {
  const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new AuthServiceError(
      'Facebook account profile could not be loaded.',
      502,
      'auth.facebook.profile_unavailable'
    )
  }

  return (await response.json()) as FacebookUserInfoResponse
}
