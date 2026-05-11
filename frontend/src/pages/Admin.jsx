import { useState, useRef } from 'react'
import { Upload, RefreshCw, CheckCircle, AlertCircle, Lock } from 'lucide-react'
import { api } from '../lib/api'
import { Spinner } from '../components/ui/Spinner'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('admin')
  const [authError, setAuthError] = useState('')

  const [term, setTerm] = useState('IV')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)
  const fileRef = useRef()

  const handleAuth = (e) => {
    e.preventDefault()
    if (password.trim()) {
      setAuthed(true)
      setAuthError('')
    } else {
      setAuthError('Password required')
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const data = await api.uploadExcel(file, term, username, password)
      setResult(data)
      setLastSync(new Date().toLocaleString())
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!authed) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 mx-auto mb-4 flex items-center justify-center">
              <Lock size={20} className="text-slate-400" />
            </div>
            <h1 className="font-display font-bold text-white text-xl">Admin Access</h1>
            <p className="text-slate-500 text-sm mt-1">Enter admin credentials to continue</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-primary/60"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-primary/60"
            />
            {authError && <p className="text-rose-400 text-xs">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6 max-w-2xl">
      <h1 className="font-display font-extrabold text-white text-xl mb-1">Admin Panel</h1>
      <p className="text-slate-500 text-sm mb-8">Import schedule data and manage terms</p>

      {/* Upload Excel */}
      <div className="bg-surface border border-slate-700 rounded-2xl p-6 mb-6">
        <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Upload size={16} className="text-primary" />
          Import Schedule (Excel)
        </h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="px-3 py-2 bg-navy border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-primary/60 w-full"
            >
              {['IV', 'V', 'VI'].map((t) => (
                <option key={t} value={t}>Term {t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Excel File (.xlsx)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:text-xs file:font-semibold hover:file:bg-primary/30 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <><Spinner size="sm" /> Importing…</> : <><Upload size={14} /> Import Term {term}</>}
          </button>
        </form>

        {result && (
          <div className="mt-4 flex items-start gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Import successful</p>
              <p className="text-emerald-400/70 text-xs mt-0.5">{result.message}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-start gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-surface border border-slate-700 rounded-2xl p-6">
        <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <RefreshCw size={16} className="text-primary" />
          Sync Status
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Last import</span>
            <span>{lastSync || 'Never'}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Realtime</span>
            <span className="text-emerald-400">Active via Supabase</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Google Sheet webhook</span>
            <span className="text-amber-400">Configure Apps Script</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
          To enable live Google Sheet sync, paste the Apps Script code from{' '}
          <code className="text-slate-400">apps_script/onEdit_webhook.gs</code> into your Google Sheet,
          then set the WEBHOOK_URL to your backend URL.
        </div>
      </div>
    </div>
  )
}
