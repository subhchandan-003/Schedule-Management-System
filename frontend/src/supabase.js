import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export async function getUserCourses(userId, term) {
  const { data, error } = await supabase
    .from('user_courses')
    .select('course_code')
    .eq('user_id', userId)
    .eq('term', term)
  if (error) throw error
  return data.map((r) => r.course_code)
}

export async function saveUserCourses(userId, term, courseCodes) {
  const { error: delErr } = await supabase
    .from('user_courses')
    .delete()
    .eq('user_id', userId)
    .eq('term', term)
  if (delErr) throw delErr
  if (!courseCodes.length) return
  const { error: insErr } = await supabase
    .from('user_courses')
    .insert(courseCodes.map((code) => ({ user_id: userId, term, course_code: code })))
  if (insErr) throw insErr
}

export async function hasAnyCourses(userId) {
  const { count } = await supabase
    .from('user_courses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return (count ?? 0) > 0
}
