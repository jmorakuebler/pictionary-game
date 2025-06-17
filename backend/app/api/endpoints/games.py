"""
Game API endpoints.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from ...models.game import Game, GameCreate, GameUpdate, GameInDB
from ...services.game_service import game_service

router = APIRouter()


@router.post("/", response_model=Game)
async def create_game(game: GameCreate) -> GameInDB:
    """Create a new game."""
    return game_service.create_game(game)


@router.get("/{game_id}", response_model=Game)
@router.get("/{game_id}/", response_model=Game)  # Handle with trailing slash
async def get_game(game_id: str) -> GameInDB:
    """Get a game by ID.
    
    Handles both with and without trailing slash.
    """
    game = game_service.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.get("/", response_model=List[Game])
async def list_games(
    skip: int = 0,
    limit: int = 100,
    completed: bool = None
) -> List[GameInDB]:
    """List games with optional filtering."""
    return game_service.list_games(skip=skip, limit=limit, completed=completed)


@router.patch("/{game_id}", response_model=Game)
async def update_game(
    game_id: str,
    game_update: GameUpdate
) -> GameInDB:
    """Update a game."""
    updated_game = game_service.update_game(game_id, game_update)
    if not updated_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return updated_game


@router.delete("/{game_id}", status_code=204)
async def delete_game(game_id: str) -> None:
    """Delete a game."""
    if not game_service.delete_game(game_id):
        raise HTTPException(status_code=404, detail="Game not found")
