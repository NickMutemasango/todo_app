import axios from 'axios'

// In production this points to the Railway backend URL (set VITE_API_URL in Vercel env vars).
// In local dev the Vite proxy handles it so '/' works fine.
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from localStorage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  username: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  owner_id: string
  created_at: string
}

export interface ProtectedData {
  message: string
  user: AuthUser
}

// ── Auth endpoints ─────────────────────────────────────────────────────────────

export const authApi = {
  register: (username: string, password: string) =>
    api.post<AuthUser>('/auth/register', { username, password }),

  login: (username: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { username, password }),
}

// ── Protected endpoint ─────────────────────────────────────────────────────────

export const protectedApi = {
  getInfo: () => api.get<ProtectedData>('/protected'),
}

// ── Todo endpoints ─────────────────────────────────────────────────────────────

export const todoApi = {
  list: () => api.get<Todo[]>('/todos'),

  create: (title: string, description?: string) =>
    api.post<Todo>('/todos', { title, description }),

  update: (id: string, patch: { title?: string; description?: string; completed?: boolean }) =>
    api.put<Todo>(`/todos/${id}`, patch),

  remove: (id: string) => api.delete(`/todos/${id}`),
}
