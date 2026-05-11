import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookMarked, Settings } from 'lucide-react'
import { useScheduleStore } from '../../store/useScheduleStore'
import { getCourseColor } from '../../lib/courseColors'

const NAV = [
  { to: '/schedule', label: 'Schedule', icon: LayoutDashboard },
  { to: '/courses', label: 'My Courses', icon: BookMarked },
  { to: '/admin', label: 'Admin', icon: Settings },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const enrolledCourses = useScheduleStore((s) => s.enrolledCourses)

  return (
    <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-slate-800 pt-6 pb-4 px-3 gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors
              ${active ? 'bg-primary/15 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}

      {enrolledCourses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-2 px-3">My Courses</p>
          <div className="flex flex-col gap-1">
            {enrolledCourses.map((c) => {
              const color = getCourseColor(c.code)
              return (
                <div key={c.code} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                  <span className={`text-xs font-semibold ${color.text}`}>{c.code}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}
