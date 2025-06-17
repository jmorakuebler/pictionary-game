"""
API package for the Pictionary Game backend.

This package contains all API routes and endpoints.
"""

# Import the API router to make it available when importing from the package
from .api_v1.api import api_router

__all__ = ["api_router"]
