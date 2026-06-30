import { useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '../lib/types'
import { DEFAULT_SETTINGS } from '../lib/types'
import { loadSettings, saveSettings } from '../lib/storage'

interface Props {
  onThemeChange: (theme: string) => void
  onFontSizeChange: (size: number) => void
  onTimerDurationChange: (work: number, break_: number, deep: number) => void
  onVolumeChange: (vol: number) => void
}

export default function SettingsPage({ onThemeChange, onFontSizeChange, onTimerDurationChange, onVolumeChange }: Props) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [tab, setTab] = useState(0)

  useEffect(() => { setSettings(loadSettings()) }, [])

  const save = useCallback((updates: Partial<AppSettings>) => {
    const s = { ...loadSettings(), ...updates }; saveSettings(s); setSettings(s)
  }, [])

  const inputStyle: React.CSSProperties = { backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 14 }

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 'bold' }}>Settings</div>
        <div className="flex">
          {['Timer', 'Audio', 'Theme', 'General'].map((l, i) => (
            <button key={l} onClick={() => setTab(i)}
              className="text-sm cursor-pointer border-none"
              style={{
                backgroundColor: tab === i ? 'var(--bg-surface)' : 'var(--bg-surface-light)',
                color: tab === i ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '10px 24px', borderRadius: '8px 8px 0 0', marginRight: 4,
              }}>{l}</button>
          ))}
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-surface)' }}>
          {tab === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <div style={{ color: '#ccc', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Pomodoro Timer</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ color: '#aaa', fontSize: 13 }}>Work Duration (min):</label>
                    <input type="number" min={1} max={120} value={settings.pomodoroWork}
                      onChange={e => { const v = Number(e.target.value); save({ pomodoroWork: v }); onTimerDurationChange(v, settings.pomodoroBreak, settings.deepWorkDuration) }}
                      style={{ ...inputStyle, width: '100%', marginTop: 4 }} />
                  </div>
                  <div>
                    <label style={{ color: '#aaa', fontSize: 13 }}>Break Duration (min):</label>
                    <input type="number" min={1} max={60} value={settings.pomodoroBreak}
                      onChange={e => { const v = Number(e.target.value); save({ pomodoroBreak: v }); onTimerDurationChange(settings.pomodoroWork, v, settings.deepWorkDuration) }}
                      style={{ ...inputStyle, width: '100%', marginTop: 4 }} />
                  </div>
                </div>
              </div>
              <div>
                <div style={{ color: '#ccc', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Deep Work Timer</div>
                <label style={{ color: '#aaa', fontSize: 13 }}>Duration (min):</label>
                <input type="number" min={10} max={480} value={settings.deepWorkDuration}
                  onChange={e => { const v = Number(e.target.value); save({ deepWorkDuration: v }); onTimerDurationChange(settings.pomodoroWork, settings.pomodoroBreak, v) }}
                  style={{ ...inputStyle, width: '100%', marginTop: 4 }} />
              </div>
            </div>
          )}
          {tab === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ color: '#aaa', fontSize: 13 }}>Default Sound:</label>
                <select value={settings.defaultSound} onChange={e => save({ defaultSound: e.target.value as any })}
                  style={{ ...inputStyle, width: '100%', marginTop: 4 }}>
                  {(['White Noise', 'Pink Noise', 'Brown Noise', 'Rain', 'Forest', 'Ocean'] as const).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: 13 }}>Volume:</label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="range" min={0} max={100} value={Math.round(settings.audioVolume * 100)}
                    onChange={e => { const v = Number(e.target.value) / 100; save({ audioVolume: v }); onVolumeChange(v) }}
                    className="flex-1 accent-[#6C63FF] cursor-pointer" />
                  <span style={{ color: '#aaa', fontSize: 13 }}>{Math.round(settings.audioVolume * 100)}%</span>
                </div>
              </div>
            </div>
          )}
          {tab === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ color: '#aaa', fontSize: 13 }}>Color Theme:</label>
                <select value={settings.theme} onChange={e => { save({ theme: e.target.value as any }); onThemeChange(e.target.value) }}
                  style={{ ...inputStyle, width: '100%', marginTop: 4 }}>
                  {['Dark (Default)', 'Light', 'Midnight Blue', 'Forest Green'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: 13 }}>Font Size:</label>
                <input type="number" min={10} max={24} value={settings.fontSize}
                  onChange={e => { const v = Number(e.target.value); save({ fontSize: v }); onFontSizeChange(v) }}
                  style={{ ...inputStyle, width: '100%', marginTop: 4 }} />
              </div>
            </div>
          )}
          {tab === 3 && (
            <div className="flex flex-col gap-3">
              <div>
                <label style={{ color: '#aaa', fontSize: 13 }}>Data storage location:</label>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '4px 0' }}>Browser localStorage</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
