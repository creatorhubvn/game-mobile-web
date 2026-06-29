import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { createRunRooms } from './data/enemies'
import { getUpgradeCost, UPGRADES } from './data/upgrades'
import {
  applyBuffToRun,
  calcRoomGold,
  combatTick,
  createInitialRunState,
  rollBuffChoices,
  startRoom,
} from './engine/combat'
import { canClaimDaily, claimDaily, loadMeta, saveMeta } from './storage'
import type {
  BattleEvent,
  Buff,
  PlayerMeta,
  RunResult,
  RunState,
  Screen,
} from './types'

interface GameState {
  screen: Screen
  meta: PlayerMeta
  run: RunState | null
  buffChoices: Buff[]
  battleEvents: BattleEvent[]
  lastResult: RunResult | null
  eventCounter: number
}

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'START_RUN' }
  | { type: 'SELECT_BUFF'; buff: Buff }
  | { type: 'TICK_BATTLE' }
  | { type: 'FINISH_RUN' }
  | { type: 'BUY_UPGRADE'; upgradeId: string }
  | { type: 'CLAIM_DAILY' }
  | { type: 'LOAD_META'; meta: PlayerMeta }

function pushEvent(
  state: GameState,
  text: string,
  type: BattleEvent['type'],
): Pick<GameState, 'battleEvents' | 'eventCounter'> {
  const event: BattleEvent = { id: state.eventCounter, text, type }
  return {
    eventCounter: state.eventCounter + 1,
    battleEvents: [event, ...state.battleEvents].slice(0, 8),
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen }

    case 'LOAD_META':
      return { ...state, meta: action.meta }

    case 'CLAIM_DAILY': {
      if (!canClaimDaily(state.meta)) return state
      const meta = claimDaily(state.meta)
      saveMeta(meta)
      return { ...state, meta }
    }

    case 'START_RUN': {
      const rooms = createRunRooms()
      const run = createInitialRunState(state.meta, rooms)
      const buffChoices = rollBuffChoices([])
      return {
        ...state,
        run,
        buffChoices,
        battleEvents: [],
        lastResult: null,
        screen: 'buff-select',
      }
    }

    case 'SELECT_BUFF': {
      if (!state.run) return state
      const withBuff = applyBuffToRun(state.run, action.buff, state.meta)
      const started = startRoom(withBuff)
      return {
        ...state,
        run: started,
        screen: 'battle',
        ...pushEvent(state, `Nhận buff: ${action.buff.name}`, 'buff'),
      }
    }

    case 'TICK_BATTLE': {
      if (!state.run) return state
      const room = state.run.rooms[state.run.roomIndex]
      const tick = combatTick(
        state.run.stats,
        room.enemy,
        state.run.enemyHp,
        state.run.burnRemaining,
        state.run.poisonRemaining,
      )

      let events = state.battleEvents
      let eventCounter = state.eventCounter
      for (const line of tick.log) {
        const type: BattleEvent['type'] = line.includes('Bạn') || line.includes('Chí') || line.includes('Liên') || line.includes('Hồi')
          ? 'player'
          : line.includes('Đóng') || line.includes('Thiêu') || line.includes('Độc')
            ? 'buff'
            : 'enemy'
        const pushed = pushEvent({ ...state, battleEvents: events, eventCounter }, line, type)
        events = pushed.battleEvents
        eventCounter = pushed.eventCounter
      }

      const updatedStats = {
        ...state.run.stats,
        hp: tick.playerHp,
        shield: Math.max(0, state.run.stats.shield - tick.shieldAbsorbed),
      }

      let run: RunState = {
        ...state.run,
        stats: updatedStats,
        enemyHp: tick.enemyHp,
        burnRemaining: Math.max(0, state.run.burnRemaining - 1),
        poisonRemaining: Math.max(0, state.run.poisonRemaining - 1),
      }

      if (tick.enemyHp <= 0) {
        const gold = calcRoomGold(room.enemy, run.stats.goldMult)
        run = {
          ...run,
          goldEarned: run.goldEarned + gold,
          roomIndex: run.roomIndex + 1,
        }

        if (run.roomIndex >= run.rooms.length) {
          const result: RunResult = {
            won: true,
            roomsCleared: run.rooms.length,
            goldEarned: run.goldEarned,
            buffsCollected: run.buffs,
          }
          const meta: PlayerMeta = {
            ...state.meta,
            gold: state.meta.gold + run.goldEarned,
            totalRuns: state.meta.totalRuns + 1,
            bestRoom: Math.max(state.meta.bestRoom, run.rooms.length),
          }
          saveMeta(meta)
          return {
            ...state,
            run,
            meta,
            lastResult: result,
            battleEvents: events,
            eventCounter,
            screen: 'result',
          }
        }

        const buffChoices = rollBuffChoices(run.buffs)
        const roomCleared = pushEvent(
          { ...state, battleEvents: events, eventCounter },
          `+${gold} vàng · Phòng ${run.roomIndex}/${run.rooms.length}`,
          'system',
        )
        return {
          ...state,
          run,
          buffChoices,
          screen: 'buff-select',
          ...roomCleared,
        }
      }

      if (tick.playerHp <= 0) {
        const partialGold = Math.round(run.goldEarned * 0.4)
        const result: RunResult = {
          won: false,
          roomsCleared: run.roomIndex,
          goldEarned: partialGold,
          buffsCollected: run.buffs,
        }
        const meta: PlayerMeta = {
          ...state.meta,
          gold: state.meta.gold + partialGold,
          totalRuns: state.meta.totalRuns + 1,
          bestRoom: Math.max(state.meta.bestRoom, run.roomIndex),
        }
        saveMeta(meta)
        return {
          ...state,
          run,
          meta,
          lastResult: result,
          battleEvents: events,
          eventCounter,
          screen: 'result',
        }
      }

      return { ...state, run, battleEvents: events, eventCounter }
    }

    case 'BUY_UPGRADE': {
      const upgrade = UPGRADES.find((u) => u.id === action.upgradeId)
      if (!upgrade) return state
      const level = state.meta.upgrades[action.upgradeId] ?? 0
      if (level >= upgrade.maxLevel) return state
      const cost = getUpgradeCost(upgrade, level)
      if (state.meta.gold < cost) return state
      const meta: PlayerMeta = {
        ...state.meta,
        gold: state.meta.gold - cost,
        upgrades: { ...state.meta.upgrades, [action.upgradeId]: level + 1 },
      }
      saveMeta(meta)
      return { ...state, meta }
    }

    case 'FINISH_RUN':
      return {
        ...state,
        run: null,
        buffChoices: [],
        battleEvents: [],
        screen: 'home',
      }

    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  startRun: () => void
  selectBuff: (buff: Buff) => void
  goHome: () => void
  goUpgrade: () => void
  buyUpgrade: (upgradeId: string) => void
  claimDaily: () => void
  canClaimDaily: boolean
}

