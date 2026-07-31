import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded'
import { Button, Stack } from '@mui/material'
import { FACEBOOK_REDIRECT_URI } from './constants'

type Props = {
  appId?: string
  onSignIn: (code: string) => Promise<void>
}

export const FacebookSignInButtonAlt = ({ appId }: Props) => {
  if (!appId) return null
  return (
    <Stack spacing={0.5}>
      <Button
        variant="outlined"
        size="large"
        startIcon={<FacebookRoundedIcon />}
        href={`https://www.facebook.com/v26.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&state=test`}
      >
        Sign in with Facebook
      </Button>
    </Stack>
  )
}
