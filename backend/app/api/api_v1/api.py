from fastapi import APIRouter
from ..endpoints import words, games

api_router = APIRouter()
api_router.include_router(words.router, prefix="/words", tags=["words"])
api_router.include_router(games.router, prefix="/games", tags=["games"])
