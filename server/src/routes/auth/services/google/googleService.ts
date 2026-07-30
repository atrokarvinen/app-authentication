import { AuthProvider, type PrismaClient } from '@prisma/client'
import { env } from '../../../../config/env'
import {
  AuthCryptoHelper,
  type IAuthCryptoHelper,
} from '../../../../lib/authCryptoHelper'
import { SystemClock, type IClock } from '../../../../lib/clock'
import { prisma } from '../../../../lib/prisma'
import { toUserDto } from '../authShared'
import { persistGoogleUserAndSession } from './google-persistence'
import {
  assertGoogleClientConfigured,
  getAccessTokenFromBody,
  resolveGoogleIdentity,
} from './google-validation'
import type { GoogleSignInArgs, GoogleSignInResult } from './types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export class GoogleSignInService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly cryptoHelper: IAuthCryptoHelper,
    private readonly clock: IClock
  ) {}

  async signInWithGoogle(params: GoogleSignInArgs) {
    const accessToken = getAccessTokenFromBody(params.body)
    assertGoogleClientConfigured(env.googleClientId)

    const now = this.clock.now()
    const { email, providerUserId, profile } = await resolveGoogleIdentity({
      accessToken,
      googleClientId: env.googleClientId,
    })

    const sessionToken = this.cryptoHelper.createSessionToken()
    const sessionTokenHash = this.cryptoHelper.hashSessionToken(sessionToken)
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS)

    const user = await persistGoogleUserAndSession({
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

    const result: GoogleSignInResult = {
      result: {
        user: toUserDto({ user, provider: AuthProvider.GOOGLE }),
        sessionToken,
      },
      logMeta: { userId: user.id },
    }
    return result
  }
}

const googleSignInService = new GoogleSignInService(
  prisma,
  new AuthCryptoHelper(),
  new SystemClock()
)

export function signInWithGoogle(
  params: GoogleSignInArgs
): Promise<GoogleSignInResult> {
  return googleSignInService.signInWithGoogle(params)
}
