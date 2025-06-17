"""
Game service for handling game-related operations with file-based persistence.
"""

from typing import List, Optional, Dict, Any
from pathlib import Path

from ..core.config import settings
from ..models.game import Game, GameCreate, GameUpdate, GameInDB
from .file_storage import FileStorage


class GameService:
    """Service for game operations with file-based persistence."""
    
    def __init__(self, storage_path: str = "data/games.json"):
        """Initialize the game service with file storage.
        
        Args:
            storage_path: Path to the JSON file for storing games
        """
        self.storage = FileStorage[GameInDB](
            file_path=storage_path,
            model_type=GameInDB
        )
    
    def create_game(self, game: GameCreate) -> GameInDB:
        """Create a new game and save it to storage."""
        db_game = GameInDB(**game.model_dump())
        return self.storage.save(db_game)
    
    def get_game(self, game_id: str) -> Optional[GameInDB]:
        """Get a game by ID from storage."""
        return self.storage.get(game_id)
    
    def list_games(
        self,
        skip: int = 0,
        limit: int = 100,
        completed: Optional[bool] = None
    ) -> List[GameInDB]:
        """List games with optional filtering from storage."""
        games = self.storage.get_all()
        
        if completed is not None:
            games = [g for g in games if g.is_completed == completed]
        
        # Sort by start_time (newest first)
        games.sort(key=lambda g: g.start_time, reverse=True)
            
        return games[skip:skip + limit]
    
    def update_game(
        self,
        game_id: str,
        game_update: GameUpdate
    ) -> Optional[GameInDB]:
        """Update a game in storage.
        
        Args:
            game_id: ID of the game to update
            game_update: Update data which can include direct score updates or team updates
            
        Returns:
            Updated game or None if not found
        """
        # Get the existing game
        game = self.get_game(game_id)
        if not game:
            return None
            
        # Convert game to dict
        game_dict = game.model_dump()
        update_data = game_update.model_dump(exclude_unset=True)
        
        # Handle direct score updates (from frontend)
        if 'red_team_score' in update_data:
            game_dict['red_team']['score'] = update_data.pop('red_team_score')
        if 'blue_team_score' in update_data:
            game_dict['blue_team']['score'] = update_data.pop('blue_team_score')
            
        # Apply any remaining updates
        for key, value in update_data.items():
            # Handle nested updates (like team updates)
            if key in game_dict and isinstance(game_dict[key], dict) and isinstance(value, dict):
                game_dict[key].update(value)
            else:
                game_dict[key] = value
        
        # Create a new GameInDB instance with updated data
        updated_game = GameInDB(**game_dict)
        
        # Save and return the updated game
        return self.storage.update(game_id, updated_game.model_dump())
    
    def delete_game(self, game_id: str) -> bool:
        """Delete a game from storage."""
        return self.storage.delete(game_id)


# Create a singleton instance with default storage in data/games.json
DATA_DIR = settings.DATA_DIR
DATA_DIR.mkdir(parents=True, exist_ok=True)
game_service = GameService(storage_path=str(DATA_DIR / "games.json"))
