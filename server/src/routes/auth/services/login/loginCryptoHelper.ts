import {
  createSessionToken,
  hashSessionToken,
  verifyPassword,
} from '../../../../lib/auth'

export interface ILoginCryptoHelper {
  verifyPassword(password: string, storedHash: string): Promise<boolean>
  createSessionToken(): string
  hashSessionToken(token: string): string
}

export class LoginCryptoHelper implements ILoginCryptoHelper {
  verifyPassword(password: string, storedHash: string): Promise<boolean> {
    return verifyPassword(password, storedHash)
  }

  createSessionToken(): string {
    return createSessionToken()
  }

  hashSessionToken(token: string): string {
    return hashSessionToken(token)
  }
}
