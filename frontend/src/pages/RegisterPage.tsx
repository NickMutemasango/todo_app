import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authApi } from '../services/api'
import Spinner from '../components/Spinner'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await authApi.register(username, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Registration failed. Please try again.')
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create account</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Get started with your free account
          </p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">Account created!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Redirecting to login…</p>
            </div>
          ) : (
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
                  minLength={3}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Confirm */}
              <div>
                <label htmlFor="confirm" className="label">Confirm password</label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
                {loading ? <><Spinner size={16} /> Creating account…</> : 'Create account'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
