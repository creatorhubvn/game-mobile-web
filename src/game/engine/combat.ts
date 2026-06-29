import { BUFFS } from '../data/buffs'
import { UPGRADES } from '../data/upgrades'
import { roll } from './rng'
import type {
  ActiveBuff,
  Buff,
  CombatStats,
  CombatTickResult,
  Enemy,
  PlayerMeta,
  RunState,
} from '../types'

const BASE_ATK = 20
const BASE_HP = 100
const BASE_DEF = 4
const BASE_CRIT = 0.05
const BASE_CRIT_MULT = 1.5

export function getMetaAtkBonus(meta: PlayerMeta): number {
  const level = meta.upgrades.base_atk ?? 0
  const upgrade = UPGRADES.find((u) => u.id === 'base_atk')!
  return level * upgrade.effectPerLevel
}

export function getMetaHpBonus(meta: PlayerMeta): number {
  const level = meta.upgrades.base_hp ?? 0
  const upgrade = UPGRADES.find((u) => u.id === 'base_hp')!
  return level * upgrade.effectPerLevel
}

export function getMetaGoldBonus(meta: PlayerMeta): number {
  const level = meta.upgrades.gold_bonus ?? 0
  const upgrade = UPGRADES.find((u) => u.id === 'gold_bonus')!
  return level * upgrade.effectPerLevel
}

export function getStartGoldBonus(meta: PlayerMeta): number {
  const level = meta.upgrades.start_gold ?? 0
  const upgrade = UPGRADES.find((u) => u.id === 'start_gold')!
  return level * upgrade.effectPerLevel
}

export function computeStats(
  buffs: ActiveBuff[],
  meta: PlayerMeta,
  currentHp?: number,
): CombatStats {
  const atkBonus = getMetaAtkBonus(meta)
  const hpBonus = getMetaHpBonus(meta)
  const goldBonus = getMetaGoldBonus(meta)

  let atk = BASE_ATK * (1 + atkBonus)
  let maxHp = BASE_HP * (1 + hpBonus)
  let def = BASE_DEF
  let critChance = BASE_CRIT
  let critMult = BASE_CRIT_MULT
  let lifesteal = 0
  let doubleHitChance = 0
  let burnDps = 0
  let poisonDps = 0
  let freezeChance = 0
  let goldMult = 1 + goldBonus
  let shield = 0

  for (const buff of buffs) {
    const ownedIds = new Set(buffs.map((b) => b.id))
    if (buff.requiresBuffId && !ownedIds.has(buff.requiresBuffId)) continue

    const stacks = buff.stacks
    const e = buff.effect
    if (e.atkMult) atk *= 1 + e.atkMult * stacks
    if (e.atkFlat) atk += e.atkFlat * stacks
    if (e.hpMult) maxHp *= 1 + e.hpMult * stacks
    if (e.hpFlat) maxHp += e.hpFlat * stacks
    if (e.defFlat) def += e.defFlat * stacks
    if (e.critChance) critChance += e.critChance * stacks
    if (e.critMult) critMult += e.critMult * stacks
    if (e.lifesteal) lifesteal += e.lifesteal * stacks
    if (e.doubleHitChance) doubleHitChance += e.doubleHitChance * stacks
    if (e.burnDps) burnDps += e.burnDps * stacks
    if (e.poisonDps) poisonDps += e.poisonDps * stacks
    if (e.freezeChance) freezeChance += e.freezeChance * stacks
    if (e.goldMult) goldMult += e.goldMult * stacks
    if (e.shieldPerRoom) shield += e.shieldPerRoom * stacks
  }

  const roundedMaxHp = Math.max(1, Math.round(maxHp))
  const hp =
    currentHp === undefined
      ? roundedMaxHp
      : Math.max(1, Math.min(roundedMaxHp, Math.round(currentHp)))

  return {
    atk: Math.max(1, Math.round(atk)),
    maxHp: roundedMaxHp,
    hp,
    def,
    critChance: Math.min(0.75, critChance),
    critMult,
    lifesteal: Math.min(0.5, lifesteal),
    doubleHitChance: Math.min(0.6, doubleHitChance),
    burnDps,
    poisonDps,
    freezeChance: Math.min(0.5, freezeChance),
    goldMult,
    shield,
  }
}

export function createInitialRunState(meta: PlayerMeta, rooms: RunState['rooms']): RunState {
  const stats = computeStats([], meta)
  return {
    roomIndex: 0,
    rooms,
    buffs: [],
    stats,
    enemyHp: rooms[0].enemy.hp,
    goldEarned: getStartGoldBonus(meta),
    burnRemaining: 0,
    poisonRemaining: 0,
    freezeSkip: false,
  }
}

