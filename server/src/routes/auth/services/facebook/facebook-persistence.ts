import { type PrismaClient, UserStatus } from '@prisma/client'

import { AuthServiceError } from '../errors'
import {
  createFacebookUserWithSession,
  createSession,
  findExistingEmailRecord,
  findExistingFacebookIdentity,
  findUserWithRelations,
  markEmailVerifiedByFacebook,
  updateLastLoginAt,
  upsertFacebookIdentityForUser,
  upsertMemberRole,
} from './facebook-persistence-db'
import type { FacebookUserInfoResponse } from './types'

type PersistFacebookUserAndSessionParams = {
  prismaClient: PrismaClient
  accessToken: string
  email: string
  providerUserId: string
  profile: FacebookUserInfoResponse
  now: Date
  sessionTokenHash: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
}

export async function persistFacebookUserAndSession(
  params: PersistFacebookUserAndSessionParams
) {
  return params.prismaClient.$transaction(async (transaction) => {
    const role = await upsertMemberRole(transaction)
    const existingIdentity = await findExistingFacebookIdentity(
      transaction,
      params.providerUserId
    )
    const existingEmail = await findExistingEmailRecord(
      transaction,
      params.email
    )

    const targetUserId =
      existingIdentity?.userId || existingEmail?.user.id || null

    if (targetUserId) {
      const existingUser =
        existingEmail?.user.id === targetUserId
          ? existingEmail.user
          : await findUserWithRelations(transaction, targetUserId)

      if (existingUser.status === UserStatus.SUSPENDED) {
        throw new AuthServiceError(
          'This account has been suspended.',
          403,
          'auth.facebook.suspended_user',
          { userId: existingUser.id }
        )
      }

      await upsertFacebookIdentityForUser({
        transaction,
        existingIdentityId: existingIdentity?.id || null,
        userId: existingUser.id,
        providerUserId: params.providerUserId,
        profile: params.profile,
        email: params.email,
        accessToken: params.accessToken,
      })

      await markEmailVerifiedByFacebook({
        transaction,
        userId: existingUser.id,
        email: params.email,
        now: params.now,
      })

      await updateLastLoginAt({
        transaction,
        userId: existingUser.id,
        now: params.now,
      })

      await createSession({
        transaction,
        userId: existingUser.id,
        sessionTokenHash: params.sessionTokenHash,
        expiresAt: params.expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      })

      return findUserWithRelations(transaction, existingUser.id)
    }

    return createFacebookUserWithSession({
      transaction,
      roleId: role.id,
      email: params.email,
      profile: params.profile,
      providerUserId: params.providerUserId,
      accessToken: params.accessToken,
      now: params.now,
      sessionTokenHash: params.sessionTokenHash,
      expiresAt: params.expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  })
}
