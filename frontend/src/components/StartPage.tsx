import { useState } from 'react'
import { IoSettings } from 'react-icons/io5'
import type { Team, GameSettings } from './types'
import { TeamCard } from './TeamCard'
import { SettingsModal } from './SettingsModal'

interface StartPageProps {
  onStartGame: (teams: Team[]) => void
}

export function StartPage({ onStartGame }: StartPageProps) {
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

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return

    const newPlayer = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayerName.trim(),
      order: teams[0].players.length + teams[1].players.length,
    }

    setTeams((prevTeams) => {
      // Find the team with fewer players
      const teamIndex = prevTeams[0].players.length <= prevTeams[1].players.length ? 0 : 1
      
      // Create a new array of teams
      return prevTeams.map((team, index) => {
        if (index === teamIndex) {
          // Add the player to the team with fewer players
          return {
            ...team,
            players: [...team.players, newPlayer]
          }
        }
        // Return the other team unchanged
        return team
      })
    })

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
            <TeamCard
              key={team.id}
              team={team}
              onRemovePlayer={handleRemovePlayer}
            />
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleAddPlayer()}
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
        <SettingsModal
          settings={settings}
          tempSettings={tempSettings}
          onSave={handleSaveSettings}
          onCancel={handleCancelSettings}
          onSettingsChange={setTempSettings}
        />
      )}
    </div>
  )
} 