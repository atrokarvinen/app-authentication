import { AuthProvider, type PrismaClient } from '@prisma/client'

import { prisma } from '../../../../lib/prisma'
import type { DbUserWithIdentities } from '../../types/database'

type ActiveSessionRecord = {
  user: DbUserWithIdentities
} | null

export interface IMeRepository {
  findActiveSessionByTokenHash(
    refreshTokenHash: string,
    now: Date
  ): Promise<ActiveSessionRecord>
}

export class MeRepository implements IMeRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findActiveSessionByTokenHash(
    refreshTokenHash: string,
    now: Date
  ): Promise<ActiveSessionRecord> {
    return this.prismaClient.session.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: {
          include: {
            emails: true,
            identities: {
              where: { provider: AuthProvider.CREDENTIALS },
            },
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
}
