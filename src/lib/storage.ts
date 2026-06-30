import type { Task, Note, FocusSession, AppEntry, AppSettings } from './types'
import { DEFAULT_SETTINGS } from './types'

const KEYS = {
  settings: 'focusdash_settings',
  tasks: 'focusdash_tasks',
  notes: 'focusdash_notes',
  sessions: 'focusdash_sessions',
  apps: 'focusdash_apps',
  lockMode: 'focusdash_lock_mode',
  lockOnTimer: 'focusdash_lock_on_timer',
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadSettings(): AppSettings {
  return get(KEYS.settings, DEFAULT_SETTINGS)
}
export function saveSettings(s: AppSettings): void {
  set(KEYS.settings, s)
}

export function loadTasks(): Task[] {
  return get(KEYS.tasks, [])
}
export function saveTasks(tasks: Task[]): void {
  set(KEYS.tasks, tasks)
}
export function addTask(task: Omit<Task, 'id' | 'createdAt'>): Task[] {
  const tasks = loadTasks()
  tasks.unshift({ ...task, id: genId(), createdAt: new Date().toISOString() })
  saveTasks(tasks)
  return tasks
}
export function toggleTask(id: string): Task[] {
  const tasks = loadTasks().map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  saveTasks(tasks)
  return tasks
}
export function deleteTask(id: string): Task[] {
  const tasks = loadTasks().filter(t => t.id !== id)
  saveTasks(tasks)
  return tasks
}

export function loadNotes(): Note[] {
  return get(KEYS.notes, [])
}
export function saveNotes(notes: Note[]): void {
  set(KEYS.notes, notes)
}
export function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note[] {
  const notes = loadNotes()
  notes.unshift({ ...note, id: genId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
  saveNotes(notes)
  return notes
}
export function updateNote(id: string, updates: Partial<Note>): Note[] {
  const notes = loadNotes().map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
  saveNotes(notes)
  return notes
}
export function deleteNote(id: string): Note[] {
  const notes = loadNotes().filter(n => n.id !== id)
  saveNotes(notes)
  return notes
}
export function clearAllNotes(): void {
  saveNotes([])
}

export function loadSessions(): FocusSession[] {
  return get(KEYS.sessions, [])
}
export function saveSessions(s: FocusSession[]): void {
  set(KEYS.sessions, s)
}
export function recordSession(mode: string, durationSeconds: number, completed = true): void {
  const sessions = loadSessions()
  sessions.push({
    id: genId(), mode, durationSeconds, completed,
    startedAt: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
  })
  saveSessions(sessions)
}

export function getTotalFocusTime(): number {
  return loadSessions().filter(s => s.completed).reduce((a, s) => a + s.durationSeconds, 0)
}
export function getTotalSessions(): number {
  return loadSessions().filter(s => s.completed).length
}
export function getTodayFocusTime(): number {
  const today = new Date().toISOString().slice(0, 10)
  return loadSessions().filter(s => s.completed && s.date === today).reduce((a, s) => a + s.durationSeconds, 0)
}
export function getWeeklyFocusTime(): number {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  return loadSessions().filter(s => s.completed && s.date >= weekAgo).reduce((a, s) => a + s.durationSeconds, 0)
}
export function getCurrentStreak(): number {
  const dates = [...new Set(loadSessions().filter(s => s.completed).map(s => s.date))].sort().reverse()
  if (!dates.length) return 0
  let streak = 0
  let check = new Date().toISOString().slice(0, 10)
  for (const d of dates) {
    if (d === check) { streak++; check = new Date(new Date(check).getTime() - 86400000).toISOString().slice(0, 10) }
    else break
  }
  return streak
}
export function getLongestStreak(): number {
  const dates = [...new Set(loadSessions().filter(s => s.completed).map(s => s.date))].sort()
  if (!dates.length) return 0
  let longest = 0, current = 1
  for (let i = 1; i < dates.length; i++) {
    if (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime() === 86400000) current++
    else { longest = Math.max(longest, current); current = 1 }
  }
  return Math.max(longest, current)
}
export function getWeeklyData(): { date: string; minutes: number }[] {
  const today = new Date()
  const data: { date: string; minutes: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    const total = loadSessions().filter(s => s.completed && s.date === key).reduce((a, s) => a + s.durationSeconds, 0)
    data.push({ date: d.toLocaleDateString('en', { weekday: 'short' }), minutes: Math.floor(total / 60) })
  }
  return data
}
export function getModeBreakdown(): { mode: string; total: number; sessions: number }[] {
  const sessions = loadSessions().filter(s => s.completed)
  const map = new Map<string, { total: number; sessions: number }>()
  for (const s of sessions) {
    const e = map.get(s.mode) || { total: 0, sessions: 0 }
    e.total += s.durationSeconds; e.sessions++; map.set(s.mode, e)
  }
  return Array.from(map.entries()).map(([mode, v]) => ({ mode, ...v }))
}
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function loadApps(): AppEntry[] {
  return get(KEYS.apps, [])
}
export function saveApps(apps: AppEntry[]): void {
  set(KEYS.apps, apps)
}
export function addApp(appName: string, isAllowed = false): AppEntry[] {
  const apps = loadApps()
  if (!appName.endsWith('.exe')) appName += '.exe'
  if (apps.some(a => a.appName === appName && a.isAllowed === isAllowed)) return apps
  apps.push({ id: genId(), appName, isAllowed, blocked: true, createdAt: new Date().toISOString() })
  saveApps(apps)
  return apps
}
export function removeApp(id: string): AppEntry[] {
  const apps = loadApps().filter(a => a.id !== id)
  saveApps(apps)
  return apps
}
export function toggleBlocked(id: string): AppEntry[] {
  const apps = loadApps().map(a => a.id === id ? { ...a, blocked: !a.blocked } : a)
  saveApps(apps)
  return apps
}

export function loadLockMode(): string {
  return localStorage.getItem(KEYS.lockMode) || 'blocklist'
}
export function saveLockMode(mode: string): void {
  localStorage.setItem(KEYS.lockMode, mode)
}
export function loadLockOnTimer(): boolean {
  return localStorage.getItem(KEYS.lockOnTimer) === 'true'
}
export function saveLockOnTimer(v: boolean): void {
  localStorage.setItem(KEYS.lockOnTimer, v ? 'true' : 'false')
}
