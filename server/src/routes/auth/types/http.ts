export type ApiAuthProvider =
  | 'Credentials'
  | 'Google'
  | 'Facebook'
  | 'Microsoft'

export type ApiUserStatus = 'Active' | 'Pending' | 'Suspended'

export type PublicUserResponse = {
  id: string
  displayName: string
  email: string
  authProvider: ApiAuthProvider
  role: string
  status: ApiUserStatus
}

export type ErrorResponse = {
  error: string
}

export type RegisterRequestBody = {
  displayName: string
  email: string
  password: string
}

export type RegisterResponseBody = {
  user: PublicUserResponse
  sessionToken: string
}

export type LoginRequestBody = {
  email: string
  password: string
}

export type LoginResponseBody = {
  user: PublicUserResponse
  sessionToken: string
}

export type LogoutRequestBody = {
  sessionToken?: string
}

export type LogoutResponseBody = {
  success: true
}

export type MeResponseBody = {
  user: PublicUserResponse
}