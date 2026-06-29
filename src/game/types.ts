export type Rarity = 'common' | 'rare' | 'epic'
export type BuffCategory = 'attack' | 'defense' | 'element' | 'economy' | 'synergy'
export type Screen = 'home' | 'buff-select' | 'battle' | 'result' | 'upgrade'

export interface BuffEffect {
  atkMult?: number
  atkFlat?: number
  hpMult?: number
  hpFlat?: number
  defFlat?: number
  critChance?: number
  critMult?: number
  lifesteal?: number
  doubleHitChance?: number
  burnDps?: number
  poisonDps?: number
  freezeChance?: number
  goldMult?: number
  shieldPerRoom?: number
}

export interface Buff {
  id: string
  name: string
  description: string
  icon: string
  rarity: Rarity
  category: BuffCategory
  effect: BuffEffect
  requiresBuffId?: string
}

export interface ActiveBuff extends Buff {
  stacks: number
}

export interface Enemy {
  id: string
  name: string
  icon: string
  hp: number
  atk: number
  gold: number
  isBoss?: boolean
  isElite?: boolean
}

export interface Room {
  index: number
  enemy: Enemy
  isBoss: boolean
}

export interface Upgrade {
  id: string
  name: string
  description: string
  icon: string
  maxLevel: number
  baseCost: number
  costGrowth: number
  effectPerLevel: number
}

export interface PlayerMeta {
  gold: number
  totalRuns: number
  bestRoom: number
  upgrades: Record<string, number>
  lastDailyClaim: string | null
  dailyStreak: number
}

export interface CombatStats {
  atk: number
  maxHp: number
  hp: number
  def: number
  critChance: number
  critMult: number
  lifesteal: number
  doubleHitChance: number
  burnDps: number
  poisonDps: number
  freezeChance: number
  goldMult: number
  shield: number
}

export interface CombatTickResult {
  playerDamage: number
  enemyDamage: number
  playerCrit: boolean
  enemyHit: boolean
  doubleHit: boolean
  frozen: boolean
  playerHeal: number
  burnDamage: number
  poisonDamage: number
  shieldAbsorbed: number
  playerHp: number
  enemyHp: number
  log: string[]
}

export interface RunState {
  roomIndex: number
  rooms: Room[]
  buffs: ActiveBuff[]
  stats: CombatStats
  enemyHp: number
  goldEarned: number
  burnRemaining: number
  poisonRemaining: number
  freezeSkip: boolean
}

export interface BattleEvent {
  id: number
  text: string
  type: 'player' | 'enemy' | 'buff' | 'system'
}

export interface RunResult {
  won: boolean
  roomsCleared: number
  goldEarned: number
  buffsCollected: Buff[]
}
