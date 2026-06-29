import { GameProvider, useGame } from './game/GameProvider'
import { BattleScreen } from './screens/BattleScreen'
import { BuffSelectScreen } from './screens/BuffSelectScreen'
import { HomeScreen } from './screens/HomeScreen'
import { ResultScreen } from './screens/ResultScreen'
import { UpgradeScreen } from './screens/UpgradeScreen'

function GameShell() {
  const { state } = useGame()

  switch (state.screen) {
    case 'buff-select':
      return <BuffSelectScreen />
    case 'battle':
      return <BattleScreen />
    case 'result':
      return <ResultScreen />
    case 'upgrade':
      return <UpgradeScreen />
    default:
      return <HomeScreen />
  }
}

function App() {
  return (
    <GameProvider>
      <div className="app-shell">
        <GameShell />
      </div>
    </GameProvider>
  )
}

export default App
