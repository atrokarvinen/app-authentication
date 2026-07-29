import { AuthProvider, UserStatus } from '@prisma/client'
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
} from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { normalizeEmail, toUserDto } from '../authShared'
import { AuthServiceError } from '../errors'
import type { RegisterArgs, RegisterResult } from './types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export async function registerUser(params: RegisterArgs) {
  const displayName =
    typeof params.body.displayName === 'string'
      ? params.body.displayName.trim()
      : ''
  const email =
    typeof params.body.email === 'string'
      ? normalizeEmail(params.body.email)
      : ''
  const password =
    typeof params.body.password === 'string' ? params.body.password : ''

  if (!displayName || !email || !password) {
    throw new AuthServiceError(
      'Display name, email, and password are required.',
      400,
      'auth.register.invalid_payload'
    )
  }

  if (password.length < 8) {
    throw new AuthServiceError(
      'Password must be at least 8 characters long.',
      400,
      'auth.register.password_too_short',
      { email }
    )
  }

  const existingEmail = await prisma.userEmail.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingEmail) {
    throw new AuthServiceError(
      'Email is already registered.',
      409,
      'auth.register.email_exists',
      { email }
    )
  }

  const passwordHash = await hashPassword(password)
  const sessionToken = createSessionToken()
  const sessionTokenHash = hashSessionToken(sessionToken)
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS)

  const created = await prisma.$transaction(async (tx) => {
    const role = await tx.role.upsert({
      where: { name: 'member' },
      update: {},
      create: {
        name: 'member',
        description: 'Default application member role.',
      },
    })

    const user = await tx.user.create({
      data: {
        status: UserStatus.ACTIVE,
        displayName,
        lastLoginAt: new Date(),
        emails: {
          create: {
            email,
            isPrimary: true,
            isVerified: true,
            verificationSource: 'LOCAL',
            verifiedAt: new Date(),
          },
        },
        identities: {
          create: {
            provider: AuthProvider.CREDENTIALS,
            providerUserId: email,
            usernameOrLogin: email,
            passwordHash,
            passwordAlgo: 'scrypt',
            passwordUpdatedAt: new Date(),
          },
        },
      },
      include: {
        emails: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    })

    await tx.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: sessionTokenHash,
        expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })

    return tx.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        emails: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    })
  })

  const result: RegisterResult = {
    result: {
      user: toUserDto({ user: created, provider: AuthProvider.CREDENTIALS }),
      sessionToken,
    },
    logMeta: { userId: created.id, email },
  }

  return result
}