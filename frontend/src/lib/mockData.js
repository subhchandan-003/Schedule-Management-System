export const MOCK_COURSES = [
  { code: 'DV', full_name: 'Data Visualization and Business Storytelling', credits: 3, faculty: 'Prof. Eshan Bhatt', faculty_email: 'eshanb@iimsambalpur.ac.in', classroom: 'A01', total_sessions: 18, sections: ['A', 'B'] },
  { code: 'CB', full_name: 'Consumer Behaviour', credits: 3, faculty: 'Prof. Nitin Soni', faculty_email: 'nitins@iimsambalpur.ac.in', classroom: 'A01', total_sessions: 18, sections: ['A', 'B'] },
  { code: 'PM', full_name: 'Project Management', credits: 3, faculty: 'Prof. Rohit Gupta', faculty_email: 'rohitg@iimsambalpur.ac.in', classroom: 'A02', total_sessions: 16, sections: ['A', 'B'] },
  { code: 'SAPM', full_name: 'Security Analysis and Portfolio Management', credits: 3, faculty: 'Prof. Ankit Verma', faculty_email: 'ankitv@iimsambalpur.ac.in', classroom: 'B01', total_sessions: 20, sections: ['A'] },
  { code: 'OFD', full_name: 'Organizational Development and Change', credits: 3, faculty: 'Dr. R. Kumar', faculty_email: 'rkumar@iimsambalpur.ac.in', classroom: 'B02', total_sessions: 18, sections: ['B'] },
  { code: 'AMR', full_name: 'Applied Marketing Research', credits: 3, faculty: 'Prof. Swati Das', faculty_email: 'swatid@iimsambalpur.ac.in', classroom: 'A03', total_sessions: 16, sections: ['A', 'B'] },
]

const today = new Date()
const fmt = (d) => d.toISOString().split('T')[0]
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const dayName = (d) => ['Sun','Mon','Tue','Wed','Thurs','Fri','Sat'][d.getDay()]

export const MOCK_ENTRIES = [
  { id: '1', term: 'IV', date: fmt(addDays(today, -1)), day_of_week: dayName(addDays(today, -1)), section: 'A', slot_label: 'Slot 4', slot_start: '14:30', slot_end: '16:00', course_code: 'DV', session_number: 1, is_special_event: false },
  { id: '2', term: 'IV', date: fmt(addDays(today, -1)), day_of_week: dayName(addDays(today, -1)), section: 'A', slot_label: 'Slot 6', slot_start: '18:30', slot_end: '20:00', course_code: 'CB', session_number: 1, is_special_event: false },
  { id: '3', term: 'IV', date: fmt(today), day_of_week: dayName(today), section: 'COMMON', slot_label: 'Slot 2', slot_start: '10:00', slot_end: '11:30', course_code: 'PM', session_number: 1, is_special_event: false },
  { id: '4', term: 'IV', date: fmt(today), day_of_week: dayName(today), section: 'A', slot_label: 'Slot 4', slot_start: '14:30', slot_end: '16:00', course_code: 'DV', session_number: 2, is_special_event: false },
  { id: '5', term: 'IV', date: fmt(today), day_of_week: dayName(today), section: 'A', slot_label: 'Slot 6', slot_start: '18:30', slot_end: '20:00', course_code: 'SAPM', session_number: 1, is_special_event: false },
  { id: '6', term: 'IV', date: fmt(addDays(today, 1)), day_of_week: dayName(addDays(today, 1)), section: 'B', slot_label: 'Slot 1', slot_start: '08:00', slot_end: '09:30', course_code: 'OFD', session_number: 1, is_special_event: false },
  { id: '7', term: 'IV', date: fmt(addDays(today, 1)), day_of_week: dayName(addDays(today, 1)), section: 'COMMON', slot_label: 'Slot 3', slot_start: '12:00', slot_end: '13:30', course_code: 'AMR', session_number: 1, is_special_event: false },
  { id: '8', term: 'IV', date: fmt(addDays(today, 2)), day_of_week: dayName(addDays(today, 2)), section: 'A', slot_label: 'Slot 2', slot_start: '10:00', slot_end: '11:30', course_code: 'CB', session_number: 2, is_special_event: false },
  { id: '9', term: 'IV', date: fmt(addDays(today, 3)), day_of_week: dayName(addDays(today, 3)), section: 'A', slot_label: 'Slot 5', slot_start: '16:30', slot_end: '18:00', course_code: 'DV', session_number: 3, is_special_event: false },
  { id: '10', term: 'IV', date: fmt(addDays(today, 4)), day_of_week: dayName(addDays(today, 4)), section: 'COMMON', slot_label: 'Slot 1', slot_start: '08:00', slot_end: '09:30', course_code: 'PM', session_number: 2, is_special_event: false },
]
