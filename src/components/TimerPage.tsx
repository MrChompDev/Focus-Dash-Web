import { useState } from 'react'
import CircularTimer from './CircularTimer'

type TimerMode = 'Pomodoro' | 'Deep Work' | 'Stopwatch'

interface Props {
  timer: { time: string; progress: number; mode: TimerMode; state: string; status: string; statusColor: string }
  onSetMode: (mode: TimerMode) => void
  onStart: () => void
  onPause: () => void
  onStop: () => void
}

export default function TimerPage({ timer, onSetMode, onStart, onPause, onStop }: Props) {
  const modes: TimerMode[] = ['Pomodoro', 'Deep Work', 'Stopwatch']
  const [activeMode, setActiveMode] = useState<TimerMode>(timer.mode)

  const handleMode = (m: TimerMode) => { setActiveMode(m); onSetMode(m) }

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto pt-8">
        <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 'bold' }}>Timer</div>
        <div className="flex gap-2.5">
          {modes.map(m => (
            <button key={m} onClick={() => handleMode(m)}
              className="h-9 px-4 rounded-lg text-sm cursor-pointer border-none transition-colors"
              style={{
                backgroundColor: activeMode === m ? '#6C63FF' : 'var(--bg-surface-light)',
                color: activeMode === m ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activeMode === m ? 'bold' : 400,
              }}>
              {m}
            </button>
          ))}
        </div>
        <CircularTimer time={timer.time} progress={timer.progress} mode={timer.mode} />
        <div className="flex gap-3">
          {[
            { label: timer.state === 'running' ? 'Running...' : 'Start', onClick: onStart },
            { label: timer.state === 'paused' ? 'Resume' : 'Pause', onClick: onPause },
            { label: 'Stop', onClick: onStop },
          ].map(b => (
            <button key={b.label} onClick={b.onClick}
              className="h-[42px] w-[120px] rounded-xl text-sm cursor-pointer border-none font-medium"
              style={{ backgroundColor: 'var(--bg-surface-light)', color: '#fff' }}>
              {b.label}
            </button>
          ))}
        </div>
        <div style={{ color: timer.statusColor, fontSize: 13, fontWeight: timer.state === 'running' ? 600 : 400 }}>
          {timer.status}
        </div>
      </div>
    </div>
  )
}
