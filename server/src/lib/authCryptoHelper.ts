import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from './auth'

export interface IAuthCryptoHelper {
  hashPassword(password: string): Promise<string>
  verifyPassword(password: string, storedHash: string): Promise<boolean>
  createSessionToken(): string
  hashSessionToken(token: string): string
}

export class AuthCryptoHelper implements IAuthCryptoHelper {
  hashPassword(password: string): Promise<string> {
    return hashPassword(password)
  }

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
