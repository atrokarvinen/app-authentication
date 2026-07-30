export type GoogleTokenClient = {
  requestAccessToken: () => void
}

export type GoogleIdentityServices = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        callback: (response: GoogleTokenResponse) => void
      }) => GoogleTokenClient
    }
  }
}

export type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}
