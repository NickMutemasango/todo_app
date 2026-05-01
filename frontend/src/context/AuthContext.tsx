import { createContext, useCallback, useContext, useState } from 'react'

interface AuthUser {
  id: string
  username: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadFromStorage(): { token: string | null; user: AuthUser | null } {
  try {
    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')
    const user = raw ? (JSON.parse(raw) as AuthUser) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ token, user }, setState] = useState(loadFromStorage)

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setState({ token: newToken, user: newUser })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setState({ token: null, user: null })
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
