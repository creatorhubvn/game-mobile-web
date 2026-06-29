interface GoldBadgeProps {
  amount: number
}

export function GoldBadge({ amount }: GoldBadgeProps) {
  return (
    <div className="gold-badge">
      <span>💰</span>
      <span>{amount.toLocaleString()}</span>
    </div>
  )
}
