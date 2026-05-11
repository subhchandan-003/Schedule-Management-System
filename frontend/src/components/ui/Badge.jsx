import { getCourseColor } from '../../lib/courseColors'

export function Badge({ code, label, size = 'sm' }) {
  const color = getCourseColor(code || label)
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold border ${sizes[size]} ${color.bg} ${color.text} ${color.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
      {code || label}
    </span>
  )
}
