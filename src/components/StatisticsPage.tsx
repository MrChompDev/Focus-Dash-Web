import { useState, useEffect, useCallback } from 'react'
import {
  getTotalFocusTime, getTodayFocusTime, getCurrentStreak, getTotalSessions,
  getLongestStreak, getWeeklyFocusTime, getWeeklyData, getModeBreakdown, formatDuration,
} from '../lib/storage'

export default function StatisticsPage() {
  const [stats, setStats] = useState({
    total: '0h 0m', today: '0m', streak: '0 days', sessions: '0', bestStreak: '0 days', week: '0h 0m',
  })
  const [weeklyData, setWeeklyData] = useState<{ date: string; minutes: number }[]>([])
  const [modeData, setModeData] = useState<{ mode: string; total: number; sessions: number }[]>([])

  const refresh = useCallback(() => {
    setStats({
      total: formatDuration(getTotalFocusTime()), today: formatDuration(getTodayFocusTime()),
      streak: `${getCurrentStreak()} days`, sessions: `${getTotalSessions()}`,
      bestStreak: `${getLongestStreak()} days`, week: formatDuration(getWeeklyFocusTime()),
    })
    setWeeklyData(getWeeklyData())
    setModeData(getModeBreakdown())
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => { const iv = setInterval(refresh, 5000); return () => clearInterval(iv) }, [refresh])

  const cards = [
    { title: 'Total Focus Time', value: stats.total, subtitle: 'All time', color: '#6C63FF' },
    { title: 'Today', value: stats.today, subtitle: "Today's progress", color: '#4CAF50' },
    { title: 'Current Streak', value: stats.streak, subtitle: 'Keep going!', color: '#FFC107' },
    { title: 'Total Sessions', value: stats.sessions, subtitle: 'Completed sessions', color: '#E040FB' },
    { title: 'Best Streak', value: stats.bestStreak, subtitle: 'Personal record', color: '#FF6B6B' },
    { title: 'This Week', value: stats.week, subtitle: '7-day total', color: '#00BCD4' },
  ]

  const maxMin = Math.max(...weeklyData.map(d => d.minutes), 1)

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 'bold' }}>Focus Statistics</div>
        <div className="grid grid-cols-3 gap-4">
          {cards.map(c => (
            <div key={c.title} className="rounded-xl p-5 flex flex-col gap-1"
              style={{ backgroundColor: 'var(--bg-surface)', borderLeft: `4px solid ${c.color}` }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.title}</div>
              <div style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 'bold' }}>{c.value}</div>
              <div style={{ color: '#666', fontSize: 11 }}>{c.subtitle}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Weekly Breakdown</div>
          <div className="flex flex-col gap-2">
            {weeklyData.map(d => (
              <div key={d.date} className="flex flex-col gap-0.5">
                <div style={{ color: '#aaa', fontSize: 12 }}>{d.date}  {d.minutes}m</div>
                <div className="h-3 rounded-full" style={{ backgroundColor: 'var(--bg-surface-light)', overflow: 'hidden' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(d.minutes / maxMin) * 100}%`, backgroundColor: '#6C63FF' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Mode Breakdown</div>
          {modeData.length === 0 ? (
            <div style={{ color: '#666', fontSize: 13, padding: 8 }}>No focus sessions yet. Start your first timer!</div>
          ) : (
            modeData.map(m => {
              const totalAll = modeData.reduce((a, x) => a + x.total, 0)
              return (
                <div key={m.mode} style={{ color: '#aaa', fontSize: 13, padding: '4px 0' }}>
                  {m.mode}: {formatDuration(m.total)} ({Math.round((m.total / totalAll) * 100)}%) — {m.sessions} sessions
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
