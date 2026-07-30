import { UserStatus } from '@prisma/client'
import {
  AuthCryptoHelper,
  type IAuthCryptoHelper,
} from '../../../../lib/authCryptoHelper'
import { SystemClock, type IClock } from '../../../../lib/clock'
import { normalizeEmail, toUserDto } from '../authShared'
import { AuthServiceError } from '../errors'
import { LoginRepository, type ILoginRepository } from './loginRepository'
import type { LoginArgs, LoginResult } from './types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export class LoginService {
  constructor(
    private readonly repository: ILoginRepository,
    private readonly cryptoHelper: IAuthCryptoHelper,
    private readonly clock: IClock
  ) {}

  async loginUser(params: LoginArgs): Promise<LoginResult> {
    const email =
      typeof params.body.email === 'string'
        ? normalizeEmail(params.body.email)
        : ''
    const password =
      typeof params.body.password === 'string' ? params.body.password : ''

    if (!email || !password) {
      throw new AuthServiceError(
        'Email and password are required.',
        400,
        'auth.login.invalid_payload'
      )
    }

    const emailRecord = await this.repository.findEmailRecord(email)

    const identity = emailRecord?.user.identities[0]

    if (!emailRecord || !identity?.passwordHash) {
      throw new AuthServiceError(
        'Invalid email or password.',
        401,
        'auth.login.invalid_credentials',
        { email }
      )
    }

    if (emailRecord.user.status === UserStatus.SUSPENDED) {
      throw new AuthServiceError(
        'This account has been suspended.',
        403,
        'auth.login.suspended_user',
        { userId: emailRecord.user.id }
      )
    }

    const passwordMatches = await this.cryptoHelper.verifyPassword(
      password,
      identity.passwordHash
    )

    if (!passwordMatches) {
      throw new AuthServiceError(
        'Invalid email or password.',
        401,
        'auth.login.invalid_credentials',
        { userId: emailRecord.user.id }
      )
    }

    const now = this.clock.now()
    const sessionToken = this.cryptoHelper.createSessionToken()
    const sessionTokenHash = this.cryptoHelper.hashSessionToken(sessionToken)
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS)

    await this.repository.persistSuccessfulLogin({
      userId: emailRecord.user.id,
      lastLoginAt: now,
      session: {
        userId: emailRecord.user.id,
        refreshTokenHash: sessionTokenHash,
        expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })

    const result: LoginResult = {
      result: {
        user: toUserDto({
          user: emailRecord.user,
          provider: identity.provider,
        }),
        sessionToken,
      },
      logMeta: { userId: emailRecord.user.id },
    }
    return result
  }
}

const loginService = new LoginService(
  new LoginRepository(),
  new AuthCryptoHelper(),
  new SystemClock()
)

export function loginUser(params: LoginArgs): Promise<LoginResult> {
  return loginService.loginUser(params)
}
