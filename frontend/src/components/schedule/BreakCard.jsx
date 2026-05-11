import { Coffee, Star, Calendar } from 'lucide-react'

export function BreakCard({ label, isSpecialEvent }) {
  if (isSpecialEvent) {
    return (
      <div className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 flex items-center gap-1.5">
        <Star size={11} className="text-amber-400 flex-shrink-0" />
        <span className="text-amber-300 text-[10px] font-medium truncate">{label}</span>
      </div>
    )
  }
  return (
    <div className="w-full rounded-lg border border-slate-700/50 bg-slate-800/30 px-2.5 py-2 flex items-center gap-1.5">
      <Coffee size={11} className="text-slate-500 flex-shrink-0" />
      <span className="text-slate-600 text-[10px]">Lunch</span>
    </div>
  )
}
