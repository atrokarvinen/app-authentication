import { AuthProvider, UserStatus, type Prisma } from '@prisma/client'

import { buildDisplayName } from './facebook-helpers'
import type { FacebookUserInfoResponse } from './types'

const userWithRelationsInclude = {
  emails: true,
  identities: true,
  roles: {
    include: {
      role: true,
    },
  },
} as const

type FacebookPersistenceTx = Prisma.TransactionClient

export const upsertMemberRole = async (transaction: FacebookPersistenceTx) => {
  return transaction.role.upsert({
    where: { name: 'member' },
    update: {},
    create: {
      name: 'member',
      description: 'Default application member role.',
    },
  })
}

export const findExistingFacebookIdentity = async (
  transaction: FacebookPersistenceTx,
  providerUserId: string
) => {
  return transaction.userIdentity.findFirst({
    where: {
      provider: AuthProvider.FACEBOOK,
      providerUserId,
    },
    select: {
      id: true,
      userId: true,
    },
  })
}

export const findExistingEmailRecord = async (
  transaction: FacebookPersistenceTx,
  email: string
) => {
  return transaction.userEmail.findUnique({
    where: { email },
    include: {
      user: {
        include: userWithRelationsInclude,
      },
    },
  })
}

export const findUserWithRelations = async (
  transaction: FacebookPersistenceTx,
  userId: string
) => {
  return transaction.user.findUniqueOrThrow({
    where: { id: userId },
    include: userWithRelationsInclude,
  })
}

export const upsertFacebookIdentityForUser = async (params: {
  transaction: FacebookPersistenceTx
  existingIdentityId: string | null
  userId: string
  providerUserId: string
  profile: FacebookUserInfoResponse
  email: string
  accessToken: string
}) => {
  if (params.existingIdentityId) {
    await params.transaction.userIdentity.update({
      where: { id: params.existingIdentityId },
      data: {
        oauthAccessToken: params.accessToken,
        oauthTokenExpiresAt: null,
        providerProfile: params.profile,
        usernameOrLogin: params.profile.email || params.email,
      },
    })

    return
  }

  await params.transaction.userIdentity.create({
    data: {
      userId: params.userId,
      provider: AuthProvider.FACEBOOK,
      providerUserId: params.providerUserId,
      usernameOrLogin: params.profile.email || params.email,
      oauthAccessToken: params.accessToken,
      providerProfile: params.profile,
    },
  })
}

export const markEmailVerifiedByFacebook = async (params: {
  transaction: FacebookPersistenceTx
  userId: string
  email: string
  now: Date
}) => {
  await params.transaction.userEmail.updateMany({
    where: {
      userId: params.userId,
      email: params.email,
    },
    data: {
      isPrimary: true,
      isVerified: true,
      verifiedAt: params.now,
      verificationSource: 'FACEBOOK',
    },
  })
}

export const updateLastLoginAt = async (params: {
  transaction: FacebookPersistenceTx
  userId: string
  now: Date
}) => {
  await params.transaction.user.update({
    where: { id: params.userId },
    data: { lastLoginAt: params.now },
  })
}

export const createSession = async (params: {
  transaction: FacebookPersistenceTx
  userId: string
  sessionTokenHash: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
}) => {
  await params.transaction.session.create({
    data: {
      userId: params.userId,
      refreshTokenHash: params.sessionTokenHash,
      expiresAt: params.expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  })
}

export const createFacebookUserWithSession = async (params: {
  transaction: FacebookPersistenceTx
  roleId: string
  email: string
  profile: FacebookUserInfoResponse
  providerUserId: string
  accessToken: string
  now: Date
  sessionTokenHash: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
}) => {
  const displayName = buildDisplayName(params.profile, params.email)

  return params.transaction.user.create({
    data: {
      status: UserStatus.ACTIVE,
      displayName,
      lastLoginAt: params.now,
      emails: {
        create: {
          email: params.email,
          isPrimary: true,
          isVerified: true,
          verificationSource: 'FACEBOOK',
          verifiedAt: params.now,
        },
      },
      identities: {
        create: {
          provider: AuthProvider.FACEBOOK,
          providerUserId: params.providerUserId,
          usernameOrLogin: params.profile.email || params.email,
          oauthAccessToken: params.accessToken,
          providerProfile: params.profile,
        },
      },
      roles: {
        create: {
          role: {
            connect: { id: params.roleId },
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
    include: userWithRelationsInclude,
  })
}
