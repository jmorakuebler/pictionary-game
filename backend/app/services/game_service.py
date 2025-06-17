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
        """Update a game in storage."""
        # Convert Pydantic model to dict and remove None values
        update_data = {
            k: v for k, v in game_update.model_dump().items() 
            if v is not None
        }
        return self.storage.update(game_id, update_data)
            
        game = self.games[game_id]
        update_data = game_update.model_dump(exclude_unset=True)
        
        return self.storage.update(game_id, update_data)
    
    def delete_game(self, game_id: str) -> bool:
        """Delete a game from storage."""
        return self.storage.delete(game_id)


# Create a singleton instance with default storage in data/games.json
DATA_DIR = settings.DATA_DIR
DATA_DIR.mkdir(parents=True, exist_ok=True)
game_service = GameService(storage_path=str(DATA_DIR / "games.json"))
