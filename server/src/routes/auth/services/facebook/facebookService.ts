import { AuthProvider, type PrismaClient } from '@prisma/client'
import { env } from '../../../../config/env'
import {
  AuthCryptoHelper,
  type IAuthCryptoHelper,
} from '../../../../lib/authCryptoHelper'
import { SystemClock, type IClock } from '../../../../lib/clock'
import { prisma } from '../../../../lib/prisma'
import { toUserDto } from '../authShared'
import { persistFacebookUserAndSession } from './facebook-persistence'
import {
  assertFacebookClientConfigured,
  getCodeAndRedirectUriFromBody,
  resolveFacebookIdentity,
} from './facebook-validation'
import type { FacebookSignInArgs, FacebookSignInResult } from './types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

class FacebookSignInService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly cryptoHelper: IAuthCryptoHelper,
    private readonly clock: IClock
  ) {}

  async signInWithFacebook(params: FacebookSignInArgs) {
    const { code, redirectUri } = getCodeAndRedirectUriFromBody(params.body)
    assertFacebookClientConfigured(env.facebookAppId, env.facebookAppSecret)

    const now = this.clock.now()
    const { email, providerUserId, profile, accessToken } =
      await resolveFacebookIdentity({
        code,
        redirectUri,
        facebookAppId: env.facebookAppId,
        facebookAppSecret: env.facebookAppSecret,
      })

    const sessionToken = this.cryptoHelper.createSessionToken()
    const sessionTokenHash = this.cryptoHelper.hashSessionToken(sessionToken)
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS)

    const user = await persistFacebookUserAndSession({
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

    const result: FacebookSignInResult = {
      result: {
        user: toUserDto({ user, provider: AuthProvider.FACEBOOK }),
        sessionToken,
      },
      logMeta: { userId: user.id },
    }
    return result
  }
}

const facebookSignInService = new FacebookSignInService(
  prisma,
  new AuthCryptoHelper(),
  new SystemClock()
)

export function signInWithFacebook(
  params: FacebookSignInArgs
): Promise<FacebookSignInResult> {
  return facebookSignInService.signInWithFacebook(params)
}
