import { AuthProvider, type PrismaClient } from '@prisma/client'

import { prisma } from '../../../../lib/prisma'
import type { DbUserWithIdentities } from '../../types/database'

export type LoginEmailRecord = {
  user: DbUserWithIdentities
} | null

export type PersistSuccessfulLoginArgs = {
  userId: string
  lastLoginAt: Date
  session: {
    userId: string
    refreshTokenHash: string
    expiresAt: Date
    ipAddress: string | null
    userAgent: string | null
  }
}

export interface ILoginRepository {
  findEmailRecord(email: string): Promise<LoginEmailRecord>
  persistSuccessfulLogin(params: PersistSuccessfulLoginArgs): Promise<void>
}

export class PrismaLoginRepository implements ILoginRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findEmailRecord(email: string): Promise<LoginEmailRecord> {
    return this.prismaClient.userEmail.findUnique({
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
  }

  async persistSuccessfulLogin(
    params: PersistSuccessfulLoginArgs
  ): Promise<void> {
    await this.prismaClient.$transaction([
      this.prismaClient.user.update({
        where: { id: params.userId },
        data: { lastLoginAt: params.lastLoginAt },
      }),
      this.prismaClient.session.create({
        data: params.session,
      }),
    ])
  }
}
