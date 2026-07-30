import type { UserDto } from '../../types/http'

export type CurrentUserResponseBody = {
  user: UserDto
}

export type CurrentUserArgs = {
  sessionToken: string | null
}

export type CurrentUserResult = {
  result: CurrentUserResponseBody
  logMeta: Record<string, unknown>
}
