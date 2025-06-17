import json
from pathlib import Path
from typing import List
import random
from ..core.config import settings

class WordService:
    def __init__(self):
        self.words: List[str] = []
        self._load_words()
    
    def _load_words(self) -> None:
        """Load words from the JSON file."""
        data_path = settings.DATA_DIR / "words.json"
        try:
            with open(data_path, "r") as f:
                data = json.load(f)
                self.words = data.get("words", [])
        except (FileNotFoundError, json.JSONDecodeError) as e:
            # Initialize with empty list if file doesn't exist or is invalid
            self.words = []
    
    def get_random_word(self) -> str:
        """Get a random word from the loaded words."""
        if not self.words:
            raise ValueError("No words available")
        return random.choice(self.words)

# Create a singleton instance
word_service = WordService()
