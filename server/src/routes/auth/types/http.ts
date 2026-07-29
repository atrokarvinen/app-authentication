type ApiAuthProvider = 'Credentials' | 'Google' | 'Facebook' | 'Microsoft'

export type ApiUserStatus = 'Active' | 'Pending' | 'Suspended'

export type UserDto = {
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
