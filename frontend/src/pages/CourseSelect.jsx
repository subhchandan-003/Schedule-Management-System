import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Check, Loader, AlertCircle, Save } from 'lucide-react'
import { fetchSchedule, extractAllCourses } from '../sheetsAPI'
import { getUserCourses, saveUserCourses } from '../supabase'
import { getCourseColor } from '../courseColors'

const TERM = 4

export default function CourseSelect({ session, onSaved }) {
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState(null)
  const navigate = useNavigate()
  const token = session?.provider_token

  useEffect(() => {
    async function init() {
      try {
        const [entries, saved] = await Promise.all([
          fetchSchedule(TERM, token),
          getUserCourses(session.user.id, TERM),
        ])
        setCourses(extractAllCourses(entries))
        setSelected(new Set(saved))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [token, session.user.id])

  const toggle = (courseId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(courseId) ? next.delete(courseId) : next.add(courseId)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await saveUserCourses(session.user.id, TERM, [...selected])
      onSaved()
      navigate('/schedule')
    } catch (e) {
      setSaveError(e.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <BookOpen size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm leading-tight">Select your courses · Term 4</h1>
          <p className="text-slate-500 text-xs">
            {session.user.email} · {selected.size} selected
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
            <Loader size={24} className="animate-spin" />
            <span className="text-sm">Loading Term 4 courses…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl text-sm">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Could not load schedule</p>
              <p className="text-rose-400/70 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-16">
            No courses found — check the sheet tab name in your env config.
          </p>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="flex-1 space-y-1.5">
            {courses.map(({ id, label }) => {
              const on    = selected.has(id)
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

        {saveError && (
          <p className="text-rose-400 text-xs text-center mb-3">{saveError}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving || selected.size === 0}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : `Save ${selected.size} course${selected.size !== 1 ? 's' : ''} →`}
        </button>
      </div>
    </div>
  )
}
