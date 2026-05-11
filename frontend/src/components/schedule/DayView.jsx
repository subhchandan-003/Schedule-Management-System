import { useMemo } from 'react'
import { format } from 'date-fns'
import { useScheduleStore } from '../../store/useScheduleStore'
import { ClassCard } from './ClassCard'
import { BreakCard } from './BreakCard'

export function DayView({ entries = [], courses = [] }) {
  const { weekStart, section, myCoursesOnly, enrolledCourses } = useScheduleStore()
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const enrolledSet = new Set(enrolledCourses.map((c) => c.code))
  const courseMap = Object.fromEntries(courses.map((c) => [c.code, c]))

  const days = useMemo(() => {
    const grouped = {}
    for (const e of entries) {
      if (!grouped[e.date]) grouped[e.date] = []
      grouped[e.date].push(e)
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayEntries]) => ({
        date,
        entries: dayEntries
          .filter((e) => {
            if (section && e.section !== 'COMMON' && e.section !== section) return false
            if (myCoursesOnly && enrolledSet.size > 0 && e.course_code && !enrolledSet.has(e.course_code)) return false
            return true
          })
          .sort((a, b) => a.slot_start.localeCompare(b.slot_start)),
      }))
      .filter((d) => d.entries.length > 0)
  }, [entries, section, myCoursesOnly, enrolledSet])

  return (
    <div className="space-y-6">
      {days.map(({ date, entries: dayEntries }) => {
        const isToday = date === todayStr
        const label = format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d')
        return (
          <div key={date}>
            <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${isToday ? 'border-primary/40' : 'border-slate-800'}`}>
              <h3 className={`font-display font-bold text-sm ${isToday ? 'text-primary' : 'text-slate-400'}`}>{label}</h3>
              {isToday && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">TODAY</span>}
            </div>
            <div className="space-y-2">
              {dayEntries.map((entry) => {
                const now = new Date()
                const slotStart = new Date(`${entry.date}T${entry.slot_start}:00`)
                const isPast = slotStart < now
                const course = courseMap[entry.course_code]
                return (
                  <div key={entry.id} className="flex items-stretch gap-3">
                    <div className="w-16 flex-shrink-0 text-right">
                      <span className="text-slate-500 text-xs font-mono">{entry.slot_start}</span>
                    </div>
                    <div className="flex-1">
                      {entry.is_special_event
                        ? <BreakCard label={entry.special_event_label} isSpecialEvent />
                        : <ClassCard entry={entry} course={course} isToday={isToday} isPast={isPast} />
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      {days.length === 0 && (
        <div className="text-center py-16 text-slate-500">No classes found for this period</div>
      )}
    </div>
  )
}
