import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import { AppBar, Box, Chip, Container, Stack, Toolbar } from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router'
import { getHealthStatus } from './api/health'
import styles from './App.module.css'
import { useAuth } from './context/AuthContext'
import { FacebookCallbackPage } from './pages/auth/FacebookCallbackPage'
import { HomePage } from './pages/home/HomePage'
import { LoginPage } from './pages/login/LoginPage'
import { RegistrationPage } from './pages/login/RegistrationPage'
import type { HealthResponse } from './types/api'

const App = () => {
  const { user } = useAuth()

  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
                  health={health}
                  isLoading={isLoading}
                  errorMessage={errorMessage}
                />
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/auth/facebook/callback"
              element={<FacebookCallbackPage />}
            />
            <Route path="/register" element={<RegistrationPage />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}

export default App
