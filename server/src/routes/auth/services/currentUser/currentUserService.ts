import { AuthProvider } from '@prisma/client'
import {
  AuthCryptoHelper,
  type IAuthCryptoHelper,
} from '../../../../lib/authCryptoHelper'
import { SystemClock, type IClock } from '../../../../lib/clock'
import { toUserDto } from '../authShared'
import { AuthServiceError } from '../errors'
import {
  CurrentUserRepository,
  type ICurrentUserRepository,
} from './currentUserRepository'
import type { CurrentUserArgs, CurrentUserResult } from './types'

export class CurrentUserService {
  constructor(
    private readonly repository: ICurrentUserRepository,
    private readonly cryptoHelper: IAuthCryptoHelper,
    private readonly clock: IClock
  ) {}

  async getCurrentUser(params: CurrentUserArgs): Promise<CurrentUserResult> {
    if (!params.sessionToken) {
      throw new AuthServiceError(
        'Not authenticated.',
        401,
        'auth.me.missing_token'
      )
    }

    const session = await this.repository.findActiveSessionByTokenHash(
      this.cryptoHelper.hashSessionToken(params.sessionToken),
      this.clock.now()
    )

    if (!session) {
      throw new AuthServiceError(
        'Session is invalid or expired.',
        401,
        'auth.me.invalid_or_expired_session'
      )
    }

    const provider =
      session.user.identities[0]?.provider || AuthProvider.CREDENTIALS

    const result: CurrentUserResult = {
      result: {
        user: toUserDto({
          user: session.user,
          provider,
        }),
      },
      logMeta: { userId: session.user.id },
    }

    return result
  }
}

const currentUserService = new CurrentUserService(
  new CurrentUserRepository(),
  new AuthCryptoHelper(),
  new SystemClock()
)

export function getCurrentUser(
  params: CurrentUserArgs
): Promise<CurrentUserResult> {
  return currentUserService.getCurrentUser(params)
}
