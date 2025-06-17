import { useState, useEffect, useCallback, type JSX } from 'react'
import { FaEraser } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import type { Team, GameSettings } from './types'
import { VictoryModal } from './VictoryModal'
import { fetchWord, updateGame, getGame } from '../utils/api'
import { useCanvas } from '../hooks/useCanvas'
import { useNavigate } from 'react-router-dom'

interface GamePageProps {
  teams: Team[]
  settings: GameSettings
  onGameEnd: () => void
}


export function GamePage({ teams: initialTeams, settings, onGameEnd }: GamePageProps): JSX.Element {
  const navigate = useNavigate()
  const [gameId, setGameId] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [currentPlayerOrder, setCurrentPlayerOrder] = useState(0)
  const [word, setWord] = useState('')
  const [guess, setGuess] = useState('')
  const [showWord, setShowWord] = useState(false)
  const [hasChangedWord, setHasChangedWord] = useState(false)
  const [timeLeft, setTimeLeft] = useState(settings.turnTime)
  const [hasStartedDrawing, setHasStartedDrawing] = useState(false)
  const [showVictoryModal, setShowVictoryModal] = useState(false)
  const [winningTeam, setWinningTeam] = useState<Team | null>(null)
  const { 
    canvasRef, 
    startDrawing,
    draw, 
    stopDrawing, 
    isDrawing,
    clearCanvas, 
    brushSize, 
    setBrushSize 
  } = useCanvas()

  // Initialize game and load word
  useEffect(() => {
    const loadInitialData = async () => {
      const id = sessionStorage.getItem('currentGameId')
      if (id) {
        setGameId(id)
        try {
          await getNewWord()
        } catch (error) {
          console.error('Failed to load word:', error)
          toast.error('Failed to load word. Please try again.')
        }
      }
    }
    
    loadInitialData()
  }, [])

  useEffect(() => {
    if (isDrawing) {
      setHasStartedDrawing(true)
    }
  }, [isDrawing]) // Only re-run when isDrawing changes

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
  }, [currentPlayerOrder])

  const getNewWord = async () => {
    try {
      const newWord = await fetchWord()
      setWord(newWord)
      return newWord
    } catch (error) {
      console.error('Error fetching word:', error)
      throw error
    }
  }

  const handleNewWordClick = async () => {
    await getNewWord()
    setHasChangedWord(true)
  }

  const handleEndGame = async () => {
    if (window.confirm('Are you sure you want to end the current game?')) {
      try {
        // Use updateGameState to ensure consistent state updates
        await updateGameState({
          is_aborted: true,
          end_time: new Date().toISOString()
        })
        
        // Clear the current game from session storage
        sessionStorage.removeItem('currentGameId')
        
        // Navigate to home and clean up
        onGameEnd()
        navigate('/')
      } catch (error) {
        console.error('Failed to end game:', error)
        toast.error('Failed to properly end the game')
      }
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

  const handleTurnChange = () => {
    getNewWord()
    setHasStartedDrawing(false)
    setTimeLeft(settings.turnTime)
    setHasChangedWord(false)
    setGuess('')
    clearCanvas()

    // Move to next player v2
    setCurrentPlayerOrder((prevOrder) => {
      const last_order = teams[0].players.length + teams[1].players.length
      if (prevOrder + 1 === last_order) {
        return 0
      }
      return prevOrder + 1
    })
  }

  const updateGameState = useCallback(async (updates: {
    red_team_score?: number
    blue_team_score?: number
    is_completed?: boolean
    is_aborted?: boolean
    end_time?: string
  }) => {
    const currentGameId = gameId || sessionStorage.getItem('currentGameId')
    console.log(`Updating game ID ${currentGameId} with state:`, updates)
    
    if (!currentGameId) {
      console.error('No game ID found for update')
      return
    }
    
    try {
      await updateGame(currentGameId, {
        ...updates,
        ...(updates.is_completed ? { end_time: new Date().toISOString() } : {})
      })
    } catch (error) {
      console.error('Failed to update game:', error)
      toast.error('Failed to save game progress')
    }
  }, [gameId])

  // Load saved game state on mount
  useEffect(() => {
    const loadGameState = async () => {
      if (!gameId) return
      
      try {
        const savedGame = await getGame(gameId)
        if (savedGame) {
          // Update teams with saved scores
          setTeams(prevTeams => {
            return prevTeams.map((team, index) => ({
              ...team,
              score: index === 0 ? savedGame.blue_team.score : savedGame.red_team.score
            }))
          })
          
          // If game was completed, show victory modal
          if (savedGame.is_completed) {
            const winningTeamIndex = savedGame.blue_team.score >= savedGame.red_team.score ? 0 : 1
            setWinningTeam(initialTeams[winningTeamIndex])
            setShowVictoryModal(true)
          }
        }
      } catch (error) {
        console.error('Failed to load game state:', error)
        toast.error('Failed to load saved game')
      }
    }
    
    loadGameState()
  }, [gameId])

  const handleCorrectGuess = async () => {
    // Update scores and handle turn logic
    const updatedTeams = [...teams]
    const currentTeamIndex = currentPlayerOrder % 2
    const currentTeam = updatedTeams[currentTeamIndex]
    
    // Update local state
    currentTeam.score += 1
    setTeams(updatedTeams)

    // Update backend
    await updateGameState({
      [currentTeamIndex === 0 ? 'blue_team_score' : 'red_team_score']: currentTeam.score
    })

    // Check for winner
    if (currentTeam.score >= settings.pointsToWin) {
      setWinningTeam(currentTeam)
      setShowVictoryModal(true)
      await updateGameState({
        is_completed: true
      })
      return
    }

    // Call next turn handler
    handleTurnChange()
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Pictionary Game
        </h1>
        <div className="flex gap-4">
          <button
            onClick={handleEndGame}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            End Game
          </button>
        </div>
      </div>

      {/* Teams Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-8">
          {teams.map((team) => (
            <div key={team.id} className="text-center">
              <h3 className={`text-xl font-bold ${team.color}`}>
                {team.name}
              </h3>
              <p className="text-gray-600">Score: {team.score}</p>
              <div className="mt-2">
                {team.players.map((player) => (
                  <div
                    key={player.id}
                    className={`text-sm ${
                      player.order === currentPlayerOrder
                        ? 'font-bold text-gray-800'
                        : 'text-gray-600'
                    }`}
                  >
                    {player.name}
                    {player.order === currentPlayerOrder && ' (Drawing)'}
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
            onClick={handleNewWordClick}
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
              onChange={(e) => {
                const newBrushSize = Number(e.target.value)
                setBrushSize(newBrushSize)
                const canvas = canvasRef.current
                if (canvas) {
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    ctx.lineWidth = newBrushSize
                  }
                }
              }}
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
            onKeyUp={(e) => e.key === 'Enter' && handleGuess()}
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
            onClick={handleTurnChange}
            className={`px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors`}
          >
            Skip
          </button>
        </div>
      </div>

      {showVictoryModal && winningTeam && (
        <VictoryModal
          winningTeam={winningTeam}
          onNewGame={onGameEnd}
        />
      )}
    </div>
  )
}
