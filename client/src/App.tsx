import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ApiProvider } from './contexts/ApiContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { LangProvider } from './contexts/LangContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ProfileWizardPage } from './pages/ProfileWizardPage'
import { ProfilePage } from './pages/ProfilePage'
import { UniversityPage } from './pages/UniversityPage'
import { PlanPage } from './pages/PlanPage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <ApiProvider>
          <ProfileProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/setup"
                  element={
                    <ProtectedRoute>
                      <ProfileWizardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/university/:id"
                  element={
                    <ProtectedRoute requireProfile>
                      <UniversityPage />
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
        </ApiProvider>
      </AuthProvider>
    </LangProvider>
  )
}
