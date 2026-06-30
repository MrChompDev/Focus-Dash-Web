import { useState, useRef, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import DashboardPage from './components/DashboardPage'
import TimerPage from './components/TimerPage'
import TasksPage from './components/TasksPage'
import NotesPage from './components/NotesPage'
import WhiteboardPage from './components/WhiteboardPage'
import CalculatorPage from './components/CalculatorPage'
import StatisticsPage from './components/StatisticsPage'
import LockPage from './components/LockPage'
import SettingsPage from './components/SettingsPage'
import type { AppSettings } from './lib/types'
import { DEFAULT_SETTINGS } from './lib/types'
import { loadSettings, saveSettings, recordSession } from './lib/storage'
import { audioEngine } from './lib/audio'

type PageId = 'dashboard' | 'timer' | 'tasks' | 'notes' | 'whiteboard' | 'calculator' | 'statistics' | 'lock' | 'settings'
type TimerMode = 'Pomodoro' | 'Deep Work' | 'Stopwatch'

const THEME_CLASSES: Record<string, string> = {
  'Dark (Default)': '',
  'Light': 'theme-light',
  'Midnight Blue': 'theme-midnight',
  'Forest Green': 'theme-forest',
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard')
  const [, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [themeClass, setThemeClass] = useState('')

  const [timerMode, setTimerMode] = useState<TimerMode>('Pomodoro')
  const [timerState, setTimerState] = useState<'running' | 'paused' | 'stopped'>('stopped')
  const [timerDisplay, setTimerDisplay] = useState('25:00')
  const [timerProgress, setTimerProgress] = useState(0)
  const [timerStatus, setTimerStatus] = useState('Ready to focus')
  const [timerStatusColor, setTimerStatusColor] = useState('#666')

  const timerRef = useRef({
    remaining: 25 * 60, total: 25 * 60, mode: 'Pomodoro' as TimerMode, isBreak: false,
    pomodoroWork: 25, pomodoroBreak: 5, deepWork: 90,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const updateTimerDisplay = useCallback(() => {
    const t = timerRef.current
    const total = t.mode === 'Stopwatch' ? t.total : t.remaining
    const m = Math.floor(Math.abs(total) / 60)
    const s = Math.abs(total) % 60
    setTimerDisplay(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    if (t.mode !== 'Stopwatch' && t.total > 0) {
      setTimerProgress(1 - t.remaining / t.total)
    } else {
      setTimerProgress(0)
    }
  }, [])

  const resetTimerDuration = useCallback(() => {
    const t = timerRef.current
    if (t.mode === 'Pomodoro') {
      t.total = t.isBreak ? t.pomodoroBreak * 60 : t.pomodoroWork * 60
    } else if (t.mode === 'Deep Work') {
      t.total = t.deepWork * 60
    } else {
      t.total = 0
    }
    t.remaining = t.total
    updateTimerDisplay()
  }, [updateTimerDisplay])

  const tick = useCallback(() => {
    const t = timerRef.current
    if (t.mode === 'Stopwatch') { t.total++; t.remaining = t.total }
    else { t.remaining-- }
    updateTimerDisplay()

    if (t.mode !== 'Stopwatch' && t.remaining <= 0) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      setTimerState('stopped')
      recordSession(t.mode, t.mode === 'Pomodoro' ? t.pomodoroWork * 60 : t.deepWork * 60)
      setTimerStatus('Session complete!')
      setTimerStatusColor('#6C63FF')
      if (t.mode === 'Pomodoro') { t.isBreak = !t.isBreak; resetTimerDuration() }
    }
  }, [updateTimerDisplay, resetTimerDuration])

  const handleTimerStart = useCallback(() => {
    if (timerState === 'stopped') resetTimerDuration()
    setTimerState('running')
    setTimerStatus('Focus mode active')
    setTimerStatusColor('#4CAF50')
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, 1000)
  }, [timerState, resetTimerDuration, tick])

  const handleTimerPause = useCallback(() => {
    if (timerState === 'running') {
      setTimerState('paused'); setTimerStatus('Paused'); setTimerStatusColor('#FFC107')
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    } else if (timerState === 'paused') {
      setTimerState('running'); setTimerStatus('Focus mode active'); setTimerStatusColor('#4CAF50')
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(tick, 1000)
    }
  }, [timerState, tick])

  const handleTimerStop = useCallback(() => {
    setTimerState('stopped'); setTimerStatus('Ready to focus'); setTimerStatusColor('#666')
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    resetTimerDuration()
  }, [resetTimerDuration])

  const handleTimerSetMode = useCallback((mode: TimerMode) => {
    handleTimerStop()
    setTimerMode(mode)
    timerRef.current.mode = mode
    timerRef.current.isBreak = false
    resetTimerDuration()
  }, [handleTimerStop, resetTimerDuration])

  const [isLocked, setIsLocked] = useState(false)
  const handleToggleLock = useCallback(() => { setIsLocked(prev => !prev); setCurrentPage('lock') }, [])

  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioCurrent, setAudioCurrent] = useState('White Noise')
  const [audioVolume, setAudioVolume] = useState(0.5)

  const handlePlayAudio = useCallback(() => {
    if (audioEngine.isPlaying) { audioEngine.stop(); setAudioPlaying(false) }
    else { audioEngine.setVolume(audioVolume); audioEngine.play(audioCurrent as any); setAudioPlaying(true) }
  }, [audioVolume, audioCurrent])

  const handleSoundChange = useCallback((s: string) => {
    setAudioCurrent(s)
    if (audioEngine.isPlaying) { audioEngine.stop(); audioEngine.setVolume(audioVolume); audioEngine.play(s as any); setAudioPlaying(true) }
  }, [audioVolume])

  const handleVolDown = useCallback(() => { const v = Math.max(0, audioVolume - 0.1); setAudioVolume(v); audioEngine.setVolume(v) }, [audioVolume])
  const handleVolUp = useCallback(() => { const v = Math.min(1, audioVolume + 0.1); setAudioVolume(v); audioEngine.setVolume(v) }, [audioVolume])

  useEffect(() => {
    const s = loadSettings()
    setSettings(s)
    setThemeClass(THEME_CLASSES[s.theme] || '')
    timerRef.current.pomodoroWork = s.pomodoroWork
    timerRef.current.pomodoroBreak = s.pomodoroBreak
    timerRef.current.deepWork = s.deepWorkDuration
    audioEngine.setVolume(s.audioVolume)
    setAudioVolume(s.audioVolume)
  }, [])

  const handleThemeChange = useCallback((theme: string) => {
    setThemeClass(THEME_CLASSES[theme] || '')
    saveSettings({ ...loadSettings(), theme: theme as any })
  }, [])

  const handleFontSizeChange = useCallback((size: number) => {
    document.documentElement.style.fontSize = `${size}px`
  }, [])

  const handleTimerDurationChange = useCallback((work: number, break_: number, deep: number) => {
    timerRef.current.pomodoroWork = work; timerRef.current.pomodoroBreak = break_; timerRef.current.deepWork = deep
    resetTimerDuration()
  }, [resetTimerDuration])

  const handleVolumeChange = useCallback((vol: number) => { setAudioVolume(vol); audioEngine.setVolume(vol) }, [])

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); audioEngine.cleanup() }
  }, [])

  const navigate = useCallback((page: string) => { setCurrentPage(page as PageId) }, [])

  const renderPage = () => {
    const timer = { time: timerDisplay, progress: timerProgress, mode: timerMode, state: timerState, status: timerStatus, statusColor: timerStatusColor }
    switch (currentPage) {
      case 'dashboard': return <DashboardPage pageTimer={timer} onTimerStart={handleTimerStart} onTimerPause={handleTimerPause} onTimerStop={handleTimerStop} timerState={timerState} onNavigate={navigate} />
      case 'timer': return <TimerPage timer={timer} onSetMode={handleTimerSetMode} onStart={handleTimerStart} onPause={handleTimerPause} onStop={handleTimerStop} />
      case 'tasks': return <TasksPage />
      case 'notes': return <NotesPage />
      case 'whiteboard': return <WhiteboardPage />
      case 'calculator': return <CalculatorPage />
      case 'statistics': return <StatisticsPage />
      case 'lock': return <LockPage isLocked={isLocked} onToggleLock={handleToggleLock} />
      case 'settings': return <SettingsPage onThemeChange={handleThemeChange} onFontSizeChange={handleFontSizeChange} onTimerDurationChange={handleTimerDurationChange} onVolumeChange={handleVolumeChange} />
    }
  }

  return (
    <div className={themeClass} style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar currentPage={currentPage} onNavigate={navigate} isLocked={isLocked} onToggleLock={handleToggleLock}
        soundTypes={['White Noise', 'Pink Noise', 'Brown Noise', 'Rain', 'Forest', 'Ocean']}
        currentSound={audioCurrent} isPlaying={audioPlaying} volume={audioVolume}
        onPlay={handlePlayAudio} onVolDown={handleVolDown} onVolUp={handleVolUp} onSoundChange={handleSoundChange} />
      {renderPage()}
    </div>
  )
}
