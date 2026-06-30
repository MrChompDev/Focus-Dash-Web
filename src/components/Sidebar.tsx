type PageId = 'dashboard' | 'timer' | 'tasks' | 'notes' | 'whiteboard' | 'calculator' | 'statistics' | 'lock' | 'settings'

const SECTIONS: { label: string; items: { label: string; id: PageId }[] }[] = [
  { label: 'FOCUS', items: [
    { label: 'Dashboard', id: 'dashboard' },
    { label: 'Timer', id: 'timer' },
    { label: 'Tasks', id: 'tasks' },
  ]},
  { label: 'CREATE', items: [
    { label: 'Notes', id: 'notes' },
    { label: 'Whiteboard', id: 'whiteboard' },
    { label: 'Calculator', id: 'calculator' },
  ]},
  { label: 'INSIGHTS', items: [
    { label: 'Statistics', id: 'statistics' },
    { label: 'Focus Lock', id: 'lock' },
    { label: 'Settings', id: 'settings' },
  ]},
]

interface Props {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  isLocked: boolean
  onToggleLock: () => void
  soundTypes: string[]
  currentSound: string
  isPlaying: boolean
  volume: number
  onPlay: () => void
  onVolDown: () => void
  onVolUp: () => void
  onSoundChange: (s: string) => void
}

export default function Sidebar(props: Props) {
  const { currentPage, onNavigate, isLocked, onToggleLock,
    soundTypes, currentSound, isPlaying, onPlay, onVolDown, onVolUp, onSoundChange } = props

  return (
    <div className="w-[200px] flex flex-col flex-shrink-0 border-r" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-surface)', minHeight: '100vh' }}>
      <div className="flex items-center h-[60px] px-4 border-b flex-shrink-0" style={{ borderColor: 'var(--bg-surface)' }}>
        <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 700, letterSpacing: '1px' }}>Focus Dash</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <div className="px-5 py-1 text-xs font-bold tracking-widest" style={{ color: 'var(--text-dim)', height: 28, lineHeight: '28px' }}>
              {section.label}
            </div>
            {section.items.map(item => (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className="w-full text-left px-5 h-10 text-sm transition-colors"
                style={{
                  background: currentPage === item.id ? 'rgba(108, 99, 255, 0.12)' : 'transparent',
                  color: currentPage === item.id ? '#ffffff' : 'var(--text-muted)',
                  borderLeft: currentPage === item.id ? '2px solid #6C63FF' : '2px solid transparent',
                  fontWeight: currentPage === item.id ? 600 : 400,
                }}>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t p-2 flex-shrink-0" style={{ borderColor: 'var(--bg-surface)' }}>
        <button onClick={onToggleLock}
          className="w-full h-8 text-xs rounded mb-2 transition-colors"
          style={{
            backgroundColor: isLocked ? 'rgba(76, 175, 80, 0.15)' : 'var(--bg-surface-light)',
            color: isLocked ? '#4CAF50' : 'var(--text-muted)',
            border: isLocked ? '1px solid #4CAF50' : '1px solid var(--bg-surface-light)',
            fontWeight: isLocked ? 600 : 400, cursor: 'pointer',
          }}>
          {isLocked ? 'Lock Active' : 'Lock Inactive'}
        </button>

        <div className="flex items-center gap-1">
          <select value={currentSound} onChange={e => onSoundChange(e.target.value)}
            className="flex-1 h-7 text-xs rounded px-1 border-none outline-none"
            style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-muted)' }}>
            {soundTypes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={onPlay}
            className="w-7 h-7 rounded text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: isPlaying ? '#F44336' : '#6C63FF', color: 'white', cursor: 'pointer', border: 'none' }}>
            {isPlaying ? '■' : '▶'}
          </button>
          <button onClick={onVolDown}
            className="w-6 h-7 rounded text-xs flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
            -
          </button>
          <button onClick={onVolUp}
            className="w-6 h-7 rounded text-xs flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>
            +
          </button>
        </div>
      </div>
    </div>
  )
}
