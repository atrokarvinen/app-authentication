import { AuthProvider, UserStatus } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthServiceError } from '../errors'
import type { IClock } from './loginClock'
import type { ILoginCryptoHelper } from './loginCryptoHelper'
import type { ILoginRepository } from './loginRepository'
import { LoginService } from './loginService'

function createService() {
  const repository: ILoginRepository = {
    findEmailRecord: vi.fn(),
    persistSuccessfulLogin: vi.fn(),
  }

  const cryptoHelper: ILoginCryptoHelper = {
    verifyPassword: vi.fn(),
    createSessionToken: vi.fn(),
    hashSessionToken: vi.fn(),
  }

  const clock: IClock = {
    now: vi.fn(() => new Date('2026-01-01T10:00:00.000Z')),
  }

  const loginService = new LoginService(repository, cryptoHelper, clock)

  return {
    repository,
    cryptoHelper,
    clock,
    loginUser: loginService.loginUser.bind(loginService),
  }
}

describe('loginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when email or password is missing', async () => {
    const { loginUser } = createService()

    await expect(
      loginUser({
        body: { email: 'person@example.com' },
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toMatchObject({
      message: 'Email and password are required.',
      statusCode: 400,
      logEvent: 'auth.login.invalid_payload',
    })
  })

  it('throws invalid credentials when email does not exist', async () => {
    const { repository, loginUser } = createService()
    vi.mocked(repository.findEmailRecord).mockResolvedValue(null)

    await expect(
      loginUser({
        body: { email: 'person@example.com', password: 'secret' },
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toMatchObject({
      message: 'Invalid email or password.',
      statusCode: 401,
      logEvent: 'auth.login.invalid_credentials',
    })
  })

  it('throws for suspended user', async () => {
    const { repository, cryptoHelper, loginUser } = createService()

    vi.mocked(repository.findEmailRecord).mockResolvedValue({
      user: {
        id: 'user-1',
        displayName: 'Test User',
        status: UserStatus.SUSPENDED,
        identities: [
          {
            provider: AuthProvider.CREDENTIALS,
            passwordHash: 'stored-hash',
          },
        ],
        emails: [],
        roles: [],
      },
    })

    await expect(
      loginUser({
        body: { email: 'person@example.com', password: 'secret' },
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toMatchObject({
      message: 'This account has been suspended.',
      statusCode: 403,
      logEvent: 'auth.login.suspended_user',
    })

    expect(cryptoHelper.verifyPassword).not.toHaveBeenCalled()
  })

  it('throws invalid credentials when password does not match', async () => {
    const { repository, cryptoHelper, loginUser } = createService()

    vi.mocked(repository.findEmailRecord).mockResolvedValue({
      user: {
        id: 'user-1',
        displayName: 'Test User',
        status: UserStatus.ACTIVE,
        identities: [
          {
            provider: AuthProvider.CREDENTIALS,
            passwordHash: 'stored-hash',
          },
        ],
        emails: [],
        roles: [],
      },
    })
    vi.mocked(cryptoHelper.verifyPassword).mockResolvedValue(false)

    await expect(
      loginUser({
        body: { email: 'person@example.com', password: 'bad-password' },
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toBeInstanceOf(AuthServiceError)

    await expect(
      loginUser({
        body: { email: 'person@example.com', password: 'bad-password' },
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toMatchObject({
      message: 'Invalid email or password.',
      statusCode: 401,
      logEvent: 'auth.login.invalid_credentials',
    })
  })

  it('returns user and token and creates session when credentials are valid', async () => {
    const { repository, cryptoHelper, clock, loginUser } = createService()

    const emailRecord = {
      user: {
        id: 'user-1',
        displayName: 'Test User',
        status: UserStatus.ACTIVE,
        identities: [
          {
            provider: AuthProvider.CREDENTIALS,
            passwordHash: 'stored-hash',
          },
        ],
        emails: [
          {
            email: 'person@example.com',
            isPrimary: true,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
          },
        ],
        roles: [{ role: { name: 'member' } }],
      },
    }

    const userDto = {
      id: 'user-1',
      displayName: 'Test User',
      email: 'person@example.com',
      authProvider: 'Credentials',
      role: 'member',
      status: 'Active',
    }

    vi.mocked(repository.findEmailRecord).mockResolvedValue(emailRecord)
    vi.mocked(cryptoHelper.verifyPassword).mockResolvedValue(true)
    vi.mocked(cryptoHelper.createSessionToken).mockReturnValue('session-token')
    vi.mocked(cryptoHelper.hashSessionToken).mockReturnValue(
      'session-token-hash'
    )

    const response = await loginUser({
      body: { email: ' PERSON@EXAMPLE.COM ', password: 'correct-password' },
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    })

    expect(repository.findEmailRecord).toHaveBeenCalledWith(
      'person@example.com'
    )
    expect(cryptoHelper.verifyPassword).toHaveBeenCalledWith(
      'correct-password',
      'stored-hash'
    )

    expect(clock.now).toHaveBeenCalledTimes(1)
    expect(repository.persistSuccessfulLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        lastLoginAt: new Date('2026-01-01T10:00:00.000Z'),
        session: expect.objectContaining({
          userId: 'user-1',
          refreshTokenHash: 'session-token-hash',
          ipAddress: '127.0.0.1',
          userAgent: 'vitest',
          expiresAt: new Date('2026-01-31T10:00:00.000Z'),
        }),
      })
    )
    expect(cryptoHelper.createSessionToken).toHaveBeenCalledTimes(1)
    expect(cryptoHelper.hashSessionToken).toHaveBeenCalledWith('session-token')

    expect(response).toEqual({
      result: {
        user: userDto,
        sessionToken: 'session-token',
      },
      logMeta: { userId: 'user-1' },
    })
  })

  it('returns invalid credentials when user has no credential identity hash', async () => {
    const { repository, cryptoHelper, loginUser } = createService()

    vi.mocked(repository.findEmailRecord).mockResolvedValue({
      user: {
        id: 'user-1',
        displayName: 'Test User',
        status: UserStatus.ACTIVE,
        identities: [
          { provider: AuthProvider.CREDENTIALS, passwordHash: null },
        ],
        emails: [],
        roles: [],
      },
    })

    await expect(
      loginUser({
        body: { email: 'person@example.com', password: 'any' },
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toMatchObject({
      message: 'Invalid email or password.',
      statusCode: 401,
      logEvent: 'auth.login.invalid_credentials',
    })

    expect(cryptoHelper.verifyPassword).not.toHaveBeenCalled()
  })
})
