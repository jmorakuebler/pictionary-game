"""
Word models for the Pictionary Game API.

This module contains Pydantic models used for request/response validation
and serialization in the word-related endpoints.
"""

import json
from pathlib import Path
from typing import List
import random
from pydantic import BaseModel, Field

from ..core.config import settings


class Word(BaseModel):
    """A model representing a word in the Pictionary game."""
    word: str = Field(..., description="A word in the Pictionary game")

    class Config:
        from_attributes = True


class WordList(BaseModel):
    """A model representing a list of words in the Pictionary game."""
    words: List[Word] = Field(..., description="List of words in the Pictionary game")

    class Config:
        from_attributes = True


class WordResponse(BaseModel):
    """Response model for a single word."""
    word: str = Field(..., description="A word in the Pictionary game")
    
    class Config:
        from_attributes = True


class WordCountResponse(BaseModel):
    """Response model for word count endpoint."""
    word_count: int = Field(..., description="Total number of available words")
    
    class Config:
        from_attributes = True


class WordListResponse(BaseModel):
    """Response model for word list endpoint."""
    words: List[str] = Field(..., description="List of all available words")
    
    class Config:
        from_attributes = True
