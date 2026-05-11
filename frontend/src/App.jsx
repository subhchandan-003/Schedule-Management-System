import { Routes, Route, Navigate } from 'react-router-dom'
import { useScheduleStore } from './store/useScheduleStore'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import { Toast } from './components/ui/Toast'
import Home from './pages/Home'
import Schedule from './pages/Schedule'
import CourseList from './pages/CourseList'
import Admin from './pages/Admin'

function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          {children}
        </main>
      </div>
      <Toast />
    </div>
  )
}

export default function App() {
  const onboardingDone = useScheduleStore((s) => s.onboardingDone)

  return (
    <>
      <Routes>
        <Route path="/" element={onboardingDone ? <Navigate to="/schedule" replace /> : <Home />} />
        <Route
          path="/schedule"
          element={
            <AppShell>
              <Schedule />
            </AppShell>
          }
        />
        <Route
          path="/courses"
          element={
            <AppShell>
              <CourseList />
            </AppShell>
          }
        />
        <Route
          path="/admin"
          element={
            <AppShell>
              <Admin />
            </AppShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}
