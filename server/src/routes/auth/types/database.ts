import type { AuthProvider, UserStatus } from '@prisma/client'

type DbUserEmail = {
  email: string
  isPrimary: boolean
  createdAt: Date
}

type DbUserRole = {
  role: {
    name: string
  }
}

type DbUserIdentity = {
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
