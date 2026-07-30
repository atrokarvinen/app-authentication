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
