import { AuthProvider } from '@prisma/client'
import { hashSessionToken } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import type { MeResponseBody } from '../types/http'
import { toPublicUser } from './authShared'
import { AuthServiceError } from './errors'

export async function getCurrentUser(params: {
  sessionToken: string | null
}): Promise<{ result: MeResponseBody; logMeta: Record<string, unknown> }> {
  if (!params.sessionToken) {
    throw new AuthServiceError(
      'Not authenticated.',
      401,
      'auth.me.missing_token'
    )
  }

  const session = await prisma.session.findFirst({
    where: {
      refreshTokenHash: hashSessionToken(params.sessionToken),
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
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

  if (!session) {
    throw new AuthServiceError(
      'Session is invalid or expired.',
      401,
      'auth.me.invalid_or_expired_session'
    )
  }

  const provider =
    session.user.identities[0]?.provider || AuthProvider.CREDENTIALS

  return {
    result: {
      user: toPublicUser({
        user: session.user,
        provider,
      }),
    },
    logMeta: { userId: session.user.id },
  }
}
