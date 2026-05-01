import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await authApi.login(username, password)
      login(data.access_token, data.user)
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Login failed. Please try again.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                <span className="mt-px">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="input"
                placeholder="your_username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? <><Spinner size={16} /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
