import { Link, useLocation } from 'react-router-dom'
import { BookOpen, LayoutDashboard, BookMarked, Settings, RefreshCw } from 'lucide-react'
import { useScheduleStore } from '../../store/useScheduleStore'

const NAV = [
  { to: '/schedule', label: 'Schedule', icon: LayoutDashboard },
  { to: '/courses', label: 'My Courses', icon: BookMarked },
  { to: '/admin', label: 'Admin', icon: Settings },
]

export function Navbar() {
  const { pathname } = useLocation()
  const section = useScheduleStore((s) => s.section)
  const reset = useScheduleStore((s) => s.reset)

  return (
    <header className="sticky top-0 z-30 bg-navy/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-display font-bold text-white leading-tight">IIM Sambalpur</div>
            <div className="text-[10px] text-slate-500 leading-tight">MBA Schedule</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${active ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Section badge */}
        {section && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-surface border border-slate-700 px-2.5 py-1 rounded-full text-slate-300">
              Section <span className="text-primary font-bold">{section}</span>
            </span>
            <button
              onClick={reset}
              title="Reset onboarding"
              className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
