import type { PrismaClient } from '@prisma/client'

import { prisma } from '../../../../lib/prisma'

export interface IDeleteRepository {
  deleteUserByEmail(email: string): Promise<boolean>
}

export class DeleteRepository implements IDeleteRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async deleteUserByEmail(email: string): Promise<boolean> {
    const emailRecord = await this.prismaClient.userEmail.findUnique({
      where: { email },
      select: { userId: true },
    })

    if (!emailRecord) {
      return false
    }

    await this.prismaClient.user.delete({
      where: { id: emailRecord.userId },
    })

    return true
  }
}
