import type { AuthProvider, UserProfile } from '../types/auth'

type AuthUserResponse = UserProfile & {
  id: string
  status: string
}

type AuthResponse = {
  user: AuthUserResponse
  sessionToken: string
}

function parseErrorMessage(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error
  }

  return fallback
}

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? ''

async function postAuthRequest<TResponse>(
  path: string,
  body: unknown,
  sessionToken?: string
): Promise<TResponse> {
  const response = await fetch(`${backendUrl}/api/auth/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(body),
  })

  const payload = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(
        payload,
        `Request failed with status ${response.status}`
      )
    )
  }

  return payload as TResponse
}

export async function loginWithCredentials(params: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return postAuthRequest<AuthResponse>('login', params)
}

export async function loginWithGoogle(params: {
  accessToken: string
}): Promise<AuthResponse> {
  return postAuthRequest<AuthResponse>('google', params)
}

export async function loginWithFacebook(params: {
  code: string
  redirectUri: string
}): Promise<AuthResponse> {
  return postAuthRequest<AuthResponse>('facebook', params)
}

export async function loginWithMicrosoft(params: {
  accessToken: string
}): Promise<AuthResponse> {
  return postAuthRequest<AuthResponse>('microsoft', params)
}

export async function registerWithCredentials(params: {
  displayName: string
  email: string
  password: string
}): Promise<AuthResponse> {
  return postAuthRequest<AuthResponse>('register', params)
}

export async function logoutWithSessionToken(
  sessionToken: string
): Promise<void> {
  await postAuthRequest<{ success: true }>(
    'logout',
    { sessionToken },
    sessionToken
  )
}

export async function getCurrentUser(
  sessionToken: string
): Promise<AuthUserResponse | null> {
  const url = `${backendUrl}/api/auth/me`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  })

  if (response.status === 401) {
    return null
  }

  const payload = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(
        payload,
        `Request failed with status ${response.status}`
      )
    )
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'user' in payload &&
    payload.user &&
    typeof payload.user === 'object'
  ) {
    return payload.user as AuthUserResponse
  }

  return null
}

export function mapApiUserToProfile(user: AuthUserResponse): UserProfile {
  const supportedProvider =
    user.authProvider === 'Credentials' ||
    user.authProvider === 'Google' ||
    user.authProvider === 'Facebook' ||
    user.authProvider === 'Microsoft'

  return {
    displayName: user.displayName,
    email: user.email,
    authProvider: supportedProvider
      ? user.authProvider
      : ('Credentials' as AuthProvider),
    role: user.role,
  }
}
