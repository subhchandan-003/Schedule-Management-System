import { useScheduleStore } from '../../store/useScheduleStore'
import { useTerms } from '../../hooks/useSchedule'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function TermSelector() {
  const { currentTerm, setCurrentTerm } = useScheduleStore()
  const { data: terms = [] } = useTerms()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-slate-700 rounded-xl text-xs font-medium text-slate-300 hover:border-slate-600 transition-colors"
      >
        Term {currentTerm}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-surface border border-slate-700 rounded-xl shadow-xl z-20 py-1 min-w-[120px]">
          {(terms.length ? terms : ['IV', 'V', 'VI']).map((t) => (
            <button
              key={t}
              onClick={() => { setCurrentTerm(t); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-slate-700 ${
                currentTerm === t ? 'text-primary font-semibold' : 'text-slate-300'
              }`}
            >
              Term {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
