import { getCourseColor } from '../courseColors'

export default function CourseChip({ id, display, sessionNum, isSelected }) {
  const color = getCourseColor(id)

  if (!isSelected) {
    return (
      <div className="rounded px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-slate-700 bg-slate-800/20 border border-slate-800/50 select-none">
        {display}
        {sessionNum != null && <span className="ml-0.5 opacity-60">·{sessionNum}</span>}
      </div>
    )
  }

  return (
    <div className={`rounded px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap border select-none ${color.bg} ${color.text} ${color.border}`}>
      {display}
      {sessionNum != null && <span className="ml-0.5 opacity-60">·{sessionNum}</span>}
    </div>
  )
}
