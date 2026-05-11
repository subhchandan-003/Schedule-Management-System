import { useScheduleStore } from '../../store/useScheduleStore'
import { getCourseColor } from '../../lib/courseColors'
import { X } from 'lucide-react'

export function CourseTagFilter({ courses = [] }) {
  const { enrolledCourses, setEnrolledCourses } = useScheduleStore()
  const enrolledCodes = new Set(enrolledCourses.map((c) => c.code))

  const toggle = (course) => {
    if (enrolledCodes.has(course.code)) {
      setEnrolledCourses(enrolledCourses.filter((c) => c.code !== course.code))
    } else {
      setEnrolledCourses([...enrolledCourses, { code: course.code, name: course.full_name }])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {courses.map((course) => {
        const color = getCourseColor(course.code)
        const active = enrolledCodes.has(course.code)
        return (
          <button
            key={course.code}
            onClick={() => toggle(course)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all
              ${active ? `${color.bg} ${color.text} ${color.border}` : 'border-slate-700 text-slate-500 hover:border-slate-600'}
            `}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? color.dot : 'bg-slate-600'}`} />
            {course.code}
            {active && <X size={10} className="ml-0.5 opacity-70" />}
          </button>
        )
      })}
    </div>
  )
}
