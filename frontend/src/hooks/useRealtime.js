import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useScheduleStore } from '../store/useScheduleStore'

export function useRealtime(term) {
  const updateEntry = useScheduleStore((s) => s.updateEntry)
  const showToast = useScheduleStore((s) => s.showToast)

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !term) return

    const channel = supabase
      .channel('schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_entries',
          filter: `term=eq.${term}`,
        },
        (payload) => {
          if (payload.new) {
            updateEntry(payload.new)
            showToast('📅 Schedule updated just now', 'info')
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [term, updateEntry, showToast])
}
