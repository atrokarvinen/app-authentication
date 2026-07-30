import { AuthProvider, UserStatus, type PrismaClient } from '@prisma/client'

import { prisma } from '../../../../lib/prisma'
import type { DbUserProfile } from '../../types/database'

type CreateRegisteredUserArgs = {
  displayName: string
  email: string
  passwordHash: string
  sessionTokenHash: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  now: Date
}

export interface IRegisterRepository {
  emailExists(email: string): Promise<boolean>
  createRegisteredUser(params: CreateRegisteredUserArgs): Promise<DbUserProfile>
}

export class RegisterRepository implements IRegisterRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async emailExists(email: string): Promise<boolean> {
    const existingEmail = await this.prismaClient.userEmail.findUnique({
      where: { email },
      select: { id: true },
    })
    return Boolean(existingEmail)
  }

  async createRegisteredUser(
    params: CreateRegisteredUserArgs
  ): Promise<DbUserProfile> {
    const role = await this.prismaClient.role.upsert({
      where: { name: 'member' },
      update: {},
      create: {
        name: 'member',
        description: 'Default application member role.',
      },
    })

    return this.prismaClient.user.create({
      data: {
        status: UserStatus.ACTIVE,
        displayName: params.displayName,
        lastLoginAt: params.now,
        emails: {
          create: {
            email: params.email,
            isPrimary: true,
            isVerified: true,
            verificationSource: 'LOCAL',
            verifiedAt: params.now,
          },
        },
        identities: {
          create: {
            provider: AuthProvider.CREDENTIALS,
            providerUserId: params.email,
            usernameOrLogin: params.email,
            passwordHash: params.passwordHash,
            passwordAlgo: 'scrypt',
            passwordUpdatedAt: params.now,
          },
        },
        roles: {
          create: {
            role: {
              connect: { id: role.id },
            },
          },
        },
        sessions: {
          create: {
            refreshTokenHash: params.sessionTokenHash,
            expiresAt: params.expiresAt,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
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
  }
}
