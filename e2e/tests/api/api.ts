import type { APIRequestContext } from '@playwright/test'
import type { CredentialsUser } from '../types/credentials-user'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function registerUserViaApi(
  request: APIRequestContext,
  user: CredentialsUser
) {
  const url = `${BACKEND_URL}/api/auth/register`
  await request.post(url, { data: user, failOnStatusCode: true })
}

export async function deleteUserViaApi(
  request: APIRequestContext,
  user: CredentialsUser
) {
  const url = `${BACKEND_URL}/api/auth/dev/users?email=${encodeURIComponent(user.email)}`
  await request.delete(url, { failOnStatusCode: true })
}
