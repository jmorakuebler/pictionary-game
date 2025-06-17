import type { GameSettings } from './types'

interface SettingsModalProps {
  settings: GameSettings
  onSave: () => void
  onCancel: () => void
  onChange: (settings: GameSettings) => void
}

export function SettingsModal({
  settings,
  onSave,
  onCancel,
  onChange,
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
              value={settings.turnTime}
              onChange={(e) => onChange({
                ...settings,
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
              value={settings.minPlayers}
              onChange={(e) => onChange({
                ...settings,
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
              value={settings.pointsToWin}
              onChange={(e) => onChange({
                ...settings,
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