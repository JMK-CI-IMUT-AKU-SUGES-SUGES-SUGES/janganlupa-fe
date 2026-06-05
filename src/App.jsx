import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TaskList from './pages/TaskList'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import Project from './pages/Project'
import ProjectDetail from './pages/ProjectDetail'
import Partner from './pages/Partner'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/mytask" element={<TaskList />} />
      <Route path="/projects" element={<Project />} />
      <Route path="/projects/:projectId" element={<ProjectDetail />} />
      <Route path="/partner" element={<Partner />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/beranda" element={<Navigate to="/dashboard" replace />} />
      <Route path="/my-task" element={<Navigate to="/mytask" replace />} />
      <Route path="/daftar-tugas" element={<Navigate to="/mytask" replace />} />
      <Route path="/project" element={<Navigate to="/projects" replace />} />
      <Route path="/kalender" element={<Navigate to="/calendar" replace />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
