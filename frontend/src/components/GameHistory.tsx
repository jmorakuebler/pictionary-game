import { useEffect, useState } from 'react';
import { type Game, listGames } from '../utils/api';
import { format } from 'date-fns';

interface GameHistoryProps {
  onGameSelect?: (gameId: string) => void;
}

export function GameHistory({ onGameSelect }: GameHistoryProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const gameList = await listGames();
        setGames(gameList);
      } catch (err) {
        setError('Failed to load game history');
        console.error('Error loading games:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading game history...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (games.length === 0) {
    return <div className="text-gray-500 text-center py-4">No previous games found</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Previous Games</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Red Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blue Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {games.map((game) => (
              <tr 
                key={game.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onGameSelect?.(game.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(game.start_time), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-red-600">{game.red_team.name}</div>
                  <div className="text-sm text-gray-500">
                    {game.red_team.players.join(', ')}
                  </div>
                  <div className="text-sm font-semibold">{game.red_team.score} pts</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">{game.blue_team.name}</div>
                  <div className="text-sm text-gray-500">
                    {game.blue_team.players.join(', ')}
                  </div>
                  <div className="text-sm font-semibold">{game.blue_team.score} pts</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    game.is_completed 
                      ? 'bg-green-100 text-green-800' 
                      : game.is_aborted
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {game.is_completed ? 'Completed' : game.is_aborted ? 'Aborted' : 'In Progress'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
