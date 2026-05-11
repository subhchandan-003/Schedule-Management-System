import { ClassCard } from './ClassCard'
import { BreakCard } from './BreakCard'

const SLOT_TIMES = {
  'Slot 1': '08:00–09:30',
  'Slot 2': '10:00–11:30',
  'Slot 3': '12:00–13:30',
  'Slot 4': '14:30–16:00',
  'Slot 5': '16:30–18:00',
  'Slot 6': '18:30–20:00',
  'Slot 7': '20:30–22:00',
}

export function TimeSlotRow({ slotLabel, dayColumns, courseMap, todayStr, nextEntryId }) {
  const timeStr = SLOT_TIMES[slotLabel] || ''
  const [start, end] = timeStr.split('–')

  return (
    <div className="grid grid-cols-[64px_repeat(6,1fr)] gap-1 min-h-[72px]">
      {/* Time label */}
      <div className="flex flex-col items-end pr-2 pt-1 select-none">
        <span className="text-slate-500 text-[10px] font-mono">{start}</span>
        <span className="text-slate-700 text-[9px] font-mono mt-auto mb-1">{end}</span>
      </div>

      {/* Day columns */}
      {dayColumns.map(({ date, entries }) => {
        const isToday = date === todayStr
        return (
          <div key={date} className={`flex flex-col gap-1 px-0.5 py-0.5 min-h-[72px] rounded-lg ${isToday ? 'bg-primary/5' : ''}`}>
            {entries.map((entry) => {
              const now = new Date()
              const entryDate = new Date(entry.date)
              const isPast = entryDate < now && entry.date !== todayStr ||
                (entry.date === todayStr && entry.slot_end < `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`)
              const isNext = entry.id === nextEntryId
              const course = courseMap[entry.course_code]

              if (entry.is_special_event) {
                return <BreakCard key={entry.id} label={entry.special_event_label} isSpecialEvent />
              }

              return (
                <ClassCard
                  key={entry.id}
                  entry={entry}
                  course={course}
                  isToday={isToday}
                  isPast={isPast}
                  isNext={isNext}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
