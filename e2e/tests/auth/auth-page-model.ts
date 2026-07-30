import type { Page } from '@playwright/test'
import type { CredentialsUser } from '../types/credentials-user'

export class AuthPageModel {
  constructor(private readonly page: Page) {}

  async signUpWithCredentials(user: CredentialsUser) {
    await this.page.getByLabel('Display name').fill(user.displayName)
    await this.page.getByLabel('Email').fill(user.email)
    await this.page
      .getByLabel('Password *', { exact: true })
      .fill(user.password)
    await this.page.getByLabel('Confirm password').fill(user.password)
    await this.page.getByRole('button', { name: 'Register' }).click()
  }

  async signInWithCredentials(user: CredentialsUser) {
    await this.page.goto('/login')
    await this.page.getByLabel('Email').fill(user.email)
    await this.page.getByLabel('Password').fill(user.password)
    await this.page
      .getByRole('button', { name: 'Sign in', exact: true })
      .click()
  }
}
