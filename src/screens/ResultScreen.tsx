import { useGame } from '../game/GameProvider'

export function ResultScreen() {
  const { state, startRun, goHome } = useGame()
  const { lastResult } = state
  if (!lastResult) return null

  return (
    <div className="screen result-screen">
      <div className={`result-banner ${lastResult.won ? 'win' : 'lose'}`}>
        <div className="result-icon">{lastResult.won ? '🏆' : '💀'}</div>
        <h2>{lastResult.won ? 'Chiến Thắng!' : 'Thua Rồi...'}</h2>
        <p>
          {lastResult.won
            ? 'Bạn đã hạ gục boss và hoàn thành dungeon!'
            : `Bạn dừng ở phòng ${lastResult.roomsCleared}/9`}
        </p>
      </div>

      <section className="result-stats">
        <div className="stat-card">
          <span>Vàng nhận</span>
          <strong>💰 {lastResult.goldEarned}</strong>
        </div>
        <div className="stat-card">
          <span>Buff thu thập</span>
          <strong>{lastResult.buffsCollected.length}</strong>
        </div>
      </section>

      {lastResult.buffsCollected.length > 0 && (
        <section className="active-buffs">
          <h3>Build lần này</h3>
          <div className="chip-row">
            {lastResult.buffsCollected.map((buff) => (
              <span key={buff.id} className={`chip rarity-${buff.rarity}`}>
                {buff.icon} {buff.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="action-stack">
        <button type="button" className="btn btn-primary btn-large" onClick={startRun}>
          🔁 Chơi Lại
        </button>
        <button type="button" className="btn btn-secondary" onClick={goHome}>
          🏠 Về Nhà
        </button>
      </section>
    </div>
  )
}
