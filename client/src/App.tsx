import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl'
import RouteIcon from '@mui/icons-material/Route'
import TerminalIcon from '@mui/icons-material/Terminal'
import {
  Box,
  Chip,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { getHealthStatus } from './api/health'
import { HealthStatusCard } from './components/HealthStatusCard'
import type { HealthResponse } from './types/api'

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadHealthStatus() {
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
    <Box component="main" sx={{ py: { xs: 4, md: 7 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3.5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 6,
              border: '1px solid',
              borderColor: 'divider',
              background:
                'linear-gradient(135deg, rgba(255,250,240,0.94) 0%, rgba(241,248,244,0.92) 100%)',
              boxShadow: '0 24px 60px rgba(71, 49, 17, 0.12)',
            }}
          >
            <Stack spacing={3}>
              <Chip
                label="Full-stack starter"
                color="secondary"
                variant="outlined"
                sx={{ alignSelf: 'flex-start', letterSpacing: '0.14em' }}
              />
              <Box>
                <Typography
                  variant="h1"
                  sx={{ maxWidth: '10ch', mb: 2, textWrap: 'balance' }}
                >
                  React on the front, Express on the back.
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ maxWidth: 720 }}
                >
                  This workspace starts with a Vite client, a TypeScript Express
                  API, shared npm workspace scripts, and Material UI ready to
                  use.
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Chip icon={<TerminalIcon />} label="npm run dev" />
                <Chip icon={<ChecklistRtlIcon />} label="npm run build" />
                <Chip icon={<ChecklistRtlIcon />} label="npm run lint" />
              </Stack>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
            }}
          >
            <HealthStatusCard
              health={health}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />

            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 6,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'rgba(255, 252, 247, 0.78)',
                boxShadow: '0 24px 60px rgba(71, 49, 17, 0.12)',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5">Project structure</Typography>
                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <RouteIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Client code is split into api, components, and types." />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <RouteIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Server code is split into config, routes, and app bootstrap." />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <RouteIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Vite proxies /api requests to the local Express server in development." />
                  </ListItem>
                </List>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default App
