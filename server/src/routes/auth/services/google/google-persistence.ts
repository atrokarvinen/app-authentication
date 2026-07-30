import { type PrismaClient, UserStatus } from '@prisma/client'

import { AuthServiceError } from '../errors'
import {
  createGoogleUserWithSession,
  createSession,
  findExistingEmailRecord,
  findExistingGoogleIdentity,
  findUserWithRelations,
  markEmailVerifiedByGoogle,
  updateLastLoginAt,
  upsertGoogleIdentityForUser,
  upsertMemberRole,
} from './google-persistence-db'
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
    const role = await upsertMemberRole(transaction)
    const existingIdentity = await findExistingGoogleIdentity(
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
          'auth.google.suspended_user',
          { userId: existingUser.id }
        )
      }

      await upsertGoogleIdentityForUser({
        transaction,
        existingIdentityId: existingIdentity?.id || null,
        userId: existingUser.id,
        providerUserId: params.providerUserId,
        profile: params.profile,
        email: params.email,
        accessToken: params.accessToken,
      })

      await markEmailVerifiedByGoogle({
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

    return createGoogleUserWithSession({
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
