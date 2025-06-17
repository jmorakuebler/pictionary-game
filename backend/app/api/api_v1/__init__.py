"""
API v1 package for the Pictionary Game backend.

This package contains all API v1 routes and endpoints.
"""

# Import the API router to make it available when importing from the package
from .api import api_router

__all__ = ["api_router"]
