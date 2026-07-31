import { AuthProvider, type PrismaClient } from '@prisma/client'
import {
  AuthCryptoHelper,
  type IAuthCryptoHelper,
} from '../../../../lib/authCryptoHelper'
import { SystemClock, type IClock } from '../../../../lib/clock'
import { prisma } from '../../../../lib/prisma'
import { toUserDto } from '../authShared'
import { persistMicrosoftUserAndSession } from './microsoft-persistence'
import {
  getAccessTokenFromBody,
  resolveMicrosoftIdentity,
} from './microsoft-validation'
import type { MicrosoftSignInArgs, MicrosoftSignInResult } from './types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

class MicrosoftSignInService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly cryptoHelper: IAuthCryptoHelper,
    private readonly clock: IClock
  ) {}

  async signInWithMicrosoft(params: MicrosoftSignInArgs) {
    const accessToken = getAccessTokenFromBody(params.body)

    const now = this.clock.now()
    const { email, providerUserId, profile } = await resolveMicrosoftIdentity({
      accessToken,
    })

    const sessionToken = this.cryptoHelper.createSessionToken()
    const sessionTokenHash = this.cryptoHelper.hashSessionToken(sessionToken)
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS)

    const user = await persistMicrosoftUserAndSession({
      prismaClient: this.prismaClient,
      accessToken,
      email,
      providerUserId,
      profile,
      now,
      sessionTokenHash,
      expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })

    const result: MicrosoftSignInResult = {
      result: {
        user: toUserDto({ user, provider: AuthProvider.MICROSOFT }),
        sessionToken,
      },
      logMeta: { userId: user.id },
    }
    return result
  }
}

const microsoftSignInService = new MicrosoftSignInService(
  prisma,
  new AuthCryptoHelper(),
  new SystemClock()
)

export function signInWithMicrosoft(
  params: MicrosoftSignInArgs
): Promise<MicrosoftSignInResult> {
  return microsoftSignInService.signInWithMicrosoft(params)
}
