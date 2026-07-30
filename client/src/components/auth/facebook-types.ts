export type FacebookIdentityServices = {
  login: (
    callback: (response: FacebookLoginResponse) => void,
    config: LoginConfig
  ) => void
  init: (config: { appId: string; version: string; xfbml: boolean }) => void
}

export type FacebookLoginResponse = {
  authResponse?: {
    accessToken: string
    expiresIn: number
    signedRequest: string
    userID: string
  }
  status: 'connected' | 'not_authorized' | 'unknown'
}

export type LoginConfig = {
  scope: string
}
