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

## Project Structure

```
.
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── data/     # Game data (words)
│   │   └── main.py   # FastAPI application
│   └── requirements.txt
└── frontend/         # React frontend
    ├── public/
    ├── src/
    └── package.json
```

## Setup and Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python3.12 -m venv venv312
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv312\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv312/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

## How to Play

1. Open `http://localhost:3000` in your browser
2. Add players to teams (minimum 2 players per team)
3. Configure game settings:
   - Time per turn
   - Points to win
4. Start the game
5. Players take turns drawing while their teammates guess
6. First team to reach the target score wins!

## API Endpoints

- `GET /`: API information
- `GET /words`: Get a random word

## Development

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
