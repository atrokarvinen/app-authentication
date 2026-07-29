import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl'
import RouteIcon from '@mui/icons-material/Route'
import TerminalIcon from '@mui/icons-material/Terminal'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import {
  Avatar,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { HealthStatusCard } from '../components/HealthStatusCard'
import type { HealthResponse } from '../types/api'
import type { UserProfile } from '../types/auth'

type HomePageProps = {
  user: UserProfile | null
  health: HealthResponse | null
  isLoading: boolean
  errorMessage: string | null
  onSignOut: () => void
}

export const HomePage = ({
  user,
  health,
  isLoading,
  errorMessage,
  onSignOut,
}: HomePageProps) => {
  return (
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
            label={user ? 'Logged in' : 'Signed out'}
            color={user ? 'secondary' : 'default'}
            variant="outlined"
            sx={{ alignSelf: 'flex-start', letterSpacing: '0.14em' }}
          />
          <Box>
            <Typography
              variant="h1"
              sx={{ maxWidth: '10ch', mb: 2, textWrap: 'balance' }}
            >
              {user
                ? `Welcome back, ${user.displayName}.`
                : 'Authentication starter dashboard.'}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 760 }}
            >
              {user
                ? 'Your starter profile is active below. Replace this local state with backend-backed authentication when you wire the real auth flow.'
                : 'No user session is active. Use the login page to test credentials or social sign-in buttons.'}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Chip icon={<TerminalIcon />} label="npm run dev" />
            <Chip icon={<ChecklistRtlIcon />} label="npm run build" />
            <Chip icon={<ChecklistRtlIcon />} label="npm run lint" />
            <Button component={RouterLink} to="/login" variant="contained">
              {user ? 'Switch account' : 'Go to login'}
            </Button>
            {user ? (
              <Button variant="text" color="inherit" onClick={onSignOut}>
                Sign out
              </Button>
            ) : null}
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
          <Stack spacing={2.5}>
            <Typography variant="h5">Profile</Typography>

            {user ? (
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{ bgcolor: 'secondary.main', width: 52, height: 52 }}
                  >
                    {user.displayName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{user.displayName}</Typography>
                    <Typography color="text.secondary">{user.email}</Typography>
                  </Box>
                </Stack>

                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <VerifiedUserOutlinedIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Authentication method"
                      secondary={user.authProvider}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <RouteIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Role" secondary={user.role} />
                  </ListItem>
                </List>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Typography color="text.secondary">
                  The user is not logged in.
                </Typography>
                <Button component={RouterLink} to="/login" variant="contained">
                  Open login page
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>
    </Stack>
  )
}
