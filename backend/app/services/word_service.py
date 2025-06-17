"""
Word service for handling word-related operations with file-based persistence.
"""

import json
import random
from pathlib import Path
from typing import List, Optional

from ..core.config import settings
from ..models.word import WordResponse, WordCountResponse, WordListResponse


class WordService:
    """Service for word operations with file-based persistence."""
    
    def __init__(self, words_file: str = "data/words.json"):
        """Initialize the word service with file storage.
        
        Args:
            words_file: Path to the JSON file containing words
        """
        self.words_file = Path(words_file)
        self._words: List[str] = []
        self._load_words()
    
    def _load_words(self) -> None:
        """Load words from the JSON file."""
        if not self.words_file.exists():
            self._words = []
            return
            
        try:
            with open(self.words_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self._words = data.get("words", [])
        except (json.JSONDecodeError, FileNotFoundError):
            self._words = []
    
    def get_random_word(self) -> WordResponse:
        """Get a random word from the available words.
        
        Returns:
            WordResponse: A random word.
            
        Raises:
            ValueError: If no words are available.
        """
        if not self._words:
            raise ValueError("No words available in the word list")
            
        return WordResponse(word=random.choice(self._words))
    
    def get_word_count(self) -> WordCountResponse:
        """Get the total number of available words.
        
        Returns:
            WordCountResponse: The number of available words.
        """
        return WordCountResponse(word_count=len(self._words))
    
    def get_all_words(self) -> WordListResponse:
        """Get all available words.
        
        Returns:
            WordListResponse: A list of all available words.
        """
        return WordListResponse(words=self._words.copy())


# Create a singleton instance with default words file
word_service = WordService(words_file=str(settings.DATA_DIR / "words.json"))
