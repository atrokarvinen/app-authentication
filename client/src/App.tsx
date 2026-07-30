import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import { AppBar, Box, Chip, Container, Stack, Toolbar } from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router'
import {
  getCurrentUser,
  loginWithCredentials,
  loginWithGoogle,
  logoutWithSessionToken,
  mapApiUserToProfile,
  registerWithCredentials,
} from './api/auth'
import { getHealthStatus } from './api/health'
import styles from './App.module.css'
import { HomePage } from './pages/home/HomePage'
import { LoginPage } from './pages/login/LoginPage'
import { RegistrationPage } from './pages/login/RegistrationPage'
import type { HealthResponse } from './types/api'
import type { UserProfile } from './types/auth'

const App = () => {
  const SESSION_TOKEN_STORAGE_KEY = 'app_auth_session_token'

  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadHealthStatus = async () => {
      try {
        const response = await getHealthStatus()
        if (isMounted) {
          setHealth(response)
          setErrorMessage(null)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unknown server error'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadHealthStatus()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      const sessionToken = window.localStorage.getItem(
        SESSION_TOKEN_STORAGE_KEY
      )

      if (!sessionToken) {
        return
      }

      try {
        const currentUser = await getCurrentUser(sessionToken)

        if (!isMounted) {
          return
        }

        if (!currentUser) {
          window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
          setUser(null)
          return
        }

        setUser(mapApiUserToProfile(currentUser))
      } catch {
        if (!isMounted) {
          return
        }

        window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
        setUser(null)
      }
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [SESSION_TOKEN_STORAGE_KEY])

  const signInWithCredentials = async (email: string, password: string) => {
    const authResponse = await loginWithCredentials({ email, password })

    window.localStorage.setItem(
      SESSION_TOKEN_STORAGE_KEY,
      authResponse.sessionToken
    )
    setUser(mapApiUserToProfile(authResponse.user))
  }

  const signInWithGoogle = async (accessToken: string) => {
    const authResponse = await loginWithGoogle({ accessToken })

    window.localStorage.setItem(
      SESSION_TOKEN_STORAGE_KEY,
      authResponse.sessionToken
    )
    setUser(mapApiUserToProfile(authResponse.user))
  }

  const registerCredentialsUser = async (params: {
    displayName: string
    email: string
    password: string
  }) => {
    const authResponse = await registerWithCredentials(params)

    window.localStorage.setItem(
      SESSION_TOKEN_STORAGE_KEY,
      authResponse.sessionToken
    )
    setUser(mapApiUserToProfile(authResponse.user))
  }

  const signInWithProvider = (provider: UserProfile['authProvider']) => {
    const providerProfiles: Record<UserProfile['authProvider'], UserProfile> = {
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

  const signOut = async () => {
    const sessionToken = window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)

    if (sessionToken) {
      try {
        await logoutWithSessionToken(sessionToken)
      } catch {
        // Keep logout robust even if server session is already invalid.
      }
    }

    window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
    setUser(null)
  }

  return (
    <Box className={styles.appRoot}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        className={styles.appBar}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters className={styles.toolbar}>
            <Chip
              icon={<AccountCircleOutlinedIcon />}
              label={user ? user.displayName : 'Guest mode'}
              color={user ? 'secondary' : 'default'}
              variant={user ? 'filled' : 'outlined'}
            />
            <Stack direction="row" spacing={1} className={styles.navStack}>
              <Chip
                clickable
                component={NavLink}
                to="/"
                icon={<CottageOutlinedIcon />}
                label="Home"
                variant="outlined"
                sx={{
                  '&.active': {
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                  },
                }}
              />
              <Chip
                clickable
                component={NavLink}
                to="/login"
                icon={<LoginOutlinedIcon />}
                label={user ? 'Switch account' : 'Login'}
                variant="outlined"
                sx={{
                  '&.active': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              />
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" className={styles.mainContent}>
        <Container maxWidth="lg">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  user={user}
                  health={health}
                  isLoading={isLoading}
                  errorMessage={errorMessage}
                  onSignOut={signOut}
                />
              }
            />
            <Route
              path="/login"
              element={
                <LoginPage
                  user={user}
                  onSignIn={signInWithCredentials}
                  onGoogleSignIn={signInWithGoogle}
                  onProviderSignIn={signInWithProvider}
                />
              }
            />
            <Route
              path="/register"
              element={
                <RegistrationPage
                  user={user}
                  onRegister={registerCredentialsUser}
                />
              }
            />
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}

export default App
