"""
Word model for the Pictionary Game.
Handles loading and managing the word list from a JSON file.
"""

import json
from pathlib import Path
from typing import List, Optional
import random

from ..core.config import settings


class Word:
    """A model representing a word in the Pictionary game."""
    
    _words: List[str] = []
    _initialized: bool = False
    
    @classmethod
    def _load_words(cls) -> None:
        """Load words from the JSON file.
        
        Raises:
            FileNotFoundError: If the words.json file is not found.
            json.JSONDecodeError: If the file contains invalid JSON.
        """
        if cls._initialized:
            return
            
        data_path = settings.DATA_DIR / "words.json"
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            cls._words = data.get("words", [])
        
        cls._initialized = True
    
    @classmethod
    def get_random_word(cls) -> str:
        """Get a random word from the loaded words.
        
        Returns:
            str: A random word.
            
        Raises:
            ValueError: If no words are available.
        """
        cls._load_words()  # Ensure words are loaded
        
        if not cls._words:
            raise ValueError("No words available in the word list")
            
        return random.choice(cls._words)
    
    @classmethod
    def get_all_words(cls) -> List[str]:
        """Get all available words.
        
        Returns:
            List[str]: A list of all available words.
        """
        cls._load_words()  # Ensure words are loaded
        return cls._words.copy()
    
    @classmethod
    def word_count(cls) -> int:
        """Get the total number of available words.
        
        Returns:
            int: The number of available words.
        """
        cls._load_words()  # Ensure words are loaded
        return len(cls._words)
