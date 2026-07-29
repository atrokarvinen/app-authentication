import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IAuthCryptoHelper } from '../../../../lib/authCryptoHelper'
import type { IClock } from '../../../../lib/clock'
import type { ILogoutRepository } from './logoutRepository'
import { LogoutService } from './logoutService'

function createService() {
  const repository: ILogoutRepository = {
    revokeSessionByHash: vi.fn(),
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

  const logoutService = new LogoutService(repository, cryptoHelper, clock)

  return {
    repository,
    cryptoHelper,
    clock,
    logoutUser: logoutService.logoutUser.bind(logoutService),
  }
}

describe('logoutUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when session token is missing', async () => {
    const { logoutUser } = createService()

    await expect(logoutUser({ sessionToken: null })).rejects.toMatchObject({
      message: 'Session token is required.',
      statusCode: 400,
      logEvent: 'auth.logout.missing_token',
    })
  })

  it('revokes active session and returns count', async () => {
    const { repository, cryptoHelper, clock, logoutUser } = createService()

    vi.mocked(cryptoHelper.hashSessionToken).mockReturnValue('session-hash')
    vi.mocked(repository.revokeSessionByHash).mockResolvedValue(1)

    const result = await logoutUser({ sessionToken: 'raw-token' })

    expect(cryptoHelper.hashSessionToken).toHaveBeenCalledWith('raw-token')
    expect(clock.now).toHaveBeenCalledTimes(1)
    expect(repository.revokeSessionByHash).toHaveBeenCalledWith(
      'session-hash',
      new Date('2026-01-01T10:00:00.000Z')
    )
    expect(result).toEqual({ revokedCount: 1 })
  })
})
