import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import { AppBar, Box, Chip, Container, Stack, Toolbar } from '@mui/material'
import { NavLink } from 'react-router'
import styles from './App.module.css'
import { useAuth } from './context/AuthContext'
import { AppRoutes } from './routes/AppRoutes'

const App = () => {
  const { user } = useAuth()

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
        <Container
          maxWidth="lg"
          sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
        >
          <AppRoutes />
        </Container>
      </Box>
    </Box>
  )
}

export default App
