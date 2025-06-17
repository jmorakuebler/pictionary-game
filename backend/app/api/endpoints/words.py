from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ...services.word_service import word_service

router = APIRouter()

@router.get("/word", response_model=Dict[str, str])
async def get_random_word() -> Dict[str, str]:
    """
    Get a random word for the Pictionary game.
    """
    try:
        word = word_service.get_random_word()
        return {"word": word}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/word_count", response_model=Dict[str, int])
async def get_word_count() -> Dict[str, int]:
    """
    Get the total number of available words.
    """
    return {"word_count": word_service.get_word_count()}
