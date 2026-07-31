import { Route, Routes } from 'react-router'
import { FacebookRedirectPage } from '../pages/auth/FacebookRedirectPage'
import { MicrosoftRedirectPage } from '../pages/auth/MicrosoftRedirectPage'
import { HomePage } from '../pages/home/HomePage'
import { LoginPage } from '../pages/login/LoginPage'
import { RegistrationPage } from '../pages/login/RegistrationPage'

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/auth/facebook/callback" element={<FacebookRedirectPage />} />
    <Route
      path="/auth/microsoft/callback"
      element={<MicrosoftRedirectPage />}
    />
    <Route path="/register" element={<RegistrationPage />} />
  </Routes>
)
