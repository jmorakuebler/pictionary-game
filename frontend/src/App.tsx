import { useState, useRef, useEffect } from 'react'
import { FaEraser, FaTrophy } from 'react-icons/fa'
import { IoSettings } from 'react-icons/io5'
import { toast, Toaster } from 'react-hot-toast'

interface Player {
  id: string
  name: string
  order: number
}

interface Team {
  id: number
  name: string
  color: string
  players: Player[]
  score: number
}

interface GameSettings {
  turnTime: number
  minPlayers: number
  pointsToWin: number
}

function GamePage({ teams: initialTeams, settings, onGameEnd }: { teams: Team[], settings: GameSettings, onGameEnd: () => void }) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [word, setWord] = useState('')
  const [guess, setGuess] = useState('')
  const [showWord, setShowWord] = useState(false)
  const [hasChangedWord, setHasChangedWord] = useState(false)
  const [timeLeft, setTimeLeft] = useState(settings.turnTime)
  const [hasStartedDrawing, setHasStartedDrawing] = useState(false)
  const [showVictoryModal, setShowVictoryModal] = useState(false)
  const [winningTeam, setWinningTeam] = useState<Team | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(5)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)

  const currentTeam = teams[currentTeamIndex]
  const currentPlayer = currentTeam.players[currentPlayerIndex]

  useEffect(() => {
    handleNewWord(false)
  }, [])

  useEffect(() => {
    if (hasStartedDrawing && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleTurnChange()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [hasStartedDrawing, timeLeft])

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [currentTeamIndex, currentPlayerIndex])

  const handleTurnChange = () => {
    // Get current player's order
    const currentTeam = teams[currentTeamIndex]
    const currentPlayer = currentTeam.players[currentPlayerIndex]
    
    // Calculate total number of players
    const totalPlayers = teams[0].players.length + teams[1].players.length
    
    // Calculate next order (cycle back to 0 if at the end)
    const nextOrder = (currentPlayer.order + 1) % totalPlayers
    
    // Find the team and player with the next order
    let nextTeamIndex = 0
    let nextPlayerIndex = 0
    
    // Search through all teams to find the player with the next order
    for (let i = 0; i < teams.length; i++) {
      const playerIndex = teams[i].players.findIndex(p => p.order === nextOrder)
      if (playerIndex !== -1) {
        nextTeamIndex = i
        nextPlayerIndex = playerIndex
        break
      }
    }

    // Update state
    setCurrentTeamIndex(nextTeamIndex)
    setCurrentPlayerIndex(nextPlayerIndex)
    setHasStartedDrawing(false)
    setHasChangedWord(false)
    setShowWord(false)
    setGuess('')
    setTimeLeft(settings.turnTime)
    handleNewWord(false)
  }

  const handleCorrectGuess = () => {
    const updatedTeams = teams.map((team, index) => {
      if (index === currentTeamIndex) {
        return { ...team, score: team.score + 1 }
      }
      return team
    })
    setTeams(updatedTeams)

    // Check for victory
    const winningTeam = updatedTeams.find((team) => team.score >= settings.pointsToWin)
    if (winningTeam) {
      setWinningTeam(winningTeam)
      setShowVictoryModal(true)
    } else {
      handleTurnChange()
    }
  }

  const handleGuess = () => {
    if (guess.toLowerCase() === word.toLowerCase()) {
      toast.success('Correct guess!')
      handleCorrectGuess()
    } else {
      toast.error('Wrong guess!')
    }
    setGuess('')
  }

  const handleNewWord = async (setChanged = true) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/word`)
      const data = await response.json()
      setWord(data.word)
      setShowWord(false)
      if (setChanged) {
        setHasChangedWord(true)
      }
    } catch (error) {
      console.error('Error fetching word:', error)
      toast.error('Failed to get a new word')
    }
  }

  const handleSkip = () => {
    handleTurnChange()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hasStartedDrawing) {
      setHasStartedDrawing(true)
    }
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    setLastX(x)
    setLastY(y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.stroke()

    setLastX(x)
    setLastY(y)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Pictionary Game
        </h1>
        <button
          onClick={onGameEnd}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          End Game
        </button>
      </div>

      {/* Teams Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-8">
          {teams.map((team, index) => (
            <div key={index} className="text-center">
              <h3 className={`text-xl font-bold ${team.color}`}>
                {team.name}
              </h3>
              <p className="text-gray-600">Score: {team.score}</p>
              <div className="mt-2">
                {team.players.map((player, playerIndex) => (
                  <div
                    key={playerIndex}
                    className={`text-sm ${
                      index === currentTeamIndex && playerIndex === currentPlayerIndex
                        ? 'font-bold text-gray-800'
                        : 'text-gray-600'
                    }`}
                  >
                    {player.name}
                    {index === currentTeamIndex && playerIndex === currentPlayerIndex && ' (Drawing)'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative">
            <span className={`text-2xl font-bold ${showWord ? 'text-gray-800' : 'text-transparent'}`}>
              {word}
            </span>
            {!showWord && (
              <div className="absolute inset-0 bg-black h-1 top-1/2 transform -translate-y-1/2"></div>
            )}
          </div>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            onMouseDown={() => setShowWord(true)}
            onMouseUp={() => setShowWord(false)}
            onMouseLeave={() => setShowWord(false)}
          >
            Show Word
          </button>
          <button
            onClick={() => handleNewWord(true)}
            disabled={hasChangedWord || hasStartedDrawing}
            className={`px-4 py-2 ${
              hasChangedWord || hasStartedDrawing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600'
            } text-white rounded transition-colors`}
          >
            New Word
          </button>
          <div className="text-2xl font-bold text-gray-800">
            {timeLeft}s
          </div>
        </div>

        <div className="relative mb-6 border-2 border-gray-200 rounded">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-white/90 p-2 rounded-lg shadow-lg border border-gray-200">
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-32"
            />
            <button
              onClick={clearCanvas}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Clear Canvas"
            >
              <FaEraser size={24} />
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            placeholder="Enter your guess..."
            disabled={!hasStartedDrawing}
            className={`flex-1 px-4 py-2 bg-white text-gray-800 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500 placeholder-gray-400 ${
              !hasStartedDrawing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <button
            onClick={handleGuess}
            disabled={!hasStartedDrawing}
            className={`px-6 py-2 ${
              hasStartedDrawing
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-300 cursor-not-allowed'
            } text-white rounded transition-colors`}
          >
            Guess
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>

      {showVictoryModal && winningTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <div className="text-center mb-6">
              <FaTrophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Victory!</h2>
              <p className="text-xl text-gray-600">
                {winningTeam.name} wins with {winningTeam.score} points!
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Team Players:</h3>
              <div className="grid grid-cols-2 gap-4">
                {winningTeam.players.map((player, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-lg text-gray-700"
                  >
                    {player.name}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onGameEnd}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Start New Game
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StartPage({ onStartGame }: { onStartGame: (teams: Team[]) => void }) {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Blue', color: 'text-blue-600', score: 0, players: [] },
    { id: 2, name: 'Red', color: 'text-red-600', score: 0, players: [] },
  ])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<GameSettings>({
    turnTime: 60,
    minPlayers: 4,
    pointsToWin: 10,
  })
  const [tempSettings, setTempSettings] = useState<GameSettings>(settings)

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlayerName.trim()) return

    // Find the team with fewer players
    const teamWithFewerPlayers = teams[0].players.length <= teams[1].players.length ? 0 : 1
    
    // Calculate total number of players across all teams
    const totalPlayers = teams[0].players.length + teams[1].players.length
    
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayerName.trim(),
      order: totalPlayers // Assign sequential order across all players
    }

    setTeams(teams.map((team, index) => 
      index === teamWithFewerPlayers
        ? { ...team, players: [...team.players, newPlayer] }
        : team
    ))
    setNewPlayerName('')
  }

  const handleRemovePlayer = (playerId: string) => {
    setTeams((prevTeams) => {
      return prevTeams.map((team) => ({
        ...team,
        players: team.players.filter((p) => p.id !== playerId),
      }))
    })
  }

  const handleOpenSettings = () => {
    setTempSettings(settings)
    setShowSettings(true)
  }

  const handleSaveSettings = () => {
    setSettings(tempSettings)
    setShowSettings(false)
  }

  const handleCancelSettings = () => {
    setTempSettings(settings)
    setShowSettings(false)
  }

  const totalPlayers = teams.reduce((sum, team) => sum + team.players.length, 0)
  const canStartGame = totalPlayers >= settings.minPlayers

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Pictionary Game</h1>
          <button
            onClick={handleOpenSettings}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <IoSettings className="text-2xl" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className={`text-xl font-bold mb-4 ${team.color}`}>
                {team.name} Team
              </h3>
              <div className="space-y-2">
                {team.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-white rounded p-2"
                  >
                    <span className="text-gray-800">{player.name}</span>
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer}
            placeholder="Enter player name"
            className="flex-1 px-4 py-2 bg-white text-gray-800 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddPlayer}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Player
          </button>
        </div>

        {!canStartGame && (
          <p className="text-red-500 mb-4">
            Need {settings.minPlayers - totalPlayers} more players to start
          </p>
        )}

        <button
          onClick={() => onStartGame(teams)}
          disabled={!canStartGame}
          className={`w-full px-6 py-3 rounded-lg text-white transition-colors ${
            canStartGame
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Start Game
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Game Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Turn Time (seconds)
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={tempSettings.turnTime}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    turnTime: Math.max(30, Math.min(300, Number(e.target.value)))
                  })}
                  className="w-full px-4 py-2 bg-white text-gray-800 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Minimum Players
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={tempSettings.minPlayers}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    minPlayers: Math.max(2, Math.min(20, Number(e.target.value)))
                  })}
                  className="w-full px-4 py-2 bg-white text-gray-800 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Points to Win
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={tempSettings.pointsToWin}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    pointsToWin: Math.max(5, Math.min(50, Number(e.target.value)))
                  })}
                  className="w-full px-4 py-2 bg-white text-gray-800 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={handleCancelSettings}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [settings, setSettings] = useState<GameSettings>({
    turnTime: 60,
    minPlayers: 4,
    pointsToWin: 10,
  })

  const handleStartGame = (initialTeams: Team[]) => {
    setTeams(initialTeams)
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
