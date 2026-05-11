const SHEET_ID = import.meta.env.VITE_SHEET_ID

const TERM_TABS = {
  4: import.meta.env.VITE_TERM4_TAB || 'Schedule',
}

// Sheet column layout:
// 0=Date  1=Day  2=Section  3=09:30  4=11:15  5=LUNCH  6=14:00  7=15:45  8=18:00  9=20:00
const SLOT_COLS = [
  { label: '09:30', col: 3 },
  { label: '11:15', col: 4 },
  // col 5 = LUNCH (skipped)
  { label: '14:00', col: 6 },
  { label: '15:45', col: 7 },
  { label: '18:00', col: 8 },
  { label: '20:00', col: 9 },
]

export async function fetchSchedule(term, accessToken) {
  if (!accessToken) throw new Error('AUTH_EXPIRED')

  const tab = TERM_TABS[term]
  const range = encodeURIComponent(`${tab}!A:J`)
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
  if (!raw) return null
  const s = raw.toString().trim().toUpperCase()
  if (s === 'A' || s.includes('SECTION A')) return 'A'
  if (s === 'B' || s.includes('SECTION B')) return 'B'
  if (s === 'C' || s.includes('SECTION C')) return 'C'
  if (s === 'D' || s.includes('SECTION D')) return 'D'
  return null
}

function parseDateCell(raw) {
  if (!raw) return null
  const s = raw.toString().trim()
  if (!s) return null

  // YYYY-MM-DD or standard parseable strings
  const d = new Date(s)
  if (!isNaN(d.getTime()) && d.getFullYear() > 2000) {
    return d.toISOString().split('T')[0]
  }

  // M/D/YYYY → YYYY-MM-DD
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdy) {
    return `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`
  }

  // D-Mon or D Mon format ("5-Jan", "5 Jan") — pick closest year
  const dMon = s.match(/^(\d{1,2})[-\s]([A-Za-z]{3})$/)
  if (dMon) {
    const now = new Date()
    for (const yr of [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() + 1]) {
      const parsed = new Date(`${dMon[2]} ${dMon[1]}, ${yr}`)
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0]
    }
  }

  return null
}

function parseCourseCell(raw) {
  if (!raw) return null
  const s = raw.toString().trim()
  if (!s || s.toUpperCase() === 'LUNCH') return null

  // "SM - 1 Prof Diptiranjan Mahapatra" / "HRM-1 Prof. Shubhi Gupta" / "FM-II-1 Prof. Soumya Guha Deb"
  // Pattern: CODE (with optional Roman-numeral segment) – SESSION_NUM Prof(.) Name
  const profMatch = s.match(/^([A-Z]+(?:-[A-Z]+)*)\s*[-–]\s*(\d+)\s+Prof/i)
  if (profMatch) {
    return {
      id: profMatch[1],
      display: profMatch[1],
      sessionNum: parseInt(profMatch[2]),
      raw: s,
    }
  }

  // Short code without Prof suffix: "DV-1", "SAPM-2"
  const shortMatch = s.match(/^([A-Z]{1,8})\s*[-–]\s*(\d+)\s*$/)
  if (shortMatch) {
    return {
      id: shortMatch[1],
      display: shortMatch[1],
      sessionNum: parseInt(shortMatch[2]),
      raw: s,
    }
  }

  // Long name: "Product Management & Analytics 1 (Prof. Nitin Soni)"
  let clean = s.replace(/\s*\([^)]*\)\s*$/, '').trim()
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
    if (!section) continue
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
