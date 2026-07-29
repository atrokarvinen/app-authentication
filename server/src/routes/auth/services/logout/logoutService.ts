import {
  AuthCryptoHelper,
  type IAuthCryptoHelper,
} from '../../../../lib/authCryptoHelper'
import { SystemClock, type IClock } from '../../../../lib/clock'
import { AuthServiceError } from '../errors'
import {
  PrismaLogoutRepository,
  type ILogoutRepository,
} from './logoutRepository'
import type { LogoutArgs, LogoutResult } from './types'

export class LogoutService {
  constructor(
    private readonly repository: ILogoutRepository,
    private readonly cryptoHelper: IAuthCryptoHelper,
    private readonly clock: IClock
  ) {}

  async logoutUser(params: LogoutArgs): Promise<LogoutResult> {
    if (!params.sessionToken) {
      throw new AuthServiceError(
        'Session token is required.',
        400,
        'auth.logout.missing_token'
      )
    }

    const revokedCount = await this.repository.revokeSessionByHash(
      this.cryptoHelper.hashSessionToken(params.sessionToken),
      this.clock.now()
    )

    const logoutResult: LogoutResult = { revokedCount }
    return logoutResult
  }
}

const logoutService = new LogoutService(
  new PrismaLogoutRepository(),
  new AuthCryptoHelper(),
  new SystemClock()
)

export function logoutUser(params: LogoutArgs): Promise<LogoutResult> {
  return logoutService.logoutUser(params)
}
