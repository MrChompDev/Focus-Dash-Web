import { useState, useEffect, useCallback } from 'react'
import type { Note } from '../lib/types'
import { NOTE_COLORS } from '../lib/types'
import { loadNotes, addNote, deleteNote, updateNote, clearAllNotes } from '../lib/storage'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const refresh = useCallback(() => { setNotes(loadNotes()) }, [])
  useEffect(() => { refresh() }, [refresh])

  const handleAdd = () => {
    addNote({ content: '', color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)], posX: 100, posY: 100 })
    refresh()
  }
  const handleDelete = (id: string) => { deleteNote(id); refresh() }
  const handleUpdate = (id: string, content: string, color: string) => { updateNote(id, { content, color }); refresh() }
  const handleColorChange = (id: string, currentColor: string) => {
    const idx = NOTE_COLORS.indexOf(currentColor)
    handleUpdate(id, loadNotes().find(n => n.id === id)?.content || '', NOTE_COLORS[(idx + 1) % NOTE_COLORS.length])
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 'bold' }}>Sticky Notes</div>
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="h-10 px-5 rounded-lg text-sm font-bold cursor-pointer border-none"
              style={{ backgroundColor: '#6C63FF', color: 'white' }}>+ New Note</button>
            <button onClick={() => { clearAllNotes(); refresh() }}
              className="h-10 px-5 rounded-lg text-sm cursor-pointer border-none"
              style={{ backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)' }}>Clear All</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {notes.length === 0 ? (
            <div style={{ color: '#666', fontSize: 14, padding: 40, textAlign: 'center', width: '100%' }}>
              No sticky notes yet. Click &apos;+ New Note&apos; to start!
            </div>
          ) : (
            notes.map(n => (
              <div key={n.id} className="rounded-xl flex flex-col" style={{ backgroundColor: n.color, width: 260, height: 260, padding: '8px 12px 12px' }}>
                <div className="flex items-center justify-between mb-1">
                  <button onClick={() => handleColorChange(n.id, n.color)}
                    className="w-6 h-6 rounded cursor-pointer border-none text-base"
                    style={{ backgroundColor: 'transparent', color: '#333' }} title="Change color">C</button>
                  <button onClick={() => handleDelete(n.id)}
                    className="w-6 h-6 rounded cursor-pointer border-none text-sm hover:text-[#F44336]"
                    style={{ backgroundColor: 'transparent', color: '#666' }}>✕</button>
                </div>
                <textarea defaultValue={n.content} onChange={e => handleUpdate(n.id, e.target.value, n.color)}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
                  style={{ color: '#333' }} placeholder="Write something..." />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
