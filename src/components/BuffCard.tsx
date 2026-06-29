import type { Rarity } from '../game/types'

const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Thường',
  rare: 'Hiếm',
  epic: 'Sử thi',
}

interface BuffCardProps {
  icon: string
  name: string
  description: string
  rarity: Rarity
  disabled?: boolean
  onClick?: () => void
}

export function BuffCard({
  icon,
  name,
  description,
  rarity,
  disabled,
  onClick,
}: BuffCardProps) {
  return (
    <button
      type="button"
      className={`buff-card rarity-${rarity}`}
      disabled={disabled}
      onClick={onClick}
    >
      <div className="buff-card-icon">{icon}</div>
      <div className="buff-card-body">
        <span className={`buff-rarity rarity-${rarity}`}>{RARITY_LABEL[rarity]}</span>
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
    </button>
  )
}
