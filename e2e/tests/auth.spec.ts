import type { APIRequestContext, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

type CredentialsUser = {
  displayName: string
  email: string
  password: string
}

const sessionTokenStorageKey = 'app_auth_session_token'

function createCredentialsUser(prefix: string): CredentialsUser {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return {
    displayName: `${prefix} ${uniqueSuffix}`,
    email: `${prefix.toLowerCase()}-${uniqueSuffix}@example.com`,
    password: 'Password123!',
  }
}

async function registerUserViaApi(
  request: APIRequestContext,
  user: CredentialsUser
) {
  const response = await request.post('/api/auth/register', {
    data: user,
  })

  expect(response.status()).toBe(201)
}

async function signInWithCredentials(page: Page, user: CredentialsUser) {
  await page.goto('/login')
  await page
    .getByRole('textbox', { name: 'Email', exact: true })
    .fill(user.email)
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill(user.password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click({
    force: true,
  })

  await expect(page).toHaveURL('/')
  await expect(
    page.getByText(`Welcome back, ${user.displayName}.`)
  ).toBeVisible()
}

test('registers a new user from the registration page', async ({ page }) => {
  const user = createCredentialsUser('register-user')

  await page.goto('/register')
  await expect(page).toHaveURL('/register')

  await page
    .getByRole('textbox', { name: 'Display name', exact: true })
    .fill(user.displayName)
  await page
    .getByRole('textbox', { name: 'Email', exact: true })
    .fill(user.email)
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill(user.password)
  await page
    .getByRole('textbox', { name: 'Confirm password', exact: true })
    .fill(user.password)
  await page.getByRole('button', { name: 'Register', exact: true }).click({
    force: true,
  })

  await expect(page).toHaveURL('/')
  await expect(
    page.getByText(`Welcome back, ${user.displayName}.`)
  ).toBeVisible()
  await expect(page.getByText(user.email)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()

  await expect
    .poll(() =>
      page.evaluate(
        (storageKey) => window.localStorage.getItem(storageKey),
        sessionTokenStorageKey
      )
    )
    .not.toBeNull()
})

test('logs in an existing credentials user', async ({ page, request }) => {
  const user = createCredentialsUser('login-user')

  await registerUserViaApi(request, user)
  await signInWithCredentials(page, user)

  await expect(page.getByText(user.email)).toBeVisible()
  await expect(page.getByText('Credentials')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
})

test('logs out the active user and clears the local session', async ({
  page,
  request,
}) => {
  const user = createCredentialsUser('logout-user')

  await registerUserViaApi(request, user)
  await signInWithCredentials(page, user)

  await page.getByRole('button', { name: 'Sign out' }).click()

  await expect(
    page.getByText('Authentication starter dashboard.')
  ).toBeVisible()
  await expect(page.getByText('The user is not logged in.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0)

  await expect
    .poll(() =>
      page.evaluate(
        (storageKey) => window.localStorage.getItem(storageKey),
        sessionTokenStorageKey
      )
    )
    .toBeNull()
})
