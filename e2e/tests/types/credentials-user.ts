export type CredentialsUser = {
  displayName: string
  email: string
  password: string
}

export function createCredentialsUser(prefix: string): CredentialsUser {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return {
    displayName: `${prefix} ${uniqueSuffix}`,
    email: `${prefix.toLowerCase()}-${uniqueSuffix}@example.com`,
    password: 'Password123!',
  }
}
