import { AuthProvider } from '@prisma/client'
import {
  AuthCryptoHelper,
  type IAuthCryptoHelper,
} from '../../../../lib/authCryptoHelper'
import { SystemClock, type IClock } from '../../../../lib/clock'
import { toUserDto } from '../authShared'
import { AuthServiceError } from '../errors'
import { MeRepository, type IMeRepository } from './meRepository'
import type { MeArgs, MeResult } from './types'

export class MeService {
  constructor(
    private readonly repository: IMeRepository,
    private readonly cryptoHelper: IAuthCryptoHelper,
    private readonly clock: IClock
  ) {}

  async getCurrentUser(params: MeArgs): Promise<MeResult> {
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

    const result: MeResult = {
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

const meService = new MeService(
  new MeRepository(),
  new AuthCryptoHelper(),
  new SystemClock()
)

export function getCurrentUser(params: MeArgs): Promise<MeResult> {
  return meService.getCurrentUser(params)
}
