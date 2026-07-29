import type { UserDto } from '../../types/http'

export type LoginArgs = {
  body: Partial<LoginRequestBody>
  ipAddress: string | null
  userAgent: string | null
}

export type LoginResult = {
  result: LoginResponseBody
  logMeta: Record<string, unknown>
}

type LoginRequestBody = {
  email: string
  password: string
}

type LoginResponseBody = {
  user: UserDto
  sessionToken: string
}
