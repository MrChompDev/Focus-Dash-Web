import { useState } from 'react'

interface Btn { text: string; row: number; col: number; colspan: number; type: 'number' | 'op' | 'fn' | 'eq' }

const BUTTONS: Btn[] = [
  { text: 'C', row: 0, col: 0, colspan: 1, type: 'fn' },
  { text: '±', row: 0, col: 1, colspan: 1, type: 'fn' },
  { text: '%', row: 0, col: 2, colspan: 1, type: 'fn' },
  { text: '/', row: 0, col: 3, colspan: 1, type: 'op' },
  { text: '7', row: 1, col: 0, colspan: 1, type: 'number' },
  { text: '8', row: 1, col: 1, colspan: 1, type: 'number' },
  { text: '9', row: 1, col: 2, colspan: 1, type: 'number' },
  { text: '*', row: 1, col: 3, colspan: 1, type: 'op' },
  { text: '4', row: 2, col: 0, colspan: 1, type: 'number' },
  { text: '5', row: 2, col: 1, colspan: 1, type: 'number' },
  { text: '6', row: 2, col: 2, colspan: 1, type: 'number' },
  { text: '-', row: 2, col: 3, colspan: 1, type: 'op' },
  { text: '1', row: 3, col: 0, colspan: 1, type: 'number' },
  { text: '2', row: 3, col: 1, colspan: 1, type: 'number' },
  { text: '3', row: 3, col: 2, colspan: 1, type: 'number' },
  { text: '+', row: 3, col: 3, colspan: 1, type: 'op' },
  { text: '0', row: 4, col: 0, colspan: 2, type: 'number' },
  { text: '.', row: 4, col: 2, colspan: 1, type: 'number' },
  { text: '=', row: 4, col: 3, colspan: 1, type: 'eq' },
]

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [history, setHistory] = useState('')

  const handleClick = (text: string, type: Btn['type']) => {
    if (type === 'fn') {
      if (text === 'C') { setDisplay('0'); setExpression(''); setHistory('') }
      else if (text === '±') { setExpression(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev) }
      else if (text === '%') { setExpression(prev => prev + '/100') }
      return
    }
    if (type === 'eq') {
      try {
        const result = Function('"use strict"; return (' + expression + ')')()
        setHistory(expression + ' ='); setExpression(String(result)); setDisplay(String(result))
      } catch { setDisplay('Error'); setExpression('') }
      return
    }
    const mapped = text === '/' ? '/' : text === '*' ? '*' : text === '-' ? '-' : text === '+' ? '+' : text
    setExpression(prev => prev + mapped)
    setDisplay(prev => prev === '0' && text !== '.' ? text : prev + text)
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-sm mx-auto flex flex-col gap-3">
        <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 'bold' }}>Calculator</div>
        <div className="h-[70px] rounded-xl px-4 flex items-center justify-end text-[28px] font-bold"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{display}</div>
        <div style={{ color: '#666', fontSize: 12, textAlign: 'right', minHeight: 18 }}>{history}</div>
        <div className="grid grid-cols-4 gap-2">
          {BUTTONS.map(b => (
            <button key={`${b.text}-${b.row}-${b.col}`} onClick={() => handleClick(b.text, b.type)}
              className="h-14 rounded-xl text-lg font-bold cursor-pointer border-none hover:opacity-90"
              style={{
                gridColumn: `span ${b.colspan}`,
                backgroundColor: b.type === 'eq' ? '#6C63FF' : b.type === 'fn' ? '#3d3d3d' : 'var(--bg-surface-light)',
                color: b.type === 'op' ? '#6C63FF' : '#ffffff', fontSize: b.type === 'op' ? 22 : 18,
              }}>
              {b.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
