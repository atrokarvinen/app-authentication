import type { PrismaClient } from '@prisma/client'

import { prisma } from '../../../../lib/prisma'

export interface ILogoutRepository {
  revokeSessionByHash(
    refreshTokenHash: string,
    revokedAt: Date
  ): Promise<number>
}

export class PrismaLogoutRepository implements ILogoutRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async revokeSessionByHash(
    refreshTokenHash: string,
    revokedAt: Date
  ): Promise<number> {
    const result = await this.prismaClient.session.updateMany({
      where: {
        refreshTokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    })

    return result.count
  }
}
