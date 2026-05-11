const TERMS = [4, 5, 6]

export default function TermTabs({ activeTerm, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-800/60 border border-slate-700/60 rounded-xl p-1 w-fit">
      {TERMS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTerm === t
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Term {t}
        </button>
      ))}
    </div>
  )
}
