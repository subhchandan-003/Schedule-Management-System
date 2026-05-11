const PALETTE = [
  { bg: 'bg-blue-900/60',    text: 'text-blue-200',    border: 'border-blue-600'    },
  { bg: 'bg-emerald-900/60', text: 'text-emerald-200', border: 'border-emerald-600' },
  { bg: 'bg-orange-900/60',  text: 'text-orange-200',  border: 'border-orange-600'  },
  { bg: 'bg-purple-900/60',  text: 'text-purple-200',  border: 'border-purple-600'  },
  { bg: 'bg-rose-900/60',    text: 'text-rose-200',    border: 'border-rose-600'    },
  { bg: 'bg-teal-900/60',    text: 'text-teal-200',    border: 'border-teal-600'    },
  { bg: 'bg-amber-900/60',   text: 'text-amber-200',   border: 'border-amber-600'   },
  { bg: 'bg-indigo-900/60',  text: 'text-indigo-200',  border: 'border-indigo-600'  },
  { bg: 'bg-pink-900/60',    text: 'text-pink-200',    border: 'border-pink-600'    },
  { bg: 'bg-cyan-900/60',    text: 'text-cyan-200',    border: 'border-cyan-600'    },
  { bg: 'bg-lime-900/60',    text: 'text-lime-200',    border: 'border-lime-600'    },
  { bg: 'bg-sky-900/60',     text: 'text-sky-200',     border: 'border-sky-600'     },
]

export function getCourseColor(id) {
  const hash = (id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTE[hash % PALETTE.length]
}
