import { useState, useRef, useEffect, useCallback } from 'react'

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#6C63FF')
  const [brushSize, setBrushSize] = useState(3)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('focusdash_whiteboard')
    if (saved) {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
      }
      img.src = saved
    }
  }, [])

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const draw = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = color; ctx.lineWidth = brushSize; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke()
  }, [color, brushSize])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true); const pos = getPos(e); lastPoint.current = pos
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2); ctx.fill() }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !lastPoint.current) return
    const pos = getPos(e); draw(lastPoint.current, pos); lastPoint.current = pos
  }

  const handleMouseUp = () => { setDrawing(false); lastPoint.current = null }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#1e1e1e'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    localStorage.removeItem('focusdash_whiteboard')
  }

  const saveCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const data = canvas.toDataURL()
    localStorage.setItem('focusdash_whiteboard', data)
    const link = document.createElement('a'); link.download = 'whiteboard.png'; link.href = data; link.click()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#1e1e1e'; ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const btnStyle = { backgroundColor: 'var(--bg-surface-light)', color: 'var(--text-primary)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }

  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 'bold', marginRight: 16 }}>Whiteboard</div>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none" />
        <label style={{ color: 'var(--text-muted)', fontSize: 13 }}>Size:</label>
        <input type="range" min={1} max={20} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-24 cursor-pointer accent-[#6C63FF]" />
        <button onClick={clearCanvas} style={btnStyle}>Clear</button>
        <button onClick={saveCanvas} style={btnStyle}>Save</button>
      </div>
      <div className="flex-1 rounded-xl overflow-hidden" style={{ border: '1px solid var(--bg-surface-light)', backgroundColor: '#1e1e1e' }}>
        <canvas ref={canvasRef} width={900} height={500}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
      </div>
    </div>
  )
}
