import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import CourseChip from './CourseChip'

const BEFORE_LUNCH = ['09:30', '11:15']
const AFTER_LUNCH  = ['14:00', '15:45', '18:00', '20:00']
const ALL_SLOTS    = [...BEFORE_LUNCH, ...AFTER_LUNCH]
const SEC_ORDER    = { A: 0, B: 1, C: 2, D: 3 }

const tdBase  = 'px-2 py-1.5 border-b border-slate-800/70 align-top min-w-[90px]'
const thBase  = 'px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800 whitespace-nowrap'

export default function ScheduleGrid({ entries, userCourseIds }) {
  const dateGroups = useMemo(() => {
    const map = {}
    for (const entry of entries) {
      if (!map[entry.date]) map[entry.date] = []
      map[entry.date].push(entry)
    }
    // Sort section rows: A → B → Common
    for (const date of Object.keys(map)) {
      map[date].sort((a, b) => (SEC_ORDER[a.section] ?? 9) - (SEC_ORDER[b.section] ?? 9))
    }
    return map
  }, [entries])

  const sortedDates = useMemo(() => Object.keys(dateGroups).sort(), [dateGroups])

  if (sortedDates.length === 0) {
    return (
      <p className="text-slate-600 text-sm text-center py-16">
        No schedule data found for this term.
      </p>
    )
  }

  return (
    <div className="overflow-auto rounded-xl border border-slate-800">
      <table className="border-collapse text-sm w-max min-w-full">
        {/* ── Header ── */}
        <thead>
          <tr className="bg-[#0F172A] sticky top-0 z-10">
            <th className={`${thBase} sticky left-0 z-20 bg-[#0F172A] w-20 text-left`}>Date</th>
            <th className={`${thBase} sticky left-20 z-20 bg-[#0F172A] w-10 text-left`}>Day</th>
            <th className={`${thBase} sticky left-[7.5rem] z-20 bg-[#0F172A] w-10 text-left`}>Sec</th>
            {BEFORE_LUNCH.map((s) => <th key={s} className={`${thBase} text-center`}>{s}</th>)}
            <th className={`${thBase} text-center text-amber-600 w-14`}>☕</th>
            {AFTER_LUNCH.map((s) => <th key={s} className={`${thBase} text-center`}>{s}</th>)}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {sortedDates.map((date) => {
            const rows = dateGroups[date]
            const span = rows.length

            return rows.map((row, i) => {
              const isFirstRow = i === 0
              const dateObj    = parseISO(date)
              const isToday    = date === format(new Date(), 'yyyy-MM-dd')

              return (
                <tr
                  key={`${date}-${row.section}`}
                  className={`${isToday ? 'bg-blue-950/20' : 'hover:bg-slate-800/20'} transition-colors`}
                >
                  {/* Date — rowSpan across all sections */}
                  {isFirstRow && (
                    <td
                      rowSpan={span}
                      className={`${tdBase} sticky left-0 z-10 bg-[#0F172A] border-t border-slate-800 font-medium whitespace-nowrap
                        ${isToday ? 'text-blue-400' : 'text-slate-300'}`}
                    >
                      <div className="text-xs">{format(dateObj, 'MMM d')}</div>
                      {isToday && (
                        <div className="text-[9px] text-blue-500 font-bold tracking-wide mt-0.5">TODAY</div>
                      )}
                    </td>
                  )}

                  {/* Day — rowSpan */}
                  {isFirstRow && (
                    <td
                      rowSpan={span}
                      className={`${tdBase} sticky left-20 z-10 bg-[#0F172A] border-t border-slate-800 text-slate-500 text-xs whitespace-nowrap`}
                    >
                      {row.day}
                    </td>
                  )}

                  {/* Section badge */}
                  <td className={`${tdBase} sticky left-[7.5rem] z-10 bg-[#0F172A] ${isFirstRow ? 'border-t border-slate-800' : ''}`}>
                    <SectionBadge section={row.section} />
                  </td>

                  {/* Before-lunch slots */}
                  {BEFORE_LUNCH.map((slot) => (
                    <td
                      key={slot}
                      className={`${tdBase} text-center ${isFirstRow ? 'border-t border-slate-800' : ''}`}
                    >
                      {row.slots[slot] && (
                        <CourseChip
                          id={row.slots[slot].id}
                          display={row.slots[slot].display}
                          sessionNum={row.slots[slot].sessionNum}
                          isSelected={userCourseIds.has(row.slots[slot].id)}
                        />
                      )}
                    </td>
                  ))}

                  {/* LUNCH — rowSpan */}
                  {isFirstRow && (
                    <td
                      rowSpan={span}
                      className={`${tdBase} text-center border-t border-slate-800 border-l border-r border-slate-800/50 bg-slate-900/40`}
                    >
                      <span className="text-amber-600 text-base">☕</span>
                      <div className="text-[9px] text-slate-700 mt-0.5 font-semibold tracking-wider uppercase">Lunch</div>
                    </td>
                  )}

                  {/* After-lunch slots */}
                  {AFTER_LUNCH.map((slot) => (
                    <td
                      key={slot}
                      className={`${tdBase} text-center ${isFirstRow ? 'border-t border-slate-800' : ''}`}
                    >
                      {row.slots[slot] && (
                        <CourseChip
                          id={row.slots[slot].id}
                          display={row.slots[slot].display}
                          sessionNum={row.slots[slot].sessionNum}
                          isSelected={userCourseIds.has(row.slots[slot].id)}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              )
            })
          })}
        </tbody>
      </table>
    </div>
  )
}

function SectionBadge({ section }) {
  const styles = {
    A: 'bg-blue-900/40 text-blue-300 border-blue-800',
    B: 'bg-emerald-900/40 text-emerald-300 border-emerald-800',
    C: 'bg-violet-900/40 text-violet-300 border-violet-800',
    D: 'bg-amber-900/40 text-amber-300 border-amber-800',
  }
  return (
    <span className={`inline-block text-[9px] font-bold border rounded px-1 py-0.5 ${styles[section] ?? 'bg-slate-700/40 text-slate-400 border-slate-700'}`}>
      {section}
    </span>
  )
}
