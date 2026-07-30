import type { PrismaClient } from '@prisma/client'

import { prisma } from '../../../../lib/prisma'
import type { DbUserWithIdentities } from '../../types/database'

type ActiveSessionRecord = {
  user: DbUserWithIdentities
} | null

export interface ICurrentUserRepository {
  findActiveSessionByTokenHash(
    refreshTokenHash: string,
    now: Date
  ): Promise<ActiveSessionRecord>
}

export class CurrentUserRepository implements ICurrentUserRepository {
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
            identities: true,
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
