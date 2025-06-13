import { FaTrophy } from 'react-icons/fa'
import type { Team } from './types'

interface VictoryModalProps {
  winningTeam: Team
  onNewGame: () => void
}

export function VictoryModal({ winningTeam, onNewGame }: VictoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="flex justify-center mb-6">
          <FaTrophy className="text-6xl text-yellow-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Victory!</h2>
        <p className="text-xl text-gray-600 mb-6">
          {winningTeam.name} Team Wins!
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-2xl font-bold text-gray-800 mb-2">
            {winningTeam.score} Points
          </p>
          <div className="grid grid-cols-2 gap-2">
            {winningTeam.players.map((player) => (
              <div
                key={player.id}
                className="text-gray-600 bg-white rounded p-2"
              >
                {player.name}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onNewGame}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start New Game
        </button>
      </div>
    </div>
  )
} 