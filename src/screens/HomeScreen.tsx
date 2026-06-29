import { useGame } from '../game/GameProvider'
import { getDailyReward } from '../game/storage'
import { GoldBadge } from '../components/GoldBadge'

export function HomeScreen() {
  const { state, startRun, goUpgrade, claimDaily, canClaimDaily } = useGame()
  const { meta } = state
  const dailyReward = getDailyReward(meta.dailyStreak + (canClaimDaily ? 1 : 0))

  return (
    <div className="screen home-screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">One-Tap Dungeon</p>
          <h1>Chọn Buff<br />Đi Ngay</h1>
        </div>
        <GoldBadge amount={meta.gold} />
      </header>

      <section className="hero-panel">
        <div className="hero-sprite">🧙</div>
        <p>Mỗi run 9 phòng · chọn buff · auto combat · build bá đạo</p>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Run đã chơi</span>
          <strong>{meta.totalRuns}</strong>
        </div>
        <div className="stat-card">
          <span>Phòng cao nhất</span>
          <strong>{meta.bestRoom}/9</strong>
        </div>
        <div className="stat-card">
          <span>Streak daily</span>
          <strong>{meta.dailyStreak} ngày</strong>
        </div>
      </section>

      <section className="action-stack">
        <button type="button" className="btn btn-primary btn-large" onClick={startRun}>
          ⚔️ Bắt Đầu Run
        </button>
        <button type="button" className="btn btn-secondary" onClick={goUpgrade}>
          ⬆️ Nâng Cấp
        </button>
        <button
          type="button"
          className="btn btn-daily"
          disabled={!canClaimDaily}
          onClick={claimDaily}
        >
          {canClaimDaily ? `🎁 Nhận ${dailyReward} vàng` : '✅ Đã nhận quà hôm nay'}
        </button>
      </section>
    </div>
  )
}