export function applyBuffToRun(run: RunState, buff: Buff, meta: PlayerMeta): RunState {
  const existing = run.buffs.find((b) => b.id === buff.id)
  const buffs = existing
    ? run.buffs.map((b) =>
        b.id === buff.id ? { ...b, stacks: Math.min(3, b.stacks + 1) } : b,
      )
    : [...run.buffs, { ...buff, stacks: 1 }]

  const prevMaxHp = run.stats.maxHp
  const stats = computeStats(buffs, meta, run.stats.hp)
  const hpGain = stats.maxHp - prevMaxHp

  return {
    ...run,
    buffs,
    stats: {
      ...stats,
      hp: Math.min(stats.maxHp, run.stats.hp + Math.max(0, hpGain)),
    },
  }
}

export function startRoom(run: RunState): RunState {
  const room = run.rooms[run.roomIndex]
  const shieldBonus = run.buffs.reduce(
    (sum, b) => sum + (b.effect.shieldPerRoom ?? 0) * b.stacks,
    0,
  )

  return {
    ...run,
    enemyHp: room.enemy.hp,
    stats: {
      ...run.stats,
      shield: shieldBonus,
    },
    burnRemaining: run.stats.burnDps > 0 ? 3 : 0,
    poisonRemaining: run.stats.poisonDps > 0 ? 3 : 0,
    freezeSkip: false,
  }
}

export function combatTick(
  stats: CombatStats,
  enemy: Enemy,
  enemyHp: number,
  burnRemaining: number,
  poisonRemaining: number,
): CombatTickResult {
  const log: string[] = []
  let playerHp = stats.hp
  let currentEnemyHp = enemyHp
  let frozen = false

  let burnDamage = 0
  if (burnRemaining > 0 && stats.burnDps > 0) {
    burnDamage = stats.burnDps
    currentEnemyHp -= burnDamage
    log.push(`Thiêu đốt gây ${burnDamage} sát thương`)
  }

  let poisonDamage = 0
  if (poisonRemaining > 0 && stats.poisonDps > 0) {
    poisonDamage = stats.poisonDps
    currentEnemyHp -= poisonDamage
    log.push(`Độc gây ${poisonDamage} sát thương`)
  }

  let playerDamage = stats.atk
  let playerCrit = roll(stats.critChance)
  if (playerCrit) {
    playerDamage = Math.round(playerDamage * stats.critMult)
    log.push(`Chí mạng! ${playerDamage} sát thương`)
  } else {
    log.push(`Bạn gây ${playerDamage} sát thương`)
  }

  const doubleHit = roll(stats.doubleHitChance)
  if (doubleHit) {
    const extra = playerCrit ? Math.round(stats.atk * stats.critMult) : stats.atk
    playerDamage += extra
    log.push(`Liên kích +${extra}!`)
  }

  currentEnemyHp -= playerDamage

  let playerHeal = 0
  if (stats.lifesteal > 0) {
    playerHeal = Math.round(playerDamage * stats.lifesteal)
    playerHp = Math.min(stats.maxHp, playerHp + playerHeal)
    if (playerHeal > 0) log.push(`Hồi ${playerHeal} HP`)
  }

  let enemyDamage = 0
  let enemyHit = true
  let shieldAbsorbed = 0

  if (roll(stats.freezeChance)) {
    frozen = true
    enemyHit = false
    log.push('Đóng băng! Địch bỏ lượt')
  } else {
    enemyDamage = Math.max(1, enemy.atk - stats.def)
    shieldAbsorbed = Math.min(stats.shield, enemyDamage)
    if (shieldAbsorbed > 0) {
      log.push(`Khiên hấp thụ ${shieldAbsorbed} sát thương`)
      enemyDamage -= shieldAbsorbed
    }
    playerHp -= enemyDamage
    log.push(`${enemy.name} gây ${enemyDamage} sát thương`)
  }

  return {
    playerDamage,
    enemyDamage,
    playerCrit,
    enemyHit,
    doubleHit,
    frozen,
    playerHeal,
    burnDamage,
    poisonDamage,
    shieldAbsorbed,
    playerHp: Math.max(0, playerHp),
    enemyHp: Math.max(0, currentEnemyHp),
    log,
  }
}

export function rollBuffChoices(
  currentBuffs: ActiveBuff[],
  count = 3,
): Buff[] {
  const ownedIds = new Set(currentBuffs.map((b) => b.id))
  const eligible = BUFFS.filter((buff) => {
    if (buff.requiresBuffId && !ownedIds.has(buff.requiresBuffId)) {
      return ownedIds.has(buff.requiresBuffId)
    }
    return true
  })

  const weighted: Buff[] = []
  for (const buff of eligible) {
    const weight = buff.rarity === 'epic' ? 1 : buff.rarity === 'rare' ? 2 : 4
    for (let i = 0; i < weight; i++) weighted.push(buff)
  }

  const chosen: Buff[] = []
  const used = new Set<string>()
  while (chosen.length < count && weighted.length > 0) {
    const index = Math.floor(Math.random() * weighted.length)
    const buff = weighted[index]
    if (!used.has(buff.id)) {
      chosen.push(buff)
      used.add(buff.id)
    }
    weighted.splice(index, 1)
  }

  return chosen
}

export function calcRoomGold(enemy: Enemy, goldMult: number): number {
  return Math.round(enemy.gold * goldMult)
}
