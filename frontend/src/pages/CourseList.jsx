import { useMemo } from 'react'
import { format } from 'date-fns'
import { Mail, Phone, MapPin, Users, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useScheduleStore } from '../store/useScheduleStore'
import { useCourses } from '../hooks/useSchedule'
import { useScheduleEntries } from '../hooks/useSchedule'
import { getCourseColor } from '../lib/courseColors'
import { Badge } from '../components/ui/Badge'

function CourseCard({ course, entries }) {
  const { section, enrolledCourses } = useScheduleStore()
  const color = getCourseColor(course.code)
  const [copied, setCopied] = useState(false)

  const enrolledSet = new Set(enrolledCourses.map((c) => c.code))
  const isEnrolled = enrolledSet.has(course.code)

  // Count sessions completed
  const now = new Date()
  const courseSessions = entries.filter((e) => e.course_code === course.code)
  const completed = courseSessions.filter((e) => new Date(`${e.date}T${e.slot_end}:00`) < now).length

  // Next session
  const next = courseSessions
    .filter((e) => new Date(`${e.date}T${e.slot_start}:00`) > now)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const copyEmail = () => {
    if (course.group_email) {
      navigator.clipboard.writeText(course.group_email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const crContact = section === 'B' ? { name: course.cr_b_name, email: course.cr_b_email, phone: course.cr_b_phone }
    : { name: course.cr_a_name, email: course.cr_a_email, phone: course.cr_a_phone }

  return (
    <div className={`rounded-2xl border p-5 ${color.border} ${color.bg} ${isEnrolled ? '' : 'opacity-50'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Badge code={course.code} size="md" />
          {course.credits && (
            <span className="text-xs text-slate-500">{course.credits} cr</span>
          )}
        </div>
        {course.sections && (
          <div className="flex gap-1">
            {course.sections.map((s) => (
              <span key={s} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Sec {s}</span>
            ))}
          </div>
        )}
      </div>

      <h3 className="font-display font-bold text-white text-base leading-snug mb-1">
        {course.full_name}
      </h3>
      {course.area && <p className="text-slate-500 text-xs mb-3">{course.area}</p>}

      {/* Details */}
      <div className="space-y-1.5 text-sm mb-3">
        {course.faculty && (
          <div className="flex items-center gap-2 text-slate-300">
            <Users size={13} className="text-slate-500 flex-shrink-0" />
            <span className="truncate">{course.faculty}</span>
            {course.faculty_email && (
              <a href={`mailto:${course.faculty_email}`} className="ml-auto text-primary hover:underline text-xs flex-shrink-0">
                <Mail size={11} className="inline" />
              </a>
            )}
          </div>
        )}
        {course.classroom && (
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin size={13} className="text-slate-500 flex-shrink-0" />
            <span>Room {course.classroom}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      {course.total_sessions && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Sessions</span>
            <span>{completed} / {course.total_sessions}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${color.dot}`}
              style={{ width: `${Math.min(100, (completed / course.total_sessions) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Next session */}
      {next && (
        <div className="text-xs text-slate-400 mb-3">
          <span className="text-emerald-400 font-medium">Next: </span>
          {format(new Date(next.date + 'T00:00:00'), 'EEE MMM d')} · {next.slot_start}
        </div>
      )}

      {/* Group email + CR */}
      <div className="pt-3 border-t border-slate-800/60 space-y-1.5">
        {course.group_email && (
          <button onClick={copyEmail} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            {copied ? <CheckCircle size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span className="truncate">{course.group_email}</span>
          </button>
        )}
        {crContact.name && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Phone size={11} />
            <span>{crContact.name}</span>
            {crContact.phone && <span className="ml-auto text-slate-600">{crContact.phone}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CourseList() {
  const { currentTerm, enrolledCourses } = useScheduleStore()
  const { data: courses = [] } = useCourses()
  const { data: entries = [] } = useScheduleEntries()

  const enrolledSet = new Set(enrolledCourses.map((c) => c.code))
  const sorted = useMemo(() => {
    return [...courses].sort((a, b) => {
      const aIn = enrolledSet.has(a.code) ? 0 : 1
      const bIn = enrolledSet.has(b.code) ? 0 : 1
      return aIn - bIn || a.code.localeCompare(b.code)
    })
  }, [courses, enrolledSet])

  return (
    <div className="flex-1 p-4 md:p-6">
      <h1 className="font-display font-extrabold text-white text-xl mb-1">My Courses</h1>
      <p className="text-slate-500 text-sm mb-6">Term {currentTerm} · {enrolledCourses.length} enrolled</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((course) => (
          <CourseCard key={course.code} course={course} entries={entries} />
        ))}
        {sorted.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-500">
            No courses found for Term {currentTerm}
          </div>
        )}
      </div>
    </div>
  )
}
