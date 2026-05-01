import { useEffect, useRef, useState, type FormEvent } from 'react'
import axios from 'axios'
import { todoApi, protectedApi, type Todo, type ProtectedData } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  )
}

type Filter = 'all' | 'active' | 'done'

export default function DashboardPage() {
  const { user } = useAuth()
  const [info, setInfo] = useState<ProtectedData | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([protectedApi.getInfo(), todoApi.list()])
      .then(([infoRes, todosRes]) => {
        setInfo(infoRes.data)
        setTodos(todosRes.data)
      })
      .catch(err => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.detail ?? 'Failed to load data.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (showForm) setTimeout(() => inputRef.current?.focus(), 50)
  }, [showForm])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const { data } = await todoApi.create(newTitle.trim(), newDesc.trim() || undefined)
      setTodos(prev => [data, ...prev])
      setNewTitle('')
      setNewDesc('')
      setShowForm(false)
    } catch {
      setError('Failed to add todo.')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (todo: Todo) => {
    try {
      const { data } = await todoApi.update(todo.id, { completed: !todo.completed })
      setTodos(prev => prev.map(t => (t.id === data.id ? data : t)))
    } catch {
      setError('Failed to update todo.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await todoApi.remove(id)
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch {
      setError('Failed to delete todo.')
    }
  }

  const filtered = todos.filter(t =>
    filter === 'all' ? true : filter === 'done' ? t.completed : !t.completed
  )
  const doneCount = todos.filter(t => t.completed).length

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Spinner size={32} />
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Welcome banner */}
        {info && (
          <div className="card bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-slate-800 border-brand-100 dark:border-brand-800">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{info.message}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-600 font-bold">×</button>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Todos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {doneCount}/{todos.length} completed
            </p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary">
            <PlusIcon /> New todo
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Add a new todo</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="label">Title <span className="text-red-400">*</span></label>
                <input
                  ref={inputRef}
                  className="input"
                  placeholder="What do you need to do?"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  className="input"
                  placeholder="Add details…"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={adding} className="btn-primary">
                  {adding ? <><Spinner size={14} /> Adding…</> : 'Add todo'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {(['all', 'active', 'done'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors duration-150 ${
                filter === f
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Todo list */}
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-3xl mb-3">{filter === 'done' ? '🏁' : '📝'}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {filter === 'all'
                ? 'No todos yet. Add one above!'
                : filter === 'active'
                ? 'No active todos — great job!'
                : 'No completed todos yet.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(todo => (
              <li
                key={todo.id}
                className="card flex items-start gap-4 py-4 px-5 group hover:shadow-md transition-shadow duration-150"
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(todo)}
                  aria-label={todo.completed ? 'Mark as active' : 'Mark as done'}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
                    todo.completed
                      ? 'bg-brand-500 border-brand-500'
                      : 'border-slate-300 dark:border-slate-600 hover:border-brand-400'
                  }`}
                >
                  {todo.completed && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${
                    todo.completed
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{todo.description}</p>
                  )}
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                    {new Date(todo.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(todo.id)}
                  aria-label="Delete todo"
                  className="btn-danger opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Progress bar */}
        {todos.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>Progress</span>
              <span>{Math.round((doneCount / todos.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / todos.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
