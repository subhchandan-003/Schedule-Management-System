import { useQuery } from '@tanstack/react-query'
import { useScheduleStore } from '../store/useScheduleStore'
import { api } from '../lib/api'
import { MOCK_ENTRIES, MOCK_COURSES } from '../lib/mockData'
import { addDays, format, parseISO } from 'date-fns'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL

export function useScheduleEntries() {
  const { currentTerm, section, weekStart } = useScheduleStore()
  const weekEnd = format(addDays(parseISO(weekStart), 6), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['entries', currentTerm, section, weekStart],
    queryFn: async () => {
      if (IS_DEMO) return MOCK_ENTRIES
      return api.getEntries(currentTerm, section, weekStart, weekEnd)
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

export function useCourses() {
  const { currentTerm } = useScheduleStore()
  return useQuery({
    queryKey: ['courses', currentTerm],
    queryFn: async () => {
      if (IS_DEMO) return MOCK_COURSES
      return api.getCourses(currentTerm)
    },
    staleTime: 60_000,
  })
}

export function useTerms() {
  return useQuery({
    queryKey: ['terms'],
    queryFn: async () => {
      if (IS_DEMO) return ['IV']
      return api.getTerms()
    },
    staleTime: 300_000,
  })
}
