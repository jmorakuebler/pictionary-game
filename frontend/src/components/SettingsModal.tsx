import type { GameSettings } from './types'

interface SettingsModalProps {
  settings: GameSettings
  tempSettings: GameSettings
  onSave: () => void
  onCancel: () => void
  onSettingsChange: (settings: GameSettings) => void
}

export function SettingsModal({
  settings,
  tempSettings,
  onSave,
  onCancel,
  onSettingsChange,
}: SettingsModalProps) {
  return (
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
              onChange={(e) => onSettingsChange({
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
              onChange={(e) => onSettingsChange({
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
              onChange={(e) => onSettingsChange({
                ...tempSettings,
                pointsToWin: Math.max(5, Math.min(50, Number(e.target.value)))
              })}
              className="w-full px-4 py-2 bg-white text-gray-800 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
} 