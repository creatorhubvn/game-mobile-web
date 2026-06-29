import type { Enemy, Room } from '../types'

const ENEMIES: Enemy[] = [
  { id: 'slime', name: 'Slime', icon: '🟢', hp: 60, atk: 8, gold: 12 },
  { id: 'goblin', name: 'Goblin', icon: '👺', hp: 80, atk: 12, gold: 16 },
  { id: 'skeleton', name: 'Xương', icon: '💀', hp: 100, atk: 14, gold: 20 },
  { id: 'bat', name: 'Dơi', icon: '🦇', hp: 70, atk: 16, gold: 18 },
  { id: 'orc', name: 'Orc', icon: '👹', hp: 130, atk: 18, gold: 24 },
  { id: 'elite_knight', name: 'Hiệp Sĩ', icon: '🛡️', hp: 180, atk: 22, gold: 35, isElite: true },
  { id: 'elite_mage', name: 'Pháp Sư', icon: '🧙', hp: 150, atk: 28, gold: 38, isElite: true },
  { id: 'boss_dragon', name: 'Rồng', icon: '🐉', hp: 350, atk: 30, gold: 80, isBoss: true },
  { id: 'boss_demon', name: 'Quỷ Vương', icon: '👿', hp: 420, atk: 35, gold: 100, isBoss: true },
]

function scaleEnemy(enemy: Enemy, roomIndex: number, isBoss: boolean): Enemy {
  const scale = 1 + roomIndex * 0.12 + (isBoss ? 0.3 : 0)
  return {
    ...enemy,
    hp: Math.round(enemy.hp * scale),
    atk: Math.round(enemy.atk * scale),
    gold: Math.round(enemy.gold * (1 + roomIndex * 0.08)),
  }
}

export function createRunRooms(): Room[] {
  const regularPool = ENEMIES.filter((e) => !e.isBoss && !e.isElite)
  const elitePool = ENEMIES.filter((e) => e.isElite)
  const bossPool = ENEMIES.filter((e) => e.isBoss)

  const rooms: Room[] = []

  for (let i = 0; i < 8; i++) {
    const pool = i === 7 ? elitePool : regularPool
    const template = pool[i % pool.length]
    rooms.push({
      index: i,
      enemy: scaleEnemy(template, i, false),
      isBoss: false,
    })
  }

  const bossTemplate = bossPool[Math.floor(Math.random() * bossPool.length)]
  rooms.push({
    index: 8,
    enemy: scaleEnemy(bossTemplate, 8, true),
    isBoss: true,
  })

  return rooms
}
