import type { AuthProvider, UserStatus } from '@prisma/client'

export type DbUserEmail = {
  email: string
  isPrimary: boolean
  createdAt: Date
}

export type DbUserRole = {
  role: {
    name: string
  }
}

export type DbUserIdentity = {
  provider: AuthProvider
  passwordHash: string | null
}

export type DbUserProfile = {
  id: string
  displayName: string
  status: UserStatus
  emails: DbUserEmail[]
  roles: DbUserRole[]
}

export type DbUserWithIdentities = DbUserProfile & {
  identities: DbUserIdentity[]
}