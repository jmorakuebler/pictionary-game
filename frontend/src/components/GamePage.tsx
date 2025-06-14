import { useState, useEffect, type JSX } from 'react'
import { FaEraser } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import type { Team, GameSettings } from './types'
import { VictoryModal } from './VictoryModal'
import { fetchWord } from '../utils/api'
import { useCanvas } from '../hooks/useCanvas'

interface GamePageProps {
  teams: Team[]
  settings: GameSettings
  onGameEnd: () => void
}


export function GamePage({ teams: initialTeams, settings, onGameEnd }: GamePageProps): JSX.Element {
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

  const currentTeam = teams[currentTeamIndex]
  const currentPlayer = currentTeam.players[currentPlayerIndex]

  useEffect(() => {
    handleNewWord()
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
  }, [currentTeamIndex, currentPlayerIndex])

  const handleNewWord = async () => {
    const newWord = await fetchWord()
    setWord(newWord)
    setHasChangedWord(false)
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
    setHasStartedDrawing(false)
    setTimeLeft(settings.turnTime)
    setHasChangedWord(false)
    setGuess('')
    setShowVictoryModal(false)
    setWinningTeam(null)

    // Clear canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    // Move to next player
    setCurrentPlayerIndex((prev) => {
      if (prev === currentTeam.players.length - 1) {
        // Move to next team
        setCurrentTeamIndex((prevTeam) => (prevTeam === teams.length - 1 ? 0 : prevTeam + 1))
        return 0
      }
      return prev + 1
    })
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

  // Remove duplicate declarations - these functions are already defined in the useCanvas hook
  // and we're using them from the destructured values above

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Pictionary Game
        </h1>
        <div className="flex gap-4">
          <button
            onClick={onGameEnd}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            End Game
          </button>
        </div>
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
            onClick={handleNewWord}
            disabled={hasChangedWord || !hasStartedDrawing}
            className={`px-4 py-2 ${
              hasChangedWord || !hasStartedDrawing
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
            onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
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