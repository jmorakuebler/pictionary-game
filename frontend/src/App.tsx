import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { GamePage } from './components/GamePage'
import { StartPage } from './components/StartPage'
import type { Team, GameSettings } from './components/types'

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [settings, setSettings] = useState<GameSettings>({
    turnTime: 60,
    minPlayers: 4,
    pointsToWin: 10,
  })

  const handleStartGame = (initialTeams: Team[], settings: GameSettings) => {
    setTeams(initialTeams)
    setSettings(settings)
    setGameStarted(true)
  }

  const handleGameEnd = () => {
    setGameStarted(false)
    setTeams([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      {gameStarted ? (
        <GamePage
          teams={teams}
          settings={settings}
          onGameEnd={handleGameEnd}
        />
      ) : (
        <StartPage onStartGame={handleStartGame} />
      )}
    </div>
  )
}

export default App
