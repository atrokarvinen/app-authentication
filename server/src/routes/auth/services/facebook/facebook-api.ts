import { AuthServiceError } from '../errors'
import type { FacebookUserInfoResponse } from './types'

type CodeExchangeResponse = {
  access_token?: string
  error?: {
    message?: string
    type?: string
    code?: number
    fbtrace_id?: string
  }
}

export async function exchangeFacebookCode(params: {
  code: string
  redirectUri: string
  appId: string
  appSecret: string
}): Promise<string> {
  // POST with form body is the official Facebook recommendation for code exchange
  const body = new URLSearchParams({
    client_id: params.appId,
    redirect_uri: params.redirectUri,
    client_secret: params.appSecret,
    code: params.code,
  })

  const response = await fetch(
    'https://graph.facebook.com/v21.0/oauth/access_token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }
  )
  const data = (await response
    .json()
    .catch(() => null)) as CodeExchangeResponse | null

  if (!response.ok || !data?.access_token) {
    throw new AuthServiceError(
      'Facebook sign-in could not be completed.',
      401,
      'auth.facebook.code_exchange_failed',
      { facebookError: data?.error, httpStatus: response.status }
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
