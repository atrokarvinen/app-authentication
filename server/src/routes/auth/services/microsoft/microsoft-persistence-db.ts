import { AuthProvider, UserStatus, type Prisma } from '@prisma/client'

import { buildDisplayName } from './microsoft-helpers'
import type { MicrosoftUserInfoResponse } from './types'

const userWithRelationsInclude = {
  emails: true,
  identities: true,
  roles: {
    include: {
      role: true,
    },
  },
} as const

type MicrosoftPersistenceTx = Prisma.TransactionClient

export const upsertMemberRole = async (transaction: MicrosoftPersistenceTx) => {
  return transaction.role.upsert({
    where: { name: 'member' },
    update: {},
    create: {
      name: 'member',
      description: 'Default application member role.',
    },
  })
}

export const findExistingMicrosoftIdentity = async (
  transaction: MicrosoftPersistenceTx,
  providerUserId: string
) => {
  return transaction.userIdentity.findFirst({
    where: {
      provider: AuthProvider.MICROSOFT,
      providerUserId,
    },
    select: {
      id: true,
      userId: true,
    },
  })
}

export const findExistingEmailRecord = async (
  transaction: MicrosoftPersistenceTx,
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
  transaction: MicrosoftPersistenceTx,
  userId: string
) => {
  return transaction.user.findUniqueOrThrow({
    where: { id: userId },
    include: userWithRelationsInclude,
  })
}

export const upsertMicrosoftIdentityForUser = async (params: {
  transaction: MicrosoftPersistenceTx
  existingIdentityId: string | null
  userId: string
  providerUserId: string
  profile: MicrosoftUserInfoResponse
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
        usernameOrLogin: params.profile.userPrincipalName || params.email,
      },
    })

    return
  }

  await params.transaction.userIdentity.create({
    data: {
      userId: params.userId,
      provider: AuthProvider.MICROSOFT,
      providerUserId: params.providerUserId,
      usernameOrLogin: params.profile.userPrincipalName || params.email,
      oauthAccessToken: params.accessToken,
      providerProfile: params.profile,
    },
  })
}

export const markEmailVerifiedByMicrosoft = async (params: {
  transaction: MicrosoftPersistenceTx
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
      verificationSource: 'MICROSOFT',
    },
  })
}

export const updateLastLoginAt = async (params: {
  transaction: MicrosoftPersistenceTx
  userId: string
  now: Date
}) => {
  await params.transaction.user.update({
    where: { id: params.userId },
    data: { lastLoginAt: params.now },
  })
}

export const createSession = async (params: {
  transaction: MicrosoftPersistenceTx
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

export const createMicrosoftUserWithSession = async (params: {
  transaction: MicrosoftPersistenceTx
  roleId: string
  email: string
  profile: MicrosoftUserInfoResponse
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
          verificationSource: 'MICROSOFT',
          verifiedAt: params.now,
        },
      },
      identities: {
        create: {
          provider: AuthProvider.MICROSOFT,
          providerUserId: params.providerUserId,
          usernameOrLogin: params.profile.userPrincipalName || params.email,
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
