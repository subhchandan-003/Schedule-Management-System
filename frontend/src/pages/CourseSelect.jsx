import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Check, Loader, AlertCircle, Save } from 'lucide-react'
import { fetchSchedule, extractAllCourses } from '../sheetsAPI'
import { getUserCourses, saveUserCourses } from '../supabase'
import TermTabs from '../components/TermTabs'
import { getCourseColor } from '../courseColors'

export default function CourseSelect({ session, onSaved }) {
  const [activeTerm, setActiveTerm]   = useState(4)
  const [termCourses, setTermCourses] = useState({ 4: [], 5: [], 6: [] })
  const [termLoading, setTermLoading] = useState({ 4: false, 5: false, 6: false })
  const [termError, setTermError]     = useState({ 4: null, 5: null, 6: null })
  const [selected, setSelected]       = useState({ 4: new Set(), 5: new Set(), 6: new Set() })
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState(null)
  const navigate = useNavigate()

  const token = session?.provider_token

  // Load saved selections on mount
  useEffect(() => {
    async function loadSaved() {
      try {
        const [t4, t5, t6] = await Promise.all([
          getUserCourses(session.user.id, 4),
          getUserCourses(session.user.id, 5),
          getUserCourses(session.user.id, 6),
        ])
        setSelected({ 4: new Set(t4), 5: new Set(t5), 6: new Set(t6) })
      } catch (_) {}
    }
    loadSaved()
  }, [session.user.id])

  // Load courses for a term on demand (when tab is selected)
  useEffect(() => {
    if (termCourses[activeTerm].length > 0) return  // already loaded
    if (!token) return

    setTermLoading((p) => ({ ...p, [activeTerm]: true }))
    setTermError((p) => ({ ...p, [activeTerm]: null }))

    fetchSchedule(activeTerm, token)
      .then((entries) => {
        setTermCourses((p) => ({ ...p, [activeTerm]: extractAllCourses(entries) }))
      })
      .catch((e) => {
        setTermError((p) => ({ ...p, [activeTerm]: e.message }))
      })
      .finally(() => {
        setTermLoading((p) => ({ ...p, [activeTerm]: false }))
      })
  }, [activeTerm, token])

  const toggle = (courseId) => {
    setSelected((prev) => {
      const next = new Set(prev[activeTerm])
      next.has(courseId) ? next.delete(courseId) : next.add(courseId)
      return { ...prev, [activeTerm]: next }
    })
  }

  const totalSelected = [4, 5, 6].reduce((s, t) => s + selected[t].size, 0)

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await Promise.all(
        [4, 5, 6].map((t) => saveUserCourses(session.user.id, t, [...selected[t]]))
      )
      onSaved()
      navigate('/schedule')
    } catch (e) {
      setSaveError(e.message)
      setSaving(false)
    }
  }

  const courses   = termCourses[activeTerm]
  const isLoading = termLoading[activeTerm]
  const error     = termError[activeTerm]

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <BookOpen size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm leading-tight">Select your courses</h1>
          <p className="text-slate-500 text-xs">
            {session.user.email} · {totalSelected} selected
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-4 py-6">
        <TermTabs activeTerm={activeTerm} onChange={setActiveTerm} />

        {/* Course list */}
        <div className="flex-1 mt-4">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
              <Loader size={24} className="animate-spin" />
              <span className="text-sm">Loading Term {activeTerm} courses…</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Could not load schedule</p>
                <p className="text-rose-400/70 text-xs mt-0.5">{error}</p>
                {error === 'AUTH_EXPIRED' && (
                  <p className="text-xs mt-1 text-rose-400/70">
                    Your session expired. Please sign out and sign in again.
                  </p>
                )}
              </div>
            </div>
          )}

          {!isLoading && !error && courses.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-16">
              No courses found in Term {activeTerm} — check the sheet tab name in your env config.
            </p>
          )}

          {!isLoading && !error && courses.length > 0 && (
            <div className="space-y-1.5">
              {courses.map(({ id, label }) => {
                const on    = selected[activeTerm].has(id)
                const color = getCourseColor(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all
                      ${on
                        ? `${color.bg} ${color.border} ${color.text}`
                        : 'border-slate-800 bg-slate-800/30 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors
                      ${on ? `${color.border} ${color.text}` : 'border-slate-700'}`}>
                      {on && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium truncate">{label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Save */}
        {saveError && (
          <p className="text-rose-400 text-xs text-center mb-3">{saveError}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving || totalSelected === 0}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : `Save ${totalSelected} course${totalSelected !== 1 ? 's' : ''} →`}
        </button>
      </div>
    </div>
  )
}
