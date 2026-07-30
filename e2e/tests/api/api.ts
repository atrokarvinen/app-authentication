import type { APIRequestContext } from '@playwright/test'
import type { CredentialsUser } from '../types/credentials-user'

export async function registerUserViaApi(
  request: APIRequestContext,
  user: CredentialsUser
) {
  await request.post('/api/auth/register', {
    data: user,
    failOnStatusCode: true,
  })
}

export async function deleteUserViaApi(
  request: APIRequestContext,
  user: CredentialsUser
) {
  await request.delete('/api/auth/delete', {
    data: { email: user.email },
    failOnStatusCode: true,
  })
}
