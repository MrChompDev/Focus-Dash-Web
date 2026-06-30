import { useState, useEffect, useCallback } from 'react'
import type { AppEntry } from '../lib/types'
import { loadApps, addApp, removeApp, toggleBlocked, loadLockMode, saveLockMode, loadLockOnTimer, saveLockOnTimer } from '../lib/storage'

interface Props { isLocked: boolean; onToggleLock: () => void }

export default function LockPage({ isLocked, onToggleLock }: Props) {
  const [apps, setApps] = useState<AppEntry[]>([])
  const [blockedInput, setBlockedInput] = useState('')
  const [allowedInput, setAllowedInput] = useState('')
  const [lockMode, setLockModeState] = useState(loadLockMode)
  const [autoLock, setAutoLock] = useState(loadLockOnTimer)
  const [tab, setTab] = useState(0)
  const refresh = useCallback(() => { setApps(loadApps()) }, [])
  useEffect(() => { refresh() }, [refresh])

  const handleAddBlocked = () => { if (!blockedInput.trim()) return; addApp(blockedInput.trim(), false); setBlockedInput(''); refresh() }
  const handleAddAllowed = () => { if (!allowedInput.trim()) return; addApp(allowedInput.trim(), true); setAllowedInput(''); refresh() }
  const handleRemove = (id: string) => { removeApp(id); refresh() }
  const handleToggle = (id: string) => { toggleBlocked(id); refresh() }

  const blockedApps = apps.filter(a => !a.isAllowed)
  const allowedApps = apps.filter(a => a.isAllowed)

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 700 }}>Focus Lock</div>
        <div className="rounded-xl p-6 flex items-center gap-6" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ color: isLocked ? '#4CAF50' : 'var(--text-muted)', fontSize: 18, fontWeight: 600, textAlign: 'center', flex: 1 }}>
            {isLocked ? 'Locked - Focus Active' : 'Unlocked'}
          </div>
          <div className="flex flex-col items-center gap-2.5 flex-[2]">
            <button onClick={onToggleLock}
              className="h-11 px-8 rounded-xl text-sm font-bold cursor-pointer border-none"
              style={{ backgroundColor: isLocked ? '#F44336' : '#6C63FF', color: 'white' }}>
              {isLocked ? 'Stop Lock' : 'Start Lock'}
            </button>
            <div className="flex items-center gap-3 text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Mode:</span>
              <select value={lockMode} onChange={e => { setLockModeState(e.target.value); saveLockMode(e.target.value) }}
                className="rounded px-2 py-1 text-xs border-none outline-none cursor-pointer"
                style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)' }}>
                <option value="blocklist">Blocklist</option>
                <option value="allowlist">Allowlist</option>
              </select>
              <label style={{ color: '#ccc', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="checkbox" checked={autoLock} onChange={e => { setAutoLock(e.target.checked); saveLockOnTimer(e.target.checked) }}
                  className="accent-[#6C63FF] cursor-pointer" />
                Auto-lock with timer
              </label>
            </div>
          </div>
        </div>
        <div className="flex">
          {['Blocked Apps', 'Allowed Apps'].map((l, i) => (
            <button key={l} onClick={() => setTab(i)}
              className="text-sm cursor-pointer border-none"
              style={{
                backgroundColor: tab === i ? 'var(--bg-surface)' : 'var(--bg-surface-light)',
                color: tab === i ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '8px 20px', borderRadius: '8px 8px 0 0', marginRight: 4,
              }}>{l}</button>
          ))}
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
          {tab === 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input value={blockedInput} onChange={e => setBlockedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddBlocked()}
                  placeholder="App name (e.g. chrome, discord)..."
                  className="flex-1 h-10 rounded-lg px-3.5 text-sm border-none outline-none"
                  style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)' }} />
                <button onClick={handleAddBlocked}
                  className="h-10 px-5 rounded-lg text-sm font-bold cursor-pointer border-none"
                  style={{ backgroundColor: '#F44336', color: 'white' }}>Block</button>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>Tip: Block apps like chrome.exe, discord.exe, spotify.exe</div>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {blockedApps.length === 0 ? (
                  <div style={{ color: '#666', padding: 16, fontSize: 13 }}>No blocked apps. Add some above.</div>
                ) : (
                  blockedApps.map(a => (
                    <div key={a.id} className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--bg-surface-light)' }}>
                      <span className="flex-1" style={{ color: 'var(--text-primary)', fontSize: 13 }}>{a.appName}</span>
                      <button onClick={() => handleToggle(a.id)}
                        className="h-[26px] px-2.5 rounded text-xs font-medium cursor-pointer border-none"
                        style={{ backgroundColor: a.blocked ? '#4CAF50' : 'var(--bg-surface-light)', color: a.blocked ? 'white' : 'var(--text-muted)' }}>
                        {a.blocked ? 'Active' : 'Inactive'}
                      </button>
                      <button onClick={() => handleRemove(a.id)}
                        className="w-[26px] h-[26px] rounded-full text-xs cursor-pointer border-none hover:bg-[#F44336] hover:text-white"
                        style={{ backgroundColor: 'transparent', color: '#666' }}>✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input value={allowedInput} onChange={e => setAllowedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddAllowed()}
                  placeholder="App to allow (e.g. code, chrome)..."
                  className="flex-1 h-10 rounded-lg px-3.5 text-sm border-none outline-none"
                  style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)' }} />
                <button onClick={handleAddAllowed}
                  className="h-10 px-5 rounded-lg text-sm font-bold cursor-pointer border-none"
                  style={{ backgroundColor: '#4CAF50', color: 'white' }}>Allow</button>
              </div>
              <div style={{ color: '#FFC107', fontSize: 11, fontWeight: 600 }}>In Allowlist mode, ONLY these apps can run. Everything else is blocked.</div>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {allowedApps.length === 0 ? (
                  <div style={{ color: '#666', padding: 16, fontSize: 13 }}>No allowed apps.</div>
                ) : (
                  allowedApps.map(a => (
                    <div key={a.id} className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--bg-surface-light)' }}>
                      <span className="flex-1" style={{ color: 'var(--text-primary)', fontSize: 13 }}>{a.appName}</span>
                      <button onClick={() => handleRemove(a.id)}
                        className="w-[26px] h-[26px] rounded-full text-xs cursor-pointer border-none hover:bg-[#F44336] hover:text-white"
                        style={{ backgroundColor: 'transparent', color: '#666' }}>✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
