from typing import Optional
from ..models.word import Word

class WordService:
    """Service class for word-related operations.
    
    This acts as a thin wrapper around the Word model to provide
    a service layer for business logic if needed in the future.
    """
    
    def get_random_word(self) -> str:
        """Get a random word from the available words.
        
        Returns:
            str: A random word.
            
        Raises:
            ValueError: If no words are available.
        """
        return Word.get_random_word()
    
    def get_word_count(self) -> int:
        """Get the total number of available words.
        
        Returns:
            int: The number of available words.
        """
        return Word.word_count()

# Create a singleton instance
word_service = WordService()
