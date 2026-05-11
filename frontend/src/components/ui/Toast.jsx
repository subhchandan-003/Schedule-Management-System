import { useEffect } from 'react'
import { useScheduleStore } from '../../store/useScheduleStore'
import { X } from 'lucide-react'

export function Toast() {
  const toast = useScheduleStore((s) => s.toast)
  const showToast = useScheduleStore((s) => s.showToast)

  if (!toast) return null

  const styles = {
    info: 'bg-primary/90 text-white',
    success: 'bg-emerald-600/90 text-white',
    error: 'bg-rose-600/90 text-white',
    warning: 'bg-amber-500/90 text-white',
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-sm text-sm font-medium ${styles[toast.type] || styles.info}`}>
        <span>{toast.message}</span>
        <button onClick={() => showToast(null)} className="opacity-70 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
