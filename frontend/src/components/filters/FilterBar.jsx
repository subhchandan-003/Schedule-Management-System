import { ChevronLeft, ChevronRight, Calendar, Search, LayoutGrid, List, CalendarDays } from 'lucide-react'
import { format, parseISO, addDays } from 'date-fns'
import { useScheduleStore } from '../../store/useScheduleStore'
import { TermSelector } from './TermSelector'

export function FilterBar() {
  const {
    weekStart, navigateWeek, jumpToToday,
    viewMode, setViewMode,
    myCoursesOnly, setMyCoursesOnly,
    searchQuery, setSearchQuery,
    section, setSection,
  } = useScheduleStore()

  const start = parseISO(weekStart)
  const end = addDays(start, 5)
  const rangeLabel = `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`

  const viewOptions = [
    { id: 'week', icon: LayoutGrid, label: 'Week' },
    { id: 'day', icon: CalendarDays, label: 'Day' },
    { id: 'list', icon: List, label: 'List' },
  ]

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Top row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Week nav */}
        <div className="flex items-center gap-1 bg-surface border border-slate-700 rounded-xl p-1">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            {rangeLabel}
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Today */}
        <button
          onClick={jumpToToday}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-surface border border-slate-700 rounded-xl text-slate-300 hover:text-primary hover:border-primary/40 transition-colors"
        >
          <Calendar size={13} />Today
        </button>

        {/* Term selector */}
        <TermSelector />

        {/* Section toggle */}
        <div className="flex items-center gap-1 bg-surface border border-slate-700 rounded-xl p-1">
          {['A', 'B'].map((s) => (
            <button
              key={s}
              onClick={() => setSection(section === s ? null : s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                section === s ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sec {s}
            </button>
          ))}
        </div>

        {/* My Courses toggle */}
        <button
          onClick={() => setMyCoursesOnly(!myCoursesOnly)}
          className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
            myCoursesOnly
              ? 'bg-primary/20 border-primary/40 text-primary'
              : 'bg-surface border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          My Courses {myCoursesOnly ? 'ON' : 'OFF'}
        </button>

        {/* View mode */}
        <div className="flex items-center gap-1 bg-surface border border-slate-700 rounded-xl p-1 ml-auto">
          {viewOptions.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              title={label}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === id ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* Search row */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search courses…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-surface border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary/60 transition-colors"
        />
      </div>
    </div>
  )
}
