import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import {
  CalendarPage,
  DashboardPage,
  LandingPage,
  LoginPage,
  PartnerPage,
  ProfilePage,
  ProjectDetailPage,
  ProjectPage,
  RegisterPage,
  TaskListPage,
} from './lib/routePreload'

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 600,
          },
          success: {
            iconTheme: { primary: '#059669', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#e11d48', secondary: '#fff' },
          },
        }}
      />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm font-bold text-slate-500">Loading...</p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/mytask" element={<ProtectedRoute><TaskListPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/partner" element={<ProtectedRoute><PartnerPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Aliases */}
          <Route path="/beranda" element={<Navigate to="/dashboard" replace />} />
          <Route path="/my-task" element={<Navigate to="/mytask" replace />} />
          <Route path="/daftar-tugas" element={<Navigate to="/mytask" replace />} />
          <Route path="/project" element={<Navigate to="/projects" replace />} />
          <Route path="/kalender" element={<Navigate to="/calendar" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
