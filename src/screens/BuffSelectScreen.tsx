import { BuffCard } from '../components/BuffCard'
import { useGame } from '../game/GameProvider'

export function BuffSelectScreen() {
  const { state, selectBuff } = useGame()
  const { run, buffChoices } = state
  if (!run) return null

  const room = run.rooms[run.roomIndex]
  const isBoss = room?.isBoss

  return (
    <div className="screen buff-screen">
      <header className="screen-header compact">
        <div>
          <p className="eyebrow">
            Phòng {run.roomIndex + 1}/{run.rooms.length}
            {isBoss ? ' · BOSS' : ''}
          </p>
          <h2>Chọn 1 Buff</h2>
        </div>
      </header>

      {room && (
        <div className="next-enemy-preview">
          <span>{room.enemy.icon}</span>
          <div>
            <strong>{room.enemy.name}</strong>
            <p>
              HP {room.enemy.hp} · ATK {room.enemy.atk}
            </p>
          </div>
        </div>
      )}

      <div className="buff-grid">
        {buffChoices.map((buff) => (
          <BuffCard
            key={buff.id}
            icon={buff.icon}
            name={buff.name}
            description={buff.description}
            rarity={buff.rarity}
            onClick={() => selectBuff(buff)}
          />
        ))}
      </div>

      {run.buffs.length > 0 && (
        <section className="active-buffs">
          <h3>Buff đang có ({run.buffs.length})</h3>
          <div className="chip-row">
            {run.buffs.map((buff) => (
              <span key={buff.id} className={`chip rarity-${buff.rarity}`}>
                {buff.icon} {buff.name}
                {buff.stacks > 1 ? ` x${buff.stacks}` : ''}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
