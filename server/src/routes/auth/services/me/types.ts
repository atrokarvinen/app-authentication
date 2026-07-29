import type { UserDto } from '../../types/http'

export type MeResponseBody = {
  user: UserDto
}

export type MeArgs = {
  sessionToken: string | null
}

export type MeResult = {
  result: MeResponseBody
  logMeta: Record<string, unknown>
}
