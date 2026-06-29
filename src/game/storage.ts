import type { PlayerMeta } from './types'

const STORAGE_KEY = 'one-tap-dungeon-save'

export const DEFAULT_META: PlayerMeta = {
  gold: 0,
  totalRuns: 0,
  bestRoom: 0,
  upgrades: {},
  lastDailyClaim: null,
  dailyStreak: 0,
}

export function loadMeta(): PlayerMeta {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_META }
    return { ...DEFAULT_META, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_META }
  }
}

export function saveMeta(meta: PlayerMeta): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta))
}

export function getDailyReward(streak: number): number {
  return 25 + Math.min(streak, 7) * 10
}

export function canClaimDaily(meta: PlayerMeta): boolean {
  if (!meta.lastDailyClaim) return true
  const last = new Date(meta.lastDailyClaim)
  const now = new Date()
  return last.toDateString() !== now.toDateString()
}

export function claimDaily(meta: PlayerMeta): PlayerMeta {
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  let streak = 1
  if (meta.lastDailyClaim) {
    const last = new Date(meta.lastDailyClaim)
    if (last.toDateString() === yesterday.toDateString()) {
      streak = Math.min(7, meta.dailyStreak + 1)
    }
  }

  const reward = getDailyReward(streak)
  return {
    ...meta,
    gold: meta.gold + reward,
    lastDailyClaim: now.toISOString(),
    dailyStreak: streak,
  }
}
