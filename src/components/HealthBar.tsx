interface HealthBarProps {
  current: number
  max: number
  label: string
  variant?: 'player' | 'enemy'
}

export function HealthBar({ current, max, label, variant = 'player' }: HealthBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  return (
    <div className={`health-bar ${variant}`}>
      <div className="health-bar-header">
        <span>{label}</span>
        <span>
          {current}/{max}
        </span>
      </div>
      <div className="health-bar-track">
        <div className="health-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
