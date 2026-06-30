interface Props {
  time: string
  progress: number
  mode: string
  size?: number
}

export default function CircularTimer({ time, progress, mode, size = 200 }: Props) {
  const sw = 8
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(progress, 1))
  const gid = 'timer-grad'

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6C63FF" />
          <stop offset="100%" stopColor="#E040FB" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2d2d2d" strokeWidth={sw} />
      {progress > 0 && (
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`}
          strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300"
        />
      )}
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill="var(--text-primary)" fontSize="36" fontWeight="bold"
        fontFamily="Segoe UI, system-ui, sans-serif"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {time}
      </text>
      <text x="50%" y="68%" textAnchor="middle" dominantBaseline="central"
        fill="var(--text-muted)" fontSize="11"
        fontFamily="Segoe UI, system-ui, sans-serif"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {mode}
      </text>
    </svg>
  )
}
