import { GoldBadge } from '../components/GoldBadge'
import { getUpgradeCost, UPGRADES } from '../game/data/upgrades'
import { useGame } from '../game/GameProvider'

export function UpgradeScreen() {
  const { state, buyUpgrade, goHome } = useGame()
  const { meta } = state

  return (
    <div className="screen upgrade-screen">
      <header className="screen-header compact">
        <div>
          <p className="eyebrow">Meta Progress</p>
          <h2>Nâng Cấp</h2>
        </div>
        <GoldBadge amount={meta.gold} />
      </header>

      <div className="upgrade-list">
        {UPGRADES.map((upgrade) => {
          const level = meta.upgrades[upgrade.id] ?? 0
          const maxed = level >= upgrade.maxLevel
          const cost = getUpgradeCost(upgrade, level)
          const canBuy = !maxed && meta.gold >= cost

          return (
            <div key={upgrade.id} className="upgrade-card">
              <div className="upgrade-icon">{upgrade.icon}</div>
              <div className="upgrade-body">
                <div className="upgrade-title">
                  <h3>{upgrade.name}</h3>
                  <span>
                    Lv {level}/{upgrade.maxLevel}
                  </span>
                </div>
                <p>{upgrade.description}</p>
              </div>
              <button
                type="button"
                className="btn btn-buy"
                disabled={!canBuy}
                onClick={() => buyUpgrade(upgrade.id)}
              >
                {maxed ? 'MAX' : `💰 ${cost}`}
              </button>
            </div>
          )
        })}
      </div>

      <button type="button" className="btn btn-secondary" onClick={goHome}>
        ← Về Nhà
      </button>
    </div>
  )
}
