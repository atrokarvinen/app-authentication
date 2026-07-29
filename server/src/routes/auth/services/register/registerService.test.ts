import { UserStatus } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IAuthCryptoHelper } from '../../../../lib/authCryptoHelper'
import type { IClock } from '../../../../lib/clock'
import type { IRegisterRepository } from './registerRepository'
import { RegisterService } from './registerService'

function createService() {
  const repository: IRegisterRepository = {
    emailExists: vi.fn(),
    createRegisteredUser: vi.fn(),
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

  const registerService = new RegisterService(repository, cryptoHelper, clock)

  return {
    repository,
    cryptoHelper,
    clock,
    registerUser: registerService.registerUser.bind(registerService),
  }
}

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when required fields are missing', async () => {
    const { registerUser } = createService()

    await expect(
      registerUser({
        body: { email: 'person@example.com', password: 'password123' },
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toMatchObject({
      message: 'Display name, email, and password are required.',
      statusCode: 400,
      logEvent: 'auth.register.invalid_payload',
    })
  })

  it('throws when password is too short', async () => {
    const { registerUser } = createService()

    await expect(
      registerUser({
        body: {
          displayName: 'Test User',
          email: 'person@example.com',
          password: 'short',
        },
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toMatchObject({
      message: 'Password must be at least 8 characters long.',
      statusCode: 400,
      logEvent: 'auth.register.password_too_short',
    })
  })

  it('throws when email already exists', async () => {
    const { repository, registerUser } = createService()
    vi.mocked(repository.emailExists).mockResolvedValue(true)

    await expect(
      registerUser({
        body: {
          displayName: 'Test User',
          email: 'PERSON@EXAMPLE.COM',
          password: 'password123',
        },
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toMatchObject({
      message: 'Email is already registered.',
      statusCode: 409,
      logEvent: 'auth.register.email_exists',
      logMeta: { email: 'person@example.com' },
    })

    expect(repository.emailExists).toHaveBeenCalledWith('person@example.com')
    expect(repository.createRegisteredUser).not.toHaveBeenCalled()
  })

  it('creates user and session when payload is valid', async () => {
    const { repository, cryptoHelper, clock, registerUser } = createService()

    const createdUser = {
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
    }

    vi.mocked(repository.emailExists).mockResolvedValue(false)
    vi.mocked(cryptoHelper.hashPassword).mockResolvedValue('password-hash')
    vi.mocked(cryptoHelper.createSessionToken).mockReturnValue('session-token')
    vi.mocked(cryptoHelper.hashSessionToken).mockReturnValue(
      'session-token-hash'
    )
    vi.mocked(repository.createRegisteredUser).mockResolvedValue(createdUser)

    const result = await registerUser({
      body: {
        displayName: ' Test User ',
        email: 'PERSON@EXAMPLE.COM',
        password: 'password123',
      },
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    })

    expect(clock.now).toHaveBeenCalledTimes(1)
    expect(repository.emailExists).toHaveBeenCalledWith('person@example.com')
    expect(cryptoHelper.hashPassword).toHaveBeenCalledWith('password123')
    expect(cryptoHelper.createSessionToken).toHaveBeenCalledTimes(1)
    expect(cryptoHelper.hashSessionToken).toHaveBeenCalledWith('session-token')

    expect(repository.createRegisteredUser).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'Test User',
        email: 'person@example.com',
        passwordHash: 'password-hash',
        sessionTokenHash: 'session-token-hash',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        now: new Date('2026-01-01T10:00:00.000Z'),
        expiresAt: new Date('2026-01-31T10:00:00.000Z'),
      })
    )

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
        sessionToken: 'session-token',
      },
      logMeta: {
        userId: 'user-1',
        email: 'person@example.com',
      },
    })
  })
})
