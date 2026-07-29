import { AuthProvider, UserStatus } from '@prisma/client'
import type { Request } from 'express'
import type { DbUserProfile } from '../types/database'
import type { ApiUserStatus, UserDto } from '../types/http'
import type { LogoutRequestBody } from './logout/types'

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function providerToClient(provider: AuthProvider): UserDto['authProvider'] {
  switch (provider) {
    case AuthProvider.CREDENTIALS:
      return 'Credentials'
    case AuthProvider.GOOGLE:
      return 'Google'
    case AuthProvider.FACEBOOK:
      return 'Facebook'
    case AuthProvider.MICROSOFT:
      return 'Microsoft'
    default:
      return 'Credentials'
  }
}

function statusToClient(status: UserStatus): ApiUserStatus {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'Active'
    case UserStatus.PENDING:
      return 'Pending'
    case UserStatus.SUSPENDED:
      return 'Suspended'
    default:
      return 'Pending'
  }
}

export function toUserDto(params: {
  user: DbUserProfile
  provider: AuthProvider
}): UserDto {
  const primaryEmail =
    params.user.emails.find((entry) => entry.isPrimary)?.email ||
    params.user.emails[0]?.email ||
    ''

  return {
    id: params.user.id,
    displayName: params.user.displayName,
    email: primaryEmail,
    authProvider: providerToClient(params.provider),
    role: params.user.roles[0]?.role.name || 'member',
    status: statusToClient(params.user.status),
  }
}

export function getSessionTokenFromRequest(
  request: Pick<Request, 'get' | 'body'> & { body?: LogoutRequestBody }
): string | null {
  const authHeader = request.get('authorization')

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  if (typeof request.body?.sessionToken === 'string') {
    return request.body.sessionToken
  }

  return null
}
