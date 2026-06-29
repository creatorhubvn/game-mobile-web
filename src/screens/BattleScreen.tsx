import { HealthBar } from '../components/HealthBar'
import { useGame } from '../game/GameProvider'

export function BattleScreen() {
  const { state } = useGame()
  const { run, battleEvents } = state
  if (!run) return null

  const room = run.rooms[run.roomIndex]
  if (!room) return null

  return (
    <div className="screen battle-screen">
      <header className="screen-header compact">
        <div>
          <p className="eyebrow">
            Phòng {run.roomIndex + 1}/{run.rooms.length}
            {room.isBoss ? ' · BOSS' : ''}
          </p>
          <h2>Đang Chiến Đấu</h2>
        </div>
        <div className="run-gold">💰 {run.goldEarned}</div>
      </header>

      <section className="battle-arena">
        <div className="fighter player-fighter">
          <div className="fighter-sprite">🧙</div>
          <HealthBar
            current={run.stats.hp}
            max={run.stats.maxHp}
            label="Bạn"
            variant="player"
          />
          <div className="fighter-stats">
            <span>⚔️ {run.stats.atk}</span>
            <span>🛡️ {run.stats.def}</span>
            {run.stats.shield > 0 && <span>🔮 {run.stats.shield}</span>}
          </div>
        </div>

        <div className="vs-badge">VS</div>

        <div className="fighter enemy-fighter">
          <div className={`fighter-sprite ${room.isBoss ? 'boss' : ''}`}>
            {room.enemy.icon}
          </div>
          <HealthBar
            current={run.enemyHp}
            max={room.enemy.hp}
            label={room.enemy.name}
            variant="enemy"
          />
          <div className="fighter-stats">
            <span>⚔️ {room.enemy.atk}</span>
          </div>
        </div>
      </section>

      <section className="battle-log">
        <h3>Nhật ký</h3>
        <ul>
          {battleEvents.map((event) => (
            <li key={event.id} className={`log-${event.type}`}>
              {event.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
