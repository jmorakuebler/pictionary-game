"""
File storage service for persisting game data to a single JSON file.
"""

import json
from pathlib import Path
from typing import Dict, Any, TypeVar, Generic, Optional, List, Type

T = TypeVar('T')

class FileStorage(Generic[T]):
    """Generic file storage service for persisting data to a single JSON file."""
    
    def __init__(self, file_path: str, model_type: Type[T]):
        """Initialize the file storage.
        
        Args:
            file_path: Path to the JSON file for storage
            model_type: The Pydantic model type for data validation
        """
        self.file_path = Path(file_path)
        self.model_type = model_type
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        self._data: Dict[str, Dict[str, Any]] = self._load_data()
    
    def _load_data(self) -> Dict[str, Dict[str, Any]]:
        """Load data from the JSON file."""
        if not self.file_path.exists():
            return {}
            
        try:
            with open(self.file_path, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}
    
    def _save_data(self):
        """Save data to the JSON file."""
        with open(self.file_path, 'w') as f:
            json.dump(self._data, f, indent=2, default=str)
    
    def save(self, item: T) -> T:
        """Save an item to storage."""
        if not hasattr(item, 'id') or not item.id:
            raise ValueError("Item must have an 'id' attribute")
            
        item_dict = item.model_dump()
        self._data[item.id] = item_dict
        self._save_data()
        return item
    
    def get(self, item_id: str) -> Optional[T]:
        """Get an item by ID."""
        if item_id not in self._data:
            return None
        return self.model_type(**self._data[item_id])
    
    def get_all(self) -> List[T]:
        """Get all items from storage."""
        return [self.model_type(**item) for item in self._data.values()]
    
    def delete(self, item_id: str) -> bool:
        """Delete an item by ID."""
        if item_id in self._data:
            del self._data[item_id]
            self._save_data()
            return True
        return False
    
    def update(self, item_id: str, update_data: Dict[str, Any]) -> Optional[T]:
        """Update an item with new data."""
        if item_id not in self._data:
            return None
            
        # Update the data with new values
        for key, value in update_data.items():
            if value is not None:
                self._data[item_id][key] = value
        
        # Create and validate the updated model
        updated_item = self.model_type(**self._data[item_id])
        
        # Save the updated data
        self._data[item_id] = updated_item.model_dump()
        self._save_data()
            
        return updated_item
