import { AuthProvider, UserStatus, type PrismaClient } from '@prisma/client'

import { AuthServiceError } from '../errors'
import { buildDisplayName } from './google-helpers'
import type { GoogleUserInfoResponse } from './types'

type PersistGoogleUserAndSessionParams = {
  prismaClient: PrismaClient
  accessToken: string
  email: string
  providerUserId: string
  profile: GoogleUserInfoResponse
  now: Date
  sessionTokenHash: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
}

export async function persistGoogleUserAndSession(
  params: PersistGoogleUserAndSessionParams
) {
  return params.prismaClient.$transaction(async (transaction) => {
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
        providerUserId: params.providerUserId,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    const existingEmail = await transaction.userEmail.findUnique({
      where: { email: params.email },
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
            oauthAccessToken: params.accessToken,
            oauthTokenExpiresAt: null,
            providerProfile: params.profile,
            usernameOrLogin: params.profile.email || params.email,
          },
        })
      } else {
        await transaction.userIdentity.create({
          data: {
            userId: existingUser.id,
            provider: AuthProvider.GOOGLE,
            providerUserId: params.providerUserId,
            usernameOrLogin: params.profile.email || params.email,
            oauthAccessToken: params.accessToken,
            providerProfile: params.profile,
          },
        })
      }

      await transaction.userEmail.updateMany({
        where: {
          userId: existingUser.id,
          email: params.email,
        },
        data: {
          isPrimary: true,
          isVerified: true,
          verifiedAt: params.now,
          verificationSource: 'GOOGLE',
        },
      })

      await transaction.user.update({
        where: { id: existingUser.id },
        data: { lastLoginAt: params.now },
      })

      await transaction.session.create({
        data: {
          userId: existingUser.id,
          refreshTokenHash: params.sessionTokenHash,
          expiresAt: params.expiresAt,
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

    const displayName = buildDisplayName(params.profile, params.email)

    return transaction.user.create({
      data: {
        status: UserStatus.ACTIVE,
        displayName,
        lastLoginAt: params.now,
        emails: {
          create: {
            email: params.email,
            isPrimary: true,
            isVerified: true,
            verificationSource: 'GOOGLE',
            verifiedAt: params.now,
          },
        },
        identities: {
          create: {
            provider: AuthProvider.GOOGLE,
            providerUserId: params.providerUserId,
            usernameOrLogin: params.profile.email || params.email,
            oauthAccessToken: params.accessToken,
            providerProfile: params.profile,
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
            refreshTokenHash: params.sessionTokenHash,
            expiresAt: params.expiresAt,
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
}
