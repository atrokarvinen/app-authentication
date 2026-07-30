import { AuthProvider, UserStatus, type PrismaClient } from '@prisma/client'

import { env } from '../../../../config/env'
import {
  AuthCryptoHelper,
  type IAuthCryptoHelper,
} from '../../../../lib/authCryptoHelper'
import { SystemClock, type IClock } from '../../../../lib/clock'
import { prisma } from '../../../../lib/prisma'
import { normalizeEmail, toUserDto } from '../authShared'
import { AuthServiceError } from '../errors'
import { fetchGoogleTokenInfo, fetchGoogleUserInfo } from './google-api'
import { buildDisplayName, isVerifiedEmail } from './google-helpers'
import type { GoogleSignInArgs, GoogleSignInResult } from './types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export class GoogleSignInService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly cryptoHelper: IAuthCryptoHelper,
    private readonly clock: IClock
  ) {}

  async signInWithGoogle(
    params: GoogleSignInArgs
  ): Promise<GoogleSignInResult> {
    const accessToken =
      typeof params.body.accessToken === 'string' ? params.body.accessToken : ''

    if (!accessToken) {
      throw new AuthServiceError(
        'Google access token is required.',
        400,
        'auth.google.invalid_payload'
      )
    }

    if (!env.googleClientId) {
      throw new AuthServiceError(
        'Google sign-in is not configured.',
        500,
        'auth.google.misconfigured'
      )
    }

    const now = this.clock.now()
    const tokenInfo = await fetchGoogleTokenInfo(accessToken)

    if (
      tokenInfo.aud !== env.googleClientId ||
      !isVerifiedEmail(tokenInfo.email_verified)
    ) {
      throw new AuthServiceError(
        'Google sign-in token is not valid for this application.',
        401,
        'auth.google.invalid_token'
      )
    }

    const profile = await fetchGoogleUserInfo(accessToken)
    const email = normalizeEmail(profile.email || tokenInfo.email || '')
    const providerUserId = tokenInfo.sub || profile.sub || ''

    if (!email || !providerUserId) {
      throw new AuthServiceError(
        'Google account information is incomplete.',
        401,
        'auth.google.invalid_profile'
      )
    }

    const sessionToken = this.cryptoHelper.createSessionToken()
    const sessionTokenHash = this.cryptoHelper.hashSessionToken(sessionToken)
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS)

    const user = await this.prismaClient.$transaction(async (transaction) => {
      const role = await transaction.role.upsert({
        where: { name: 'member' },
        update: {},
        create: {
          name: 'member',
          description: 'Default application member role.',
        },
      })

      const existingIdentity = await transaction.userIdentity.findFirst({
        where: {
          provider: AuthProvider.GOOGLE,
          providerUserId,
        },
        select: {
          id: true,
          userId: true,
        },
      })

      const existingEmail = await transaction.userEmail.findUnique({
        where: { email },
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

      const targetUserId =
        existingIdentity?.userId || existingEmail?.user.id || null

      if (targetUserId) {
        const existingUser =
          existingEmail?.user.id === targetUserId
            ? existingEmail.user
            : await transaction.user.findUniqueOrThrow({
                where: { id: targetUserId },
                include: {
                  emails: true,
                  identities: true,
                  roles: {
                    include: {
                      role: true,
                    },
                  },
                },
              })

        if (existingUser.status === UserStatus.SUSPENDED) {
          throw new AuthServiceError(
            'This account has been suspended.',
            403,
            'auth.google.suspended_user',
            { userId: existingUser.id }
          )
        }

        if (existingIdentity) {
          await transaction.userIdentity.update({
            where: { id: existingIdentity.id },
            data: {
              oauthAccessToken: accessToken,
              oauthTokenExpiresAt: null,
              providerProfile: profile,
              usernameOrLogin: profile.email || email,
            },
          })
        } else {
          await transaction.userIdentity.create({
            data: {
              userId: existingUser.id,
              provider: AuthProvider.GOOGLE,
              providerUserId,
              usernameOrLogin: profile.email || email,
              oauthAccessToken: accessToken,
              providerProfile: profile,
            },
          })
        }

        await transaction.userEmail.updateMany({
          where: {
            userId: existingUser.id,
            email,
          },
          data: {
            isPrimary: true,
            isVerified: true,
            verifiedAt: now,
            verificationSource: 'GOOGLE',
          },
        })

        await transaction.user.update({
          where: { id: existingUser.id },
          data: { lastLoginAt: now },
        })

        await transaction.session.create({
          data: {
            userId: existingUser.id,
            refreshTokenHash: sessionTokenHash,
            expiresAt,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
          },
        })

        return transaction.user.findUniqueOrThrow({
          where: { id: existingUser.id },
          include: {
            emails: true,
            identities: true,
            roles: {
              include: {
                role: true,
              },
            },
          },
        })
      }

      const displayName = buildDisplayName(profile, email)

      return transaction.user.create({
        data: {
          status: UserStatus.ACTIVE,
          displayName,
          lastLoginAt: now,
          emails: {
            create: {
              email,
              isPrimary: true,
              isVerified: true,
              verificationSource: 'GOOGLE',
              verifiedAt: now,
            },
          },
          identities: {
            create: {
              provider: AuthProvider.GOOGLE,
              providerUserId,
              usernameOrLogin: profile.email || email,
              oauthAccessToken: accessToken,
              providerProfile: profile,
            },
          },
          roles: {
            create: {
              role: {
                connect: { id: role.id },
              },
            },
          },
          sessions: {
            create: {
              refreshTokenHash: sessionTokenHash,
              expiresAt,
              ipAddress: params.ipAddress,
              userAgent: params.userAgent,
            },
          },
        },
        include: {
          emails: true,
          identities: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      })
    })

    return {
      result: {
        user: toUserDto({
          user,
          provider: AuthProvider.GOOGLE,
        }),
        sessionToken,
      },
      logMeta: { userId: user.id },
    }
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
