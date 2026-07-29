export type AuthProvider = 'Credentials' | 'Google' | 'Facebook' | 'Microsoft'

export type UserProfile = {
  displayName: string
  email: string
  authProvider: AuthProvider
  role: string
}
