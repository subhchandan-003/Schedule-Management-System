import { useEffect } from 'react'
import { useScheduleStore } from '../store/useScheduleStore'
import { useScheduleEntries, useCourses } from '../hooks/useSchedule'
import { useRealtime } from '../hooks/useRealtime'
import { FilterBar } from '../components/filters/FilterBar'
import { WeekView } from '../components/schedule/WeekView'
import { DayView } from '../components/schedule/DayView'
import { Spinner } from '../components/ui/Spinner'
import { format, parseISO, addDays } from 'date-fns'

function NextClassBanner({ entries, courses }) {
  const { section, enrolledCourses } = useScheduleStore()
  const enrolledSet = new Set(enrolledCourses.map((c) => c.code))
  const courseMap = Object.fromEntries(courses.map((c) => [c.code, c]))
  const now = new Date()

  const next = entries
    .filter((e) => {
      const d = new Date(`${e.date}T${e.slot_start}:00`)
      if (d <= now) return false
      if (section && e.section !== 'COMMON' && e.section !== section) return false
      if (enrolledSet.size > 0 && e.course_code && !enrolledSet.has(e.course_code)) return false
      return true
    })
    .sort((a, b) => new Date(`${a.date}T${a.slot_start}`) - new Date(`${b.date}T${b.slot_start}`))[0]

  if (!next) return null
  const course = courseMap[next.course_code]
  const dateLabel = format(new Date(next.date + 'T00:00:00'), 'EEE, MMM d')

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 text-sm">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow flex-shrink-0" />
      <span className="text-emerald-300 font-medium">Next:</span>
      <span className="text-slate-300">
        <span className="font-semibold text-white">{next.course_code}</span>
        {course ? ` · ${course.full_name}` : ''}
      </span>
      <span className="text-slate-500 ml-auto text-xs whitespace-nowrap">
        {dateLabel} · {next.slot_start}
      </span>
    </div>
  )
}

export default function Schedule() {
  const { currentTerm, viewMode, setEntries, setCourses } = useScheduleStore()
  const { data: entries = [], isLoading: loadingEntries } = useScheduleEntries()
  const { data: courses = [], isLoading: loadingCourses } = useCourses()
  useRealtime(currentTerm)

  useEffect(() => { setEntries(entries) }, [entries, setEntries])
  useEffect(() => { setCourses(courses) }, [courses, setCourses])

  const loading = loadingEntries || loadingCourses

  return (
    <div className="flex-1 flex flex-col min-w-0 p-4 md:p-6">
      <h1 className="font-display font-extrabold text-white text-xl mb-4">Schedule</h1>
      <NextClassBanner entries={entries} courses={courses} />
      <FilterBar />
      {viewMode === 'week' && <WeekView entries={entries} courses={courses} loading={loading} />}
      {viewMode === 'day' && <DayView entries={entries} courses={courses} />}
      {viewMode === 'list' && <DayView entries={entries} courses={courses} />}
    </div>
  )
}
