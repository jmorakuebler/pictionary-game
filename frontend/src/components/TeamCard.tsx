import type { Team, Player } from './types'

interface TeamCardProps {
  team: Team
  onRemovePlayer: (playerId: string) => void
}

export function TeamCard({ team, onRemovePlayer }: TeamCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
              onClick={() => onRemovePlayer(player.id)}
              className="text-red-500 hover:text-red-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 