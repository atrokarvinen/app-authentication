import RouteIcon from '@mui/icons-material/Route'
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
import { useAuth } from '../../context/AuthContext'
import styles from './HomePage.module.css'

export const HomePage = () => {
  const { user, signOut } = useAuth()

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
                ? 'Your starter profile is active below.'
                : 'No user session is active. Use the login page to test credentials or social sign-in buttons.'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Box className={styles.dashboardGrid}>
        <Paper elevation={0} className={styles.profilePaper}>
          <Stack spacing={2.5}>
            <Typography variant="h5">Profile</Typography>

            {user ? (
              <Stack spacing={2.5}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center' }}
                >
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
                <div>
                  <Button variant="contained" color="primary" onClick={signOut}>
                    Logout
                  </Button>
                </div>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Typography color="text.secondary">
                  The user is not logged in.
                </Typography>
                <div>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                  >
                    Open login page
                  </Button>
                </div>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>
    </Stack>
  )
}
