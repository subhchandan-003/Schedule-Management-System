const BASE = import.meta.env.VITE_API_BASE_URL || '/_/backend'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  uploadExcel: (file, term, adminUser, adminPass) => {
    const form = new FormData()
    form.append('file', file)
    form.append('term', term)
    return request('/upload/excel', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + btoa(`${adminUser}:${adminPass}`) },
      body: form,
    })
  },
  uploadPDF: (file, section) => {
    const form = new FormData()
    form.append('file', file)
    form.append('section', section)
    return request('/upload/pdf', { method: 'POST', body: form })
  },
  getEntries: (term, section, dateFrom, dateTo) => {
    const params = new URLSearchParams({ term })
    if (section) params.set('section', section)
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)
    return request(`/schedule/entries?${params}`)
  },
  getCourses: (term) => request(`/schedule/courses?term=${term}`),
  getTerms: () => request('/schedule/terms'),
}
