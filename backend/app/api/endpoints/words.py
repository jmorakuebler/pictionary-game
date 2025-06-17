from fastapi import APIRouter, HTTPException, status
from typing import List

from ...services.word_service import word_service
from ...models.word import WordResponse, WordCountResponse, WordListResponse

router = APIRouter()

@router.get(
    "/random-word",
    response_model=WordResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a random word",
    description="Returns a random word for the Pictionary game."
)
async def get_random_word() -> WordResponse:
    """
    Get a random word for the Pictionary game.
    
    Returns:
        WordResponse: A random word
        
    Raises:
        HTTPException: If no words are available
    """
    try:
        return word_service.get_random_word()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get(
    "/word-count",
    response_model=WordCountResponse,
    status_code=status.HTTP_200_OK,
    summary="Get word count",
    description="Returns the total number of available words."
)
async def get_word_count() -> WordCountResponse:
    """
    Get the total number of available words.
    
    Returns:
        WordCountResponse: The number of available words
    """
    return word_service.get_word_count()

@router.get(
    "/",
    response_model=WordListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get all words",
    description="Returns a list of all available words.",
    response_description="List of all available words"
)
async def get_all_words() -> WordListResponse:
    """
    Get all available words.
    
    Returns:
        WordListResponse: A list of all available words
    """
    return word_service.get_all_words()
