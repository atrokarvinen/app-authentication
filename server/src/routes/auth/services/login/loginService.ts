import { AuthProvider, UserStatus } from '@prisma/client'
import {
  createSessionToken,
  hashSessionToken,
  verifyPassword,
} from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { normalizeEmail, toUserDto } from '../authShared'
import { AuthServiceError } from '../errors'
import type { LoginArgs, LoginResult } from './types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export async function loginUser(params: LoginArgs) {
  const email =
    typeof params.body.email === 'string'
      ? normalizeEmail(params.body.email)
      : ''
  const password =
    typeof params.body.password === 'string' ? params.body.password : ''

  if (!email || !password) {
    throw new AuthServiceError(
      'Email and password are required.',
      400,
      'auth.login.invalid_payload'
    )
  }

  const emailRecord = await prisma.userEmail.findUnique({
    where: { email },
    include: {
      user: {
        include: {
          identities: {
            where: { provider: AuthProvider.CREDENTIALS },
          },
          emails: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  })

  const identity = emailRecord?.user.identities[0]

  if (!emailRecord || !identity?.passwordHash) {
    throw new AuthServiceError(
      'Invalid email or password.',
      401,
      'auth.login.invalid_credentials',
      { email }
    )
  }

  if (emailRecord.user.status === UserStatus.SUSPENDED) {
    throw new AuthServiceError(
      'This account has been suspended.',
      403,
      'auth.login.suspended_user',
      { userId: emailRecord.user.id }
    )
  }

  const passwordMatches = await verifyPassword(password, identity.passwordHash)

  if (!passwordMatches) {
    throw new AuthServiceError(
      'Invalid email or password.',
      401,
      'auth.login.invalid_credentials',
      { userId: emailRecord.user.id }
    )
  }

  const sessionToken = createSessionToken()
  const sessionTokenHash = hashSessionToken(sessionToken)
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: emailRecord.user.id },
      data: { lastLoginAt: new Date() },
    }),
    prisma.session.create({
      data: {
        userId: emailRecord.user.id,
        refreshTokenHash: sessionTokenHash,
        expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    }),
  ])

  const result: LoginResult = {
    result: {
      user: toUserDto({
        user: emailRecord.user,
        provider: identity.provider,
      }),
      sessionToken,
    },
    logMeta: { userId: emailRecord.user.id },
  }
  return result
}
