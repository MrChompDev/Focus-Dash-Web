export type TimerMode = 'Pomodoro' | 'Deep Work' | 'Stopwatch'
export type TimerState = 'running' | 'paused' | 'stopped'
export type ThemeName = 'Dark (Default)' | 'Light' | 'Midnight Blue' | 'Forest Green'
export type LockMode = 'blocklist' | 'allowlist'
export type SoundType = 'White Noise' | 'Pink Noise' | 'Brown Noise' | 'Rain' | 'Forest' | 'Ocean'

export interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: number
  completed: boolean
  createdAt: string
  dueDate: string | null
}

export interface Note {
  id: string
  content: string
  color: string
  posX: number
  posY: number
  createdAt: string
  updatedAt: string
}

export interface FocusSession {
  id: string
  mode: string
  durationSeconds: number
  completed: boolean
  startedAt: string
  date: string
}

export interface AppEntry {
  id: string
  appName: string
  isAllowed: boolean
  blocked: boolean
  createdAt: string
}

export interface AppSettings {
  pomodoroWork: number
  pomodoroBreak: number
  deepWorkDuration: number
  theme: ThemeName
  fontSize: number
  audioVolume: number
  defaultSound: SoundType
  lockMode: LockMode
  lockOnTimer: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  pomodoroWork: 25,
  pomodoroBreak: 5,
  deepWorkDuration: 90,
  theme: 'Dark (Default)',
  fontSize: 14,
  audioVolume: 0.5,
  defaultSound: 'White Noise',
  lockMode: 'blocklist',
  lockOnTimer: false,
}

export const NOTE_COLORS = [
  '#FFF3CD', '#FFD6D6', '#D6F5D6', '#D6E8FF',
  '#E8D6FF', '#FFE8D6', '#D6FFF5', '#F0F0F0',
]

export const CATEGORIES = ['General', 'Work', 'Personal', 'Study', 'Health']
