# Pictionary Game

A real-time multiplayer Pictionary game built with React and FastAPI.

## Features

- Real-time drawing and guessing
- Team-based gameplay
- Configurable game settings:
  - Turn time
  - Minimum players
  - Points to win
- Word generation from backend API
- Responsive design

## Prerequisites

Before you begin, ensure you have the following installed:

### Python 3.12
1. Download Python 3.12 from [python.org](https://www.python.org/downloads/release/python-3120/)
2. During installation, make sure to check "Add Python to PATH"
3. Verify installation:
   ```bash
   python --version
   # Should show Python 3.12.x
   ```

### Node.js
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Verify installation:
   ```bash
   node --version
   # Should show v20.x.x or later
   npm --version
   # Should show 10.x.x or later
   ```

## 🏗️ Project Structure

```
pictionary-game/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/           # API endpoints (v1)
│   │   │   ├── endpoints/   # Route handlers
│   │   │   └── api_v1/      # API versioning
│   │   ├── core/            # Core configurations
│   │   ├── models/          # Pydantic models
│   │   ├── services/        # Business logic
│   │   │   ├── game_service.py  # Game management
│   │   │   ├── word_service.py  # Word management
│   │   │   └── file_storage.py  # Data persistence
│   │   └── main.py         # FastAPI application
│   └── requirements.txt
│
└── frontend/                # React frontend (TypeScript)
    ├── public/             # Static files
    ├── src/
    │   ├── components/     # React components
    │   │   ├── GamePage.tsx    # Main game interface
    │   │   ├── SettingsModal.tsx # Game settings
    │   │   ├── GameHistory.tsx  # Past games
    │   │   └── StartPage.tsx    # Game lobby
    │   ├── models/         # TypeScript interfaces
    │   └── utils/          # Utility functions
    └── package.json
```

## 🚀 Setup and Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (Python 3.12+ recommended):
   ```bash
   # Create virtual environment
   python3.12 -m venv venv
   
   # Activate environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   - API Documentation: `http://localhost:8000/docs`
   - API Base URL: `http://localhost:8000/api/v1`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## 🌐 API Endpoints

### Words
- `GET /api/v1/words/random-word` - Get a random word
- `GET /api/v1/words/word-count` - Get total word count
- `GET /api/v1/words/` - List all available words

### Games
- `POST /api/v1/games/` - Create a new game
- `GET /api/v1/games/{game_id}` - Get game details
- `PATCH /api/v1/games/{game_id}` - Update game state
- `GET /api/v1/games/` - List all games with filters
- `DELETE /api/v1/games/{game_id}` - Delete a game

## 🎮 Game Flow

1. **Lobby**:
   - Configure game settings (turn time, points to win)
   - Add players to teams (Red vs Blue)
   - Start the game when ready

2. **Gameplay**:
   - Players take turns drawing words
   - Teammates guess the word being drawn
   - Score points for correct guesses
   - First team to reach the target score wins
### Backend Development
- The backend uses FastAPI for high performance and automatic API documentation
- Words are stored in `backend/app/data/words.json`

### Frontend Development
- Built with React and TypeScript
- Uses Tailwind CSS for styling
- Canvas API for drawing functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
