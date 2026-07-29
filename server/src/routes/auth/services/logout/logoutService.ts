import { hashSessionToken } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { AuthServiceError } from '../errors'
import type { LogoutArgs, LogoutResult } from './types'

export async function logoutUser(params: LogoutArgs) {
  if (!params.sessionToken) {
    throw new AuthServiceError(
      'Session token is required.',
      400,
      'auth.logout.missing_token'
    )
  }

  const result = await prisma.session.updateMany({
    where: {
      refreshTokenHash: hashSessionToken(params.sessionToken),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })

  const logoutResult: LogoutResult = { revokedCount: result.count }
  return logoutResult
}