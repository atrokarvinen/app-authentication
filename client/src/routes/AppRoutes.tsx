import { Route, Routes } from 'react-router'
import { FacebookCallbackPage } from '../pages/auth/FacebookCallbackPage'
import { MicrosoftCallbackPage } from '../pages/auth/MicrosoftCallbackPage'
import { HomePage } from '../pages/home/HomePage'
import { LoginPage } from '../pages/login/LoginPage'
import { RegistrationPage } from '../pages/login/RegistrationPage'

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/auth/facebook/callback" element={<FacebookCallbackPage />} />
    <Route
      path="/auth/microsoft/callback"
      element={<MicrosoftCallbackPage />}
    />
    <Route path="/register" element={<RegistrationPage />} />
  </Routes>
)
