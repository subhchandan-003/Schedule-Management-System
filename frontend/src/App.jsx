import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, hasAnyCourses } from './supabase'
import Login from './pages/Login'
import CourseSelect from './pages/CourseSelect'
import Schedule from './pages/Schedule'

const ALLOWED_DOMAIN = '@iimsambalpur.ac.in'

function Spinner() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
    </div>
  )
}

export default function App() {
  const [session, setSession]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [domainError, setDomainError] = useState(false)
  const [setupDone, setSetupDone]     = useState(false)

  const processSession = async (sess) => {
    if (!sess) {
      setSession(null)
      setLoading(false)
      return
    }

    // Domain restriction
    if (!sess.user.email?.endsWith(ALLOWED_DOMAIN)) {
      await supabase.auth.signOut()
      setDomainError(true)
      setSession(null)
      setLoading(false)
      return
    }

    const done = await hasAnyCourses(sess.user.id)
    setSetupDone(done)
    setSession(sess)
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => processSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => {
      processSession(sess)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <Spinner />

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            !session
              ? <Login domainError={domainError} />
              : setupDone
                ? <Navigate to="/schedule" replace />
                : <Navigate to="/select" replace />
          }
        />
        <Route
          path="/select"
          element={
            session
              ? <CourseSelect session={session} onSaved={() => setSetupDone(true)} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/schedule"
          element={session ? <Schedule session={session} /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
