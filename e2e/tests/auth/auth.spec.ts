import { expect } from '@playwright/test'
import { registerUserViaApi } from '../api/api'
import { test } from './auth.fixture'

test('registers a new user from the registration page', async ({
  page,
  user,
  auth,
}) => {
  await page.goto('/register')
  await expect(page).toHaveURL('/register')

  await auth.signUpWithCredentials(user)

  await expect(page).toHaveURL('/')
  const welcomeMessage = `Welcome back, ${user.displayName}.`
  await expect(page.getByText(welcomeMessage)).toBeVisible()
  await expect(page.getByText(user.email)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
})

test('logs in an existing credentials user', async ({
  page,
  user,
  auth,
  request,
}) => {
  await registerUserViaApi(request, user)
  await auth.signInWithCredentials(user)

  await expect(page).toHaveURL('/')
  await expect(
    page.getByText(`Welcome back, ${user.displayName}.`)
  ).toBeVisible()

  await expect(page.getByText(user.email)).toBeVisible()
  await expect(page.getByText('Credentials')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
})

test('logs out the active user', async ({ page, user, auth, request }) => {
  await registerUserViaApi(request, user)
  await auth.signInWithCredentials(user)

  await page.getByRole('button', { name: 'Sign out' }).click()

  const dashboardText = 'Authentication starter dashboard.'
  await expect(page.getByText(dashboardText)).toBeVisible()
  await expect(page.getByText('The user is not logged in.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0)
})

test('user stays logged in after page reload', async ({
  page,
  user,
  auth,
  request,
}) => {
  await registerUserViaApi(request, user)
  await auth.signInWithCredentials(user)

  const welcomeText = `Welcome back, ${user.displayName}.`
  await expect(page.getByText(welcomeText)).toBeVisible()

  await page.reload()

  await expect(page.getByText(welcomeText)).toBeVisible()
})
