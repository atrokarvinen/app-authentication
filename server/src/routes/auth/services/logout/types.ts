export type LogoutRequestBody = {
  sessionToken?: string
}

export type LogoutResponseBody = {
  success: true
}

export type LogoutArgs = {
  sessionToken: string | null
}

export type LogoutResult = {
  revokedCount: number
}