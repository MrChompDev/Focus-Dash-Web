import { useEffect, useState, useCallback } from 'react'
import CircularTimer from './CircularTimer'
import type { Task } from '../lib/types'
import { loadTasks, getTodayFocusTime, getWeeklyFocusTime, getCurrentStreak, getTotalSessions, formatDuration } from '../lib/storage'

interface Props {
  pageTimer: { time: string; progress: number; mode: string }
  onTimerStart: () => void
  onTimerPause: () => void
  onTimerStop: () => void
  timerState: string
  onNavigate: (page: string) => void
}

export default function DashboardPage({ pageTimer, onTimerStart, onTimerPause, onTimerStop, timerState, onNavigate }: Props) {
  const [today, setToday] = useState('0m')
  const [week, setWeek] = useState('0m')
  const [streak, setStreak] = useState('0 days')
  const [sessions, setSessions] = useState('0')
  const [tasks, setTasks] = useState<Task[]>([])

  const refresh = useCallback(() => {
    setToday(formatDuration(getTodayFocusTime()))
    setWeek(formatDuration(getWeeklyFocusTime()))
    setStreak(`${getCurrentStreak()} days`)
    setSessions(`${getTotalSessions()}`)
    setTasks(loadTasks().filter(t => !t.completed).slice(0, 5))
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => { const iv = setInterval(refresh, 5000); return () => clearInterval(iv) }, [refresh])

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex gap-6 max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-4 flex-[2]">
          <div className="rounded-xl p-5 flex flex-col items-center gap-3" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 'bold' }}>Focus Timer</div>
            <CircularTimer time={pageTimer.time} progress={pageTimer.progress} mode={pageTimer.mode} />
            <div className="flex gap-2">
              <button onClick={onTimerStart} className="h-[38px] px-5 rounded-lg text-sm font-bold cursor-pointer border-none"
                style={{ backgroundColor: '#6C63FF', color: 'white' }}>
                {timerState === 'running' ? 'Running...' : 'Start'}
              </button>
              <button onClick={onTimerPause} className="h-[38px] px-5 rounded-lg text-sm cursor-pointer border-none"
                style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)' }}>
                {timerState === 'paused' ? 'Resume' : 'Pause'}
              </button>
              <button onClick={onTimerStop} className="h-[38px] px-5 rounded-lg text-sm cursor-pointer border-none"
                style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)' }}>
                Stop
              </button>
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Quick Stats</div>
            {[
              ['Today:', today], ['This Week:', week],
              ['Streak:', streak], ['Sessions:', sessions],
            ].map(([label, val]) => (
              <div key={label as string} style={{ color: '#ccc', fontSize: 14, padding: '6px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span> {val}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-[3]">
          <div className="rounded-xl p-5 flex-1" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Pending Tasks</div>
            {tasks.length === 0 ? (
              <div style={{ color: '#666', padding: 8, fontSize: 14 }}>No pending tasks. Great job!</div>
            ) : (
              tasks.map(t => (
                <div key={t.id} onClick={() => onNavigate('tasks')}
                  className="cursor-pointer hover:opacity-80 rounded px-2 py-1.5 text-sm"
                  style={{ color: '#aaa' }}>
                  {t.title}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
