const SHEET_ID = import.meta.env.VITE_SHEET_ID

const TERM_TABS = {
  4: import.meta.env.VITE_TERM4_TAB || 'Term 4',
  5: import.meta.env.VITE_TERM5_TAB || 'Term 5',
  6: import.meta.env.VITE_TERM6_TAB || 'Term 6',
}

// Sheet column layout:
// 0=Date  1=Day  2=Section  3=08:00  4=09:30  5=11:00  6=LUNCH  7=13:30  8=15:30  9=17:00  10=19:00
const SLOT_COLS = [
  { label: '08:00', col: 3 },
  { label: '09:30', col: 4 },
  { label: '11:00', col: 5 },
  { label: '13:30', col: 7 },
  { label: '15:30', col: 8 },
  { label: '17:00', col: 9 },
  { label: '19:00', col: 10 },
]

export async function fetchSchedule(term, accessToken) {
  if (!accessToken) throw new Error('AUTH_EXPIRED')

  const tab = TERM_TABS[term]
  const range = encodeURIComponent(`${tab}!A:K`)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.status === 401 || res.status === 403) throw new Error('AUTH_EXPIRED')
  if (!res.ok) throw new Error(`Could not load Term ${term} schedule (HTTP ${res.status})`)

  const json = await res.json()
  return parseRows(json.values || [])
}

export function extractAllCourses(entries) {
  const seen = new Set()
  const courses = []
  for (const entry of entries) {
    for (const slot of Object.values(entry.slots)) {
      if (!seen.has(slot.id)) {
        seen.add(slot.id)
        courses.push({ id: slot.id, label: slot.display })
      }
    }
  }
  return courses.sort((a, b) => a.id.localeCompare(b.id))
}

// ─── Parsing helpers ──────────────────────────────────────────────────────────

function normalizeSection(raw) {
  if (!raw) return 'Common'
  const s = raw.toString().trim().toLowerCase()
  if (s.includes('section a')) return 'A'
  if (s.includes('section b')) return 'B'
  return 'Common'
}

function parseDateCell(raw) {
  if (!raw) return null
  const s = raw.toString().trim()
  if (!s) return null

  // Try standard date string ("May 12, 2025", "5/12/2025", "2025-05-12")
  const d = new Date(s)
  if (!isNaN(d.getTime()) && d.getFullYear() > 2000) {
    return d.toISOString().split('T')[0]
  }

  // M/D/YYYY → YYYY-MM-DD
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdy) {
    return `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`
  }

  return null
}

function parseCourseCell(raw) {
  if (!raw) return null
  const s = raw.toString().trim()
  if (!s || s.toUpperCase() === 'LUNCH') return null

  // Term 4 short code: "DV-1", "SAPM-2 (RK)", "OFD-3 (08:00-10:00)"
  const shortMatch = s.match(/^([A-Z]{1,8})\s*[-–]\s*(\d+)/)
  if (shortMatch) {
    return {
      id: shortMatch[1],
      display: shortMatch[1],
      sessionNum: parseInt(shortMatch[2]),
      raw: s,
    }
  }

  // Term 5/6 long name: "Product Management & Analytics 1 (Prof. Nitin Soni)"
  let clean = s.replace(/\s*\([^)]*\)\s*$/, '').trim()   // strip trailing (...)
  const sessionMatch = clean.match(/^(.+?)\s+(\d+)\s*$/)
  const sessionNum = sessionMatch ? parseInt(sessionMatch[2]) : null
  const name = sessionMatch ? sessionMatch[1].trim() : clean

  if (!name) return null

  return {
    id: name,
    display: name.length <= 14 ? name : name.slice(0, 13) + '…',
    sessionNum,
    raw: s,
  }
}

function parseRows(rows) {
  const entries = []
  let currentDate = null
  let currentDay = null

  for (const row of rows) {
    const rawDate = row[0]
    const rawDay  = row[1]
    const rawSec  = row[2]

    // Skip header row
    if (typeof rawDate === 'string' && rawDate.toLowerCase() === 'date') continue

    // Date fill-down
    if (rawDate && rawDate.toString().trim()) {
      const parsed = parseDateCell(rawDate)
      if (parsed) {
        currentDate = parsed
        currentDay  = rawDay ? rawDay.toString().trim() : ''
      }
    }
    if (!currentDate) continue

    const section = normalizeSection(rawSec)
    const slots   = {}

    for (const { label, col } of SLOT_COLS) {
      const cell = row[col]
      if (!cell || !cell.toString().trim()) continue
      const parsed = parseCourseCell(cell.toString())
      if (parsed) slots[label] = parsed
    }

    if (Object.keys(slots).length > 0) {
      entries.push({ date: currentDate, day: currentDay, section, slots })
    }
  }

  return entries
}
