import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { LangProvider } from './contexts/LangContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ProfileWizardPage } from './pages/ProfileWizardPage'
import { ShortlistPage } from './pages/ShortlistPage'
import { PlanPage } from './pages/PlanPage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <ProfileProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shortlist"
                element={
                  <ProtectedRoute requireProfile>
                    <ShortlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plan/:id"
                element={
                  <ProtectedRoute requireProfile>
                    <PlanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireProfile>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ProfileProvider>
      </AuthProvider>
    </LangProvider>
  )
}
