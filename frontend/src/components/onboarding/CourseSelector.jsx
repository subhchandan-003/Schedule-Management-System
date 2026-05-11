import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { getCourseColor } from '../../lib/courseColors'

export function CourseSelector({ extractedCourses, allCourses, onConfirm }) {
  const [selected, setSelected] = useState(
    extractedCourses.map((c) => c.code)
  )

  const toggle = (code) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const displayCourses = extractedCourses.length > 0
    ? extractedCourses
    : allCourses.map((c) => ({ code: c.code, name: c.full_name, credits: c.credits }))

  return (
    <div className="flex flex-col gap-5 w-full max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Confirm your courses</h2>
        <p className="text-slate-400 text-sm">Toggle courses on/off — only selected courses will appear in your schedule</p>
      </div>

      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {displayCourses.map((course) => {
          const isOn = selected.includes(course.code)
          const color = getCourseColor(course.code)
          return (
            <button
              key={course.code}
              onClick={() => toggle(course.code)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left
                ${isOn ? `${color.bg} ${color.border}` : 'border-slate-700 bg-slate-800/50 opacity-60'}
              `}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                ${isOn ? `${color.dot} text-white` : 'bg-slate-700 text-slate-500'}`}>
                {isOn ? <Check size={16} /> : <Plus size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${isOn ? color.text : 'text-slate-400'}`}>{course.code}</div>
                <div className="text-slate-400 text-xs truncate">{course.name}</div>
              </div>
              {course.credits && (
                <span className="text-xs text-slate-500 flex-shrink-0">{course.credits} cr</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onConfirm(displayCourses.filter((c) => selected.includes(c.code)))}
        disabled={selected.length === 0}
        className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Confirm {selected.length} course{selected.length !== 1 ? 's' : ''} →
      </button>
    </div>
  )
}
