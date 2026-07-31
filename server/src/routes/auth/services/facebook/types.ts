import type { UserDto } from '../../types/http'

export type FacebookSignInArgs = {
  body: Partial<FacebookSignInRequestBody>
  ipAddress: string | null
  userAgent: string | null
}

export type FacebookSignInResult = {
  result: FacebookSignInResponseBody
  logMeta: Record<string, unknown>
}

type FacebookSignInRequestBody = {
  code: string
  redirectUri: string
}

type FacebookSignInResponseBody = {
  user: UserDto
  sessionToken: string
}

export type FacebookUserInfoResponse = {
  id?: string
  name?: string
  email?: string
}

export type ResolvedFacebookIdentity = {
  email: string
  providerUserId: string
  profile: FacebookUserInfoResponse
  accessToken: string
}
