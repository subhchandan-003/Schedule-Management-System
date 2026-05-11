import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { startOfWeek, addDays, format } from 'date-fns'

const getWeekStart = (date = new Date()) =>
  startOfWeek(date, { weekStartsOn: 1 }) // Monday

export const useScheduleStore = create(
  persist(
    (set, get) => ({
      // Onboarding
      section: null,           // 'A' | 'B'
      enrolledCourses: [],     // [{ code, name, credits }]
      onboardingDone: false,

      // Filters
      currentTerm: 'IV',
      viewMode: 'week',        // 'week' | 'day' | 'list'
      myCoursesOnly: true,
      weekStart: format(getWeekStart(), 'yyyy-MM-dd'),
      searchQuery: '',

      // Data (populated by React Query, stored here for realtime updates)
      entries: [],
      courses: [],

      // Toasts
      toast: null,

      // Actions
      setSection: (section) => set({ section }),
      setEnrolledCourses: (courses) => set({ enrolledCourses: courses }),
      setOnboardingDone: (v) => set({ onboardingDone: v }),
      setCurrentTerm: (term) => set({ currentTerm: term }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setMyCoursesOnly: (v) => set({ myCoursesOnly: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setEntries: (entries) => set({ entries }),
      setCourses: (courses) => set({ courses }),

      navigateWeek: (direction) => {
        const current = new Date(get().weekStart)
        const next = addDays(current, direction * 7)
        set({ weekStart: format(next, 'yyyy-MM-dd') })
      },
      jumpToToday: () => {
        set({ weekStart: format(getWeekStart(), 'yyyy-MM-dd') })
      },

      updateEntry: (newEntry) => {
        set((state) => {
          const idx = state.entries.findIndex((e) => e.id === newEntry.id)
          if (idx >= 0) {
            const updated = [...state.entries]
            updated[idx] = newEntry
            return { entries: updated }
          }
          return { entries: [...state.entries, newEntry] }
        })
      },

      showToast: (message, type = 'info') => {
        set({ toast: { message, type, id: Date.now() } })
        setTimeout(() => set({ toast: null }), 4000)
      },

      reset: () => set({
        section: null,
        enrolledCourses: [],
        onboardingDone: false,
      }),
    }),
    {
      name: 'iimsbp-schedule',
      partialize: (state) => ({
        section: state.section,
        enrolledCourses: state.enrolledCourses,
        onboardingDone: state.onboardingDone,
        currentTerm: state.currentTerm,
        myCoursesOnly: state.myCoursesOnly,
      }),
    },
  ),
)
