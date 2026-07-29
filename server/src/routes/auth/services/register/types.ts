import type { UserDto } from '../../types/http'

export type RegisterArgs = {
  body: Partial<RegisterRequestBody>
  ipAddress: string | null
  userAgent: string | null
}

export type RegisterResult = {
  result: RegisterResponseBody
  logMeta: Record<string, unknown>
}

type RegisterRequestBody = {
  displayName: string
  email: string
  password: string
}

type RegisterResponseBody = {
  user: UserDto
  sessionToken: string
}
