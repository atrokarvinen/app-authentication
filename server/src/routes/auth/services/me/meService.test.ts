import { AuthProvider, UserStatus } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IAuthCryptoHelper } from '../../../../lib/authCryptoHelper'
import type { IClock } from '../../../../lib/clock'
import type { IMeRepository } from './meRepository'
import { MeService } from './meService'

function createService() {
  const repository: IMeRepository = {
    findActiveSessionByTokenHash: vi.fn(),
  }

  const cryptoHelper: IAuthCryptoHelper = {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
    createSessionToken: vi.fn(),
    hashSessionToken: vi.fn(),
  }

  const clock: IClock = {
    now: vi.fn(() => new Date('2026-01-01T10:00:00.000Z')),
  }

  const meService = new MeService(repository, cryptoHelper, clock)

  return {
    repository,
    cryptoHelper,
    clock,
    getCurrentUser: meService.getCurrentUser.bind(meService),
  }
}

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when session token is missing', async () => {
    const { getCurrentUser } = createService()

    await expect(getCurrentUser({ sessionToken: null })).rejects.toMatchObject({
      message: 'Not authenticated.',
      statusCode: 401,
      logEvent: 'auth.me.missing_token',
    })
  })

  it('throws when session is invalid or expired', async () => {
    const { repository, cryptoHelper, clock, getCurrentUser } = createService()

    vi.mocked(cryptoHelper.hashSessionToken).mockReturnValue('session-hash')
    vi.mocked(repository.findActiveSessionByTokenHash).mockResolvedValue(null)

    await expect(
      getCurrentUser({ sessionToken: 'raw-token' })
    ).rejects.toMatchObject({
      message: 'Session is invalid or expired.',
      statusCode: 401,
      logEvent: 'auth.me.invalid_or_expired_session',
    })

    expect(clock.now).toHaveBeenCalledTimes(1)
    expect(repository.findActiveSessionByTokenHash).toHaveBeenCalledWith(
      'session-hash',
      new Date('2026-01-01T10:00:00.000Z')
    )
  })

  it('returns user profile for active session', async () => {
    const { repository, cryptoHelper, getCurrentUser } = createService()

    vi.mocked(cryptoHelper.hashSessionToken).mockReturnValue('session-hash')
    vi.mocked(repository.findActiveSessionByTokenHash).mockResolvedValue({
      user: {
        id: 'user-1',
        displayName: 'Test User',
        status: UserStatus.ACTIVE,
        emails: [
          {
            email: 'person@example.com',
            isPrimary: true,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
          },
        ],
        roles: [{ role: { name: 'member' } }],
        identities: [
          {
            provider: AuthProvider.CREDENTIALS,
            passwordHash: 'stored-hash',
          },
        ],
      },
    })

    const result = await getCurrentUser({ sessionToken: 'raw-token' })

    expect(result).toEqual({
      result: {
        user: {
          id: 'user-1',
          displayName: 'Test User',
          email: 'person@example.com',
          authProvider: 'Credentials',
          role: 'member',
          status: 'Active',
        },
      },
      logMeta: { userId: 'user-1' },
    })
  })

  it('falls back to credentials provider when identity list is empty', async () => {
    const { repository, cryptoHelper, getCurrentUser } = createService()

    vi.mocked(cryptoHelper.hashSessionToken).mockReturnValue('session-hash')
    vi.mocked(repository.findActiveSessionByTokenHash).mockResolvedValue({
      user: {
        id: 'user-1',
        displayName: 'Test User',
        status: UserStatus.ACTIVE,
        emails: [
          {
            email: 'person@example.com',
            isPrimary: true,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
          },
        ],
        roles: [{ role: { name: 'member' } }],
        identities: [],
      },
    })

    const result = await getCurrentUser({ sessionToken: 'raw-token' })

    expect(result.result.user.authProvider).toBe('Credentials')
  })
})
