import type { GoogleIdentityServices } from '../components/auth/types'

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}
