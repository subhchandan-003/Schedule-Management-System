import { useState } from 'react'
import { api } from '../lib/api'

export function usePDFParser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const parsePDF = async (file, section) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.uploadPDF(file, section)
      setResult(data)
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { parsePDF, loading, error, result }
}
