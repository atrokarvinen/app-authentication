import type { UserDto } from '../../types/http'

export type MicrosoftSignInArgs = {
  body: Partial<MicrosoftSignInRequestBody>
  ipAddress: string | null
  userAgent: string | null
}

export type MicrosoftSignInResult = {
  result: MicrosoftSignInResponseBody
  logMeta: Record<string, unknown>
}

type MicrosoftSignInRequestBody = {
  accessToken: string
}

type MicrosoftSignInResponseBody = {
  user: UserDto
  sessionToken: string
}

export type MicrosoftUserInfoResponse = {
  id?: string
  displayName?: string
  givenName?: string
  surname?: string
  mail?: string
  userPrincipalName?: string
}

export type ResolvedMicrosoftIdentity = {
  email: string
  providerUserId: string
  profile: MicrosoftUserInfoResponse
}
