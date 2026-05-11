import { useState } from 'react'
import { supabase } from '../supabase'
import { BookOpen, AlertCircle, Loader } from 'lucide-react'

export default function Login({ domainError }) {
  const [loading, setLoading] = useState(false)

  const signIn = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          hd: 'iimsambalpur.ac.in',
        },
        redirectTo: window.location.origin,
      },
    })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 mx-auto mb-5 flex items-center justify-center shadow-lg shadow-blue-600/30">
          <BookOpen size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">IIM Sambalpur</h1>
        <p className="text-slate-400 mt-2 text-sm">MBA Schedule Platform · Batch 2024–26</p>
      </div>

      {/* Domain error */}
      {domainError && (
        <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-300 px-4 py-3 rounded-xl mb-6 max-w-sm w-full text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>
            Only <strong className="text-rose-200">@iimsambalpur.ac.in</strong> accounts are
            allowed. Please sign in with your institute email.
          </p>
        </div>
      )}

      {/* Sign-in button */}
      <button
        onClick={signIn}
        disabled={loading}
        className="flex items-center gap-3 bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader size={18} className="animate-spin text-slate-500" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {loading ? 'Redirecting…' : 'Sign in with Google'}
      </button>

      <p className="text-slate-600 text-xs mt-8 text-center max-w-xs leading-relaxed">
        Use your <span className="text-slate-500 font-medium">@iimsambalpur.ac.in</span> Google
        account. Other email addresses will be blocked.
      </p>
    </div>
  )
}
