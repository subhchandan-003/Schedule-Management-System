import { useMemo } from 'react'
import { addDays, format, parseISO, isToday } from 'date-fns'
import { useScheduleStore } from '../../store/useScheduleStore'
import { TimeSlotRow } from './TimeSlotRow'
import { Spinner } from '../ui/Spinner'

const SLOTS = ['Slot 1', 'Slot 2', 'Slot 3', 'Slot 4', 'Slot 5', 'Slot 6', 'Slot 7']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat']

export function WeekView({ entries = [], courses = [], loading = false }) {
  const { weekStart, section, myCoursesOnly, enrolledCourses, searchQuery } = useScheduleStore()
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const weekDays = useMemo(() => {
    const start = parseISO(weekStart)
    return Array.from({ length: 6 }, (_, i) => {
      const d = addDays(start, i)
      return { date: format(d, 'yyyy-MM-dd'), label: DAY_LABELS[i], dayNum: format(d, 'd'), isToday: isToday(d) }
    })
  }, [weekStart])

  const enrolledSet = useMemo(
    () => new Set(enrolledCourses.map((c) => c.code)),
    [enrolledCourses],
  )

  const courseMap = useMemo(
    () => Object.fromEntries(courses.map((c) => [c.code, c])),
    [courses],
  )

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (section && section !== 'BOTH' && e.section !== 'COMMON' && e.section !== section) return false
      if (myCoursesOnly && enrolledSet.size > 0 && e.course_code && !enrolledSet.has(e.course_code)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const inCode = e.course_code?.toLowerCase().includes(q)
        const inName = (e.course_name_raw || courseMap[e.course_code]?.full_name || '').toLowerCase().includes(q)
        if (!inCode && !inName) return false
      }
      return true
    })
  }, [entries, section, myCoursesOnly, enrolledSet, searchQuery, courseMap])

  // Find next upcoming entry
  const nextEntryId = useMemo(() => {
    const now = new Date()
    const upcoming = filteredEntries
      .filter((e) => {
        const d = new Date(`${e.date}T${e.slot_start}:00`)
        return d > now
      })
      .sort((a, b) => new Date(`${a.date}T${a.slot_start}`) - new Date(`${b.date}T${b.slot_start}`))
    return upcoming[0]?.id
  }, [filteredEntries])

  // Build slot → day → entries map
  const grid = useMemo(() => {
    const map = {}
    for (const slot of SLOTS) {
      map[slot] = {}
      for (const day of weekDays) {
        map[slot][day.date] = []
      }
    }
    for (const entry of filteredEntries) {
      const slot = entry.slot_label
      if (map[slot] && map[slot][entry.date] !== undefined) {
        map[slot][entry.date].push(entry)
      }
    }
    return map
  }, [filteredEntries, weekDays])

  // Only render slots that have at least one entry this week
  const activeSlots = SLOTS.filter((slot) =>
    weekDays.some((d) => grid[slot][d.date]?.length > 0),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Header row */}
        <div className="grid grid-cols-[64px_repeat(6,1fr)] gap-1 mb-3 sticky top-0 z-10 bg-navy/90 backdrop-blur-sm pb-2">
          <div /> {/* empty time column */}
          {weekDays.map(({ date, label, dayNum, isToday: today }) => (
            <div
              key={date}
              className={`text-center px-1 py-2 rounded-lg select-none ${today ? 'bg-primary/20' : ''}`}
            >
              <div className={`text-[10px] font-semibold uppercase tracking-widest ${today ? 'text-primary' : 'text-slate-500'}`}>
                {label}
              </div>
              <div className={`text-lg font-display font-bold mt-0.5 ${today ? 'text-primary' : 'text-slate-300'}`}>
                {dayNum}
              </div>
              {today && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-0.5 animate-pulse-slow" />
              )}
            </div>
          ))}
        </div>

        {/* Slot rows */}
        {activeSlots.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">No classes this week</p>
            <p className="text-sm mt-1">Try navigating to a different week or adjusting filters</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activeSlots.map((slot) => (
              <TimeSlotRow
                key={slot}
                slotLabel={slot}
                dayColumns={weekDays.map((d) => ({ date: d.date, entries: grid[slot][d.date] }))}
                courseMap={courseMap}
                todayStr={todayStr}
                nextEntryId={nextEntryId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
