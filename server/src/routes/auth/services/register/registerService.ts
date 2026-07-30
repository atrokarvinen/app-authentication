import { AuthProvider } from '@prisma/client'
import {
  AuthCryptoHelper,
  type IAuthCryptoHelper,
} from '../../../../lib/authCryptoHelper'
import { SystemClock, type IClock } from '../../../../lib/clock'
import { normalizeEmail, toUserDto } from '../authShared'
import { AuthServiceError } from '../errors'
import {
  RegisterRepository,
  type IRegisterRepository,
} from './registerRepository'
import type { RegisterArgs, RegisterResult } from './types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export class RegisterService {
  constructor(
    private readonly repository: IRegisterRepository,
    private readonly cryptoHelper: IAuthCryptoHelper,
    private readonly clock: IClock
  ) {}

  async registerUser(params: RegisterArgs): Promise<RegisterResult> {
    const displayName =
      typeof params.body.displayName === 'string'
        ? params.body.displayName.trim()
        : ''
    const email =
      typeof params.body.email === 'string'
        ? normalizeEmail(params.body.email)
        : ''
    const password =
      typeof params.body.password === 'string' ? params.body.password : ''

    if (!displayName || !email || !password) {
      throw new AuthServiceError(
        'Display name, email, and password are required.',
        400,
        'auth.register.invalid_payload'
      )
    }

    if (password.length < 8) {
      throw new AuthServiceError(
        'Password must be at least 8 characters long.',
        400,
        'auth.register.password_too_short',
        { email }
      )
    }

    const existingEmail = await this.repository.emailExists(email)

    if (existingEmail) {
      throw new AuthServiceError(
        'Email is already registered.',
        409,
        'auth.register.email_exists',
        { email }
      )
    }

    const now = this.clock.now()
    const passwordHash = await this.cryptoHelper.hashPassword(password)
    const sessionToken = this.cryptoHelper.createSessionToken()
    const sessionTokenHash = this.cryptoHelper.hashSessionToken(sessionToken)
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS)

    const created = await this.repository.createRegisteredUser({
      displayName,
      email,
      passwordHash,
      sessionTokenHash,
      expiresAt,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      now,
    })

    const result: RegisterResult = {
      result: {
        user: toUserDto({ user: created, provider: AuthProvider.CREDENTIALS }),
        sessionToken,
      },
      logMeta: { userId: created.id, email },
    }

    return result
  }
}

const registerService = new RegisterService(
  new RegisterRepository(),
  new AuthCryptoHelper(),
  new SystemClock()
)

export function registerUser(params: RegisterArgs): Promise<RegisterResult> {
  return registerService.registerUser(params)
}
