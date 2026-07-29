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
import { HealthStatusCard } from '../../components/HealthStatusCard'
import type { HealthResponse } from '../../types/api'
import type { UserProfile } from '../../types/auth'
import styles from './HomePage.module.css'

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
      <Paper elevation={0} className={styles.heroPaper}>
        <Stack spacing={3}>
          <Chip
            label={user ? 'Logged in' : 'Signed out'}
            color={user ? 'secondary' : 'default'}
            variant="outlined"
            className={styles.statusChip}
          />
          <Box>
            <Typography variant="h1" className={styles.title}>
              {user
                ? `Welcome back, ${user.displayName}.`
                : 'Authentication starter dashboard.'}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              className={styles.summary}
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

      <Box className={styles.dashboardGrid}>
        <HealthStatusCard
          health={health}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />

        <Paper elevation={0} className={styles.profilePaper}>
          <Stack spacing={2.5}>
            <Typography variant="h5">Profile</Typography>

            {user ? (
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar className={styles.profileAvatar}>
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