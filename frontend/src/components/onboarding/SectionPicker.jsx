import { Users, GraduationCap } from 'lucide-react'
import { useScheduleStore } from '../../store/useScheduleStore'

export function SectionPicker({ onSelect }) {
  const setSection = useScheduleStore((s) => s.setSection)

  const choose = (sec) => {
    setSection(sec)
    onSelect(sec)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Which section are you in?</h2>
        <p className="text-slate-400 text-sm">This determines which schedule rows you see</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {['A', 'B'].map((sec) => (
          <button
            key={sec}
            onClick={() => choose(sec)}
            className="group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-slate-700 bg-surface hover:border-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center transition-colors">
              <GraduationCap size={28} className="text-primary" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white group-hover:text-primary transition-colors">
                Section {sec}
              </div>
              <div className="text-slate-400 text-xs mt-1 group-hover:text-slate-300">MBA 2024–26</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
