import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Settings, LogOut, RefreshCw, AlertCircle, Loader } from 'lucide-react'
import { supabase, getUserCourses } from '../supabase'
import { fetchSchedule } from '../sheetsAPI'
import TermTabs from '../components/TermTabs'
import ScheduleGrid from '../components/ScheduleGrid'

export default function Schedule({ session }) {
  const [activeTerm, setActiveTerm]       = useState(4)
  const [entries, setEntries]             = useState([])
  const [userCourseIds, setUserCourseIds] = useState(new Set())
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [refreshing, setRefreshing]       = useState(false)
  const navigate  = useNavigate()
  const token     = session?.provider_token

  const loadData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    setError(null)
    try {
      const [scheduleData, savedCodes] = await Promise.all([
        fetchSchedule(activeTerm, token),
        getUserCourses(session.user.id, activeTerm),
      ])
      setEntries(scheduleData)
      setUserCourseIds(new Set(savedCodes))
    } catch (e) {
      if (e.message === 'AUTH_EXPIRED') {
        await supabase.auth.signOut()
        navigate('/')
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeTerm, token, session.user.id, navigate])

  useEffect(() => { loadData() }, [loadData])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0F172A]/90 backdrop-blur border-b border-slate-800 px-4 h-13 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-semibold text-xs leading-tight">IIM Sambalpur Schedule</p>
            <p className="text-slate-500 text-[10px] leading-tight">{session.user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => loadData(true)}
            title="Refresh from Google Sheet"
            className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => navigate('/select')}
            title="Edit course selection"
            className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Settings size={15} />
          </button>
          <button
            onClick={signOut}
            title="Sign out"
            className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-4">
          <TermTabs activeTerm={activeTerm} onChange={setActiveTerm} />
        </div>

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader size={24} className="animate-spin" />
            <span className="text-sm">Loading Term {activeTerm} schedule…</span>
          </div>
        )}

        {!loading && error && (
          <div className="mx-4 mt-4 flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3.5 rounded-xl text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Failed to load schedule</p>
              <p className="text-rose-400/70 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="flex-1 overflow-auto px-4 pb-6 pt-3">
            <ScheduleGrid entries={entries} userCourseIds={userCourseIds} />
          </div>
        )}
      </main>
    </div>
  )
}
