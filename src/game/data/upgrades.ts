import type { Upgrade } from '../types'

export const UPGRADES: Upgrade[] = [
  {
    id: 'base_atk',
    name: 'Sức Mạnh',
    description: '+5% tấn công cơ bản',
    icon: '💪',
    maxLevel: 20,
    baseCost: 50,
    costGrowth: 1.35,
    effectPerLevel: 0.05,
  },
  {
    id: 'base_hp',
    name: 'Thể Lực',
    description: '+8% máu cơ bản',
    icon: '❤️',
    maxLevel: 20,
    baseCost: 50,
    costGrowth: 1.35,
    effectPerLevel: 0.08,
  },
  {
    id: 'start_gold',
    name: 'Túi Vàng',
    description: '+10 vàng mỗi run',
    icon: '👝',
    maxLevel: 10,
    baseCost: 80,
    costGrowth: 1.4,
    effectPerLevel: 10,
  },
  {
    id: 'gold_bonus',
    name: 'Thương Nhân',
    description: '+5% vàng nhận được',
    icon: '🏪',
    maxLevel: 15,
    baseCost: 100,
    costGrowth: 1.45,
    effectPerLevel: 0.05,
  },
]

export function getUpgradeCost(upgrade: Upgrade, currentLevel: number): number {
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costGrowth, currentLevel))
}
