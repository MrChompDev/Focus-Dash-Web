import { useState, useEffect, useCallback } from 'react'
import type { Task } from '../lib/types'
import { CATEGORIES } from '../lib/types'
import { loadTasks, addTask, toggleTask, deleteTask } from '../lib/storage'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])

  const refresh = useCallback(() => {
    const all = loadTasks()
    if (filter === 'all') setTasks(all)
    else if (filter === 'pending') setTasks(all.filter(t => !t.completed))
    else setTasks(all.filter(t => t.completed))
  }, [filter])

  useEffect(() => { refresh() }, [refresh])

  const handleAdd = () => {
    if (!title.trim()) return
    addTask({ title: title.trim(), description: '', category, priority: 0, completed: false, dueDate: null })
    setTitle(''); refresh()
  }

  const handleToggle = (id: string) => { toggleTask(id); refresh() }
  const handleDelete = (id: string) => { deleteTask(id); refresh() }

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 'bold' }}>Tasks</div>
        <div className="rounded-xl p-4 flex flex-col gap-2.5" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex gap-2.5">
            <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Add a new task..."
              className="flex-1 h-10 rounded-lg px-3.5 text-sm border-none outline-none"
              style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)' }} />
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="h-10 rounded-lg px-3 text-sm border-none outline-none cursor-pointer"
              style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={handleAdd}
              className="h-10 px-5 rounded-lg text-sm font-bold cursor-pointer border-none"
              style={{ backgroundColor: '#6C63FF', color: 'white' }}>Add</button>
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'completed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="h-8 px-3.5 rounded text-xs cursor-pointer border-none"
                style={{
                  backgroundColor: filter === f ? '#6C63FF' : 'var(--bg-surface-light)',
                  color: filter === f ? '#fff' : 'var(--text-muted)',
                }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {tasks.length === 0 ? (
            <div style={{ color: '#666', fontSize: 14, padding: 24, textAlign: 'center' }}>No tasks here. Add one above!</div>
          ) : (
            tasks.map(t => (
              <div key={t.id} className="rounded-lg pl-3 pr-1 py-2 flex items-center gap-3"
                style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid #6C63FF' }}>
                <input type="checkbox" checked={t.completed} onChange={() => handleToggle(t.id)}
                  className="w-5 h-5 rounded-full cursor-pointer accent-[#6C63FF]" />
                <div className="flex-1 min-w-0">
                  <div style={{ color: 'var(--text-primary)', fontSize: 14, textDecoration: t.completed ? 'line-through' : 'none', opacity: t.completed ? 0.6 : 1 }}>
                    {t.title}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t.category}</div>
                </div>
                <button onClick={() => handleDelete(t.id)}
                  className="w-7 h-7 rounded-full text-sm cursor-pointer border-none hover:bg-[#F44336] hover:text-white"
                  style={{ backgroundColor: 'transparent', color: '#666' }}>✕</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
