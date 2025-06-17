"""
Game model for the Pictionary Game.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid


class GameConfig(BaseModel):
    """Game configuration model."""
    turn_time: int
    min_players: int
    points_to_win: int


class TeamInfo(BaseModel):
    """Team information model."""
    name: str
    players: List[str]
    score: int = 0


class GameBase(BaseModel):
    """Base game model."""
    red_team: TeamInfo
    blue_team: TeamInfo
    config: GameConfig
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    is_completed: bool = False
    is_aborted: bool = False


class GameCreate(GameBase):
    """Model for creating a new game."""
    pass


class GameUpdate(BaseModel):
    """Model for updating an existing game."""
    red_team_score: Optional[int] = None
    blue_team_score: Optional[int] = None
    end_time: Optional[datetime] = None
    is_completed: Optional[bool] = None
    is_aborted: Optional[bool] = None


class GameInDB(GameBase):
    """Database model for a game."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class Game(GameInDB):
    """Public-facing game model."""
    pass
