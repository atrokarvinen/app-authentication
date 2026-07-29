import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const HASH_KEY_LENGTH = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, HASH_KEY_LENGTH)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, expectedHex] = storedHash.split(':')

  if (!salt || !expectedHex) {
    return false
  }

  const derivedKey = (await scrypt(password, salt, HASH_KEY_LENGTH)) as Buffer
  const expectedBuffer = Buffer.from(expectedHex, 'hex')

  if (derivedKey.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(derivedKey, expectedBuffer)
}

export function createSessionToken(): string {
  return randomBytes(48).toString('base64url')
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
