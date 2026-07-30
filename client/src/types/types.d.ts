import type { FacebookIdentityServices } from '../components/auth/facebook-types'
import type { GoogleIdentityServices } from '../components/auth/types'

declare global {
  interface Window {
    google?: GoogleIdentityServices
    FB?: FacebookIdentityServices
  }
}
