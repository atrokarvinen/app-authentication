import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getCurrentUser,
  loginWithCredentials,
  loginWithFacebook,
  loginWithGoogle,
  logoutWithSessionToken,
  mapApiUserToProfile,
  registerWithCredentials,
} from '../api/auth'
import type {
  AuthProvider as AuthProviderType,
  UserProfile,
} from '../types/auth'

const SESSION_TOKEN_KEY = 'app_auth_session_token'

type AuthContextValue = {
  user: UserProfile | null
  signInWithCredentials: (email: string, password: string) => Promise<void>
  signInWithGoogle: (accessToken: string) => Promise<void>
  signInWithFacebook: (code: string) => Promise<void>
  signInWithProvider: (provider: AuthProviderType) => void
  register: (params: {
    displayName: string
    email: string
    password: string
  }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      const sessionToken = window.localStorage.getItem(SESSION_TOKEN_KEY)
      if (!sessionToken) return

      try {
        const currentUser = await getCurrentUser(sessionToken)
        if (!isMounted) return

        if (!currentUser) {
          window.localStorage.removeItem(SESSION_TOKEN_KEY)
          setUser(null)
          return
        }

        setUser(mapApiUserToProfile(currentUser))
      } catch {
        if (!isMounted) return
        window.localStorage.removeItem(SESSION_TOKEN_KEY)
        setUser(null)
      }
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const storeSession = (sessionToken: string) => {
    window.localStorage.setItem(SESSION_TOKEN_KEY, sessionToken)
  }

  const signInWithCredentials = async (email: string, password: string) => {
    const authResponse = await loginWithCredentials({ email, password })
    storeSession(authResponse.sessionToken)
    setUser(mapApiUserToProfile(authResponse.user))
  }

  const signInWithGoogle = async (accessToken: string) => {
    const authResponse = await loginWithGoogle({ accessToken })
    storeSession(authResponse.sessionToken)
    setUser(mapApiUserToProfile(authResponse.user))
  }

  const signInWithFacebook = async (code: string) => {
    const redirectUri = `${window.location.origin}/auth/facebook/callback`
    const authResponse = await loginWithFacebook({ code, redirectUri })
    storeSession(authResponse.sessionToken)
    setUser(mapApiUserToProfile(authResponse.user))
  }

  const signInWithProvider = (provider: AuthProviderType) => {
    const providerProfiles: Record<AuthProviderType, UserProfile> = {
      Credentials: {
        displayName: 'Demo Member',
        email: 'member@example.com',
        authProvider: 'Credentials',
        role: 'Member',
      },
      Google: {
        displayName: 'Aino Google',
        email: 'aino.google@example.com',
        authProvider: 'Google',
        role: 'Member',
      },
      Facebook: {
        displayName: 'Felix Facebook',
        email: 'felix.facebook@example.com',
        authProvider: 'Facebook',
        role: 'Community Admin',
      },
      Microsoft: {
        displayName: 'Mira Microsoft',
        email: 'mira.microsoft@example.com',
        authProvider: 'Microsoft',
        role: 'Workspace Owner',
      },
    }
    setUser(providerProfiles[provider])
  }

  const register = async (params: {
    displayName: string
    email: string
    password: string
  }) => {
    const authResponse = await registerWithCredentials(params)
    storeSession(authResponse.sessionToken)
    setUser(mapApiUserToProfile(authResponse.user))
  }

  const signOut = async () => {
    const sessionToken = window.localStorage.getItem(SESSION_TOKEN_KEY)
    if (sessionToken) {
      try {
        await logoutWithSessionToken(sessionToken)
      } catch {
        // Keep logout robust even if server session is already invalid.
      }
    }
    window.localStorage.removeItem(SESSION_TOKEN_KEY)
    setUser(null)
  }

  const contextValue = useMemo(
    () => ({
      user,
      signInWithCredentials,
      signInWithGoogle,
      signInWithFacebook,
      signInWithProvider,
      register,
      signOut,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
