import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import HubIcon from '@mui/icons-material/Hub'
import PendingIcon from '@mui/icons-material/Pending'
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import type { HealthResponse } from '../types/api'

type HealthStatusCardProps = {
  health: HealthResponse | null
  isLoading: boolean
  errorMessage: string | null
}

export function HealthStatusCard({
  health,
  isLoading,
  errorMessage,
}: HealthStatusCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 6,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(255, 252, 247, 0.78)',
        boxShadow: '0 24px 60px rgba(71, 49, 17, 0.12)',
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HealthAndSafetyIcon color="primary" />
              <Typography variant="h5">API health</Typography>
            </Stack>
            <Chip
              color={health ? 'success' : 'warning'}
              icon={health ? <CheckCircleIcon /> : <PendingIcon />}
              label={health ? 'Online' : 'Pending'}
            />
          </Stack>

          {isLoading ? (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={20} />
              <Typography color="text.secondary">
                Checking backend connection...
              </Typography>
            </Stack>
          ) : null}

          {errorMessage ? (
            <Alert severity="error" icon={<ErrorOutlineIcon fontSize="inherit" />}>
              {errorMessage}
            </Alert>
          ) : null}

          {health ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleIcon color="success" />
                <Typography>
                  Status: <strong>{health.status}</strong>
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <HubIcon color="secondary" />
                <Typography>
                  Service: <strong>{health.service}</strong>
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AccessTimeIcon color="action" />
                <Typography>
                  Checked at: <strong>{new Date(health.timestamp).toLocaleString()}</strong>
                </Typography>
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