const GameContext = createContext<GameContextValue | null>(null)

const initialState: GameState = {
  screen: 'home',
  meta: loadMeta(),
  run: null,
  buffChoices: [],
  battleEvents: [],
  lastResult: null,
  eventCounter: 0,
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    dispatch({ type: 'LOAD_META', meta: loadMeta() })
  }, [])

  useEffect(() => {
    if (state.screen !== 'battle' || !state.run) return
    const id = window.setInterval(() => dispatch({ type: 'TICK_BATTLE' }), 700)
    return () => window.clearInterval(id)
  }, [state.screen, state.run?.roomIndex])

  const startRun = useCallback(() => dispatch({ type: 'START_RUN' }), [])
  const selectBuff = useCallback((buff: Buff) => dispatch({ type: 'SELECT_BUFF', buff }), [])
  const goHome = useCallback(() => dispatch({ type: 'FINISH_RUN' }), [])
  const goUpgrade = useCallback(() => dispatch({ type: 'SET_SCREEN', screen: 'upgrade' }), [])
  const buyUpgrade = useCallback((upgradeId: string) => dispatch({ type: 'BUY_UPGRADE', upgradeId }), [])
  const claimDailyReward = useCallback(() => dispatch({ type: 'CLAIM_DAILY' }), [])

  const value = useMemo(
    () => ({
      state,
      startRun,
      selectBuff,
      goHome,
      goUpgrade,
      buyUpgrade,
      claimDaily: claimDailyReward,
      canClaimDaily: canClaimDaily(state.meta),
    }),
    [state, startRun, selectBuff, goHome, goUpgrade, buyUpgrade, claimDailyReward],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
