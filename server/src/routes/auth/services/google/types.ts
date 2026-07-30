import type { UserDto } from '../../types/http'

export type GoogleSignInArgs = {
  body: Partial<GoogleSignInRequestBody>
  ipAddress: string | null
  userAgent: string | null
}

export type GoogleSignInResult = {
  result: GoogleSignInResponseBody
  logMeta: Record<string, unknown>
}

type GoogleSignInRequestBody = {
  accessToken: string
}

type GoogleSignInResponseBody = {
  user: UserDto
  sessionToken: string
}

export type GoogleTokenInfoResponse = {
  aud?: string
  email?: string
  email_verified?: string | boolean
  sub?: string
}

export type GoogleUserInfoResponse = {
  email?: string
  email_verified?: boolean
  name?: string
  given_name?: string
  picture?: string
  sub?: string
}
