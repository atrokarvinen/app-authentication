import { test as base } from '@playwright/test'
import { deleteUserViaApi } from '../api/api'
import {
  createCredentialsUser,
  CredentialsUser,
} from '../types/credentials-user'
import { AuthPageModel } from './auth-page-model'

type AuthFixtures = {
  user: CredentialsUser
  auth: AuthPageModel
}

export const test = base.extend<AuthFixtures>({
  user: async ({ request }, use) => {
    const user = createCredentialsUser('test-user')
    await deleteUserViaApi(request, user)
    await use(user)
    await deleteUserViaApi(request, user)
  },
  auth: async ({ page }, use) => {
    const authPageModel = new AuthPageModel(page)
    await use(authPageModel)
  },
})
