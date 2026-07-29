import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import { AppBar, Box, Chip, Container, Stack, Toolbar } from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router'
import { getHealthStatus } from './api/health'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import type { HealthResponse } from './types/api'
import type { UserProfile } from './types/auth'

const App = () => {
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

  const signInWithCredentials = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const displayName = normalizedEmail.split('@')[0] || 'user'

    setUser({
      displayName: displayName
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part[0]!.toUpperCase() + part.slice(1))
        .join(' '),
      email: normalizedEmail,
      authProvider: 'Credentials',
      role: 'Member',
    })
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

  const signOut = () => {
    setUser(null)
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(246, 239, 227, 0.84)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1.5, py: 1.25 }}>
            <Chip
              icon={<AccountCircleOutlinedIcon />}
              label={user ? user.displayName : 'Guest mode'}
              color={user ? 'secondary' : 'default'}
              variant={user ? 'filled' : 'outlined'}
            />
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
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

      <Box component="main" sx={{ py: { xs: 4, md: 7 } }}>
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
                  onProviderSignIn={signInWithProvider}
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
