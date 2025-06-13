from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import json
from pathlib import Path

app = FastAPI(
    title="Pictionary Game API",
    description="API for the Pictionary Game",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_words():
    data_path = Path(__file__).parent / "data" / "words.json"
    with open(data_path, "r") as f:
        data = json.load(f)
    return data["words"]

WORDS = load_words()

@app.get("/")
async def root():
    return {
        "name": "Pictionary Game API",
        "version": "1.0.0",
        "description": "A multiplayer Pictionary game API",
        "endpoints": {
            "root": "/",
            "get_word": "/api/word"
        }
    }

@app.get("/api/word")
async def get_word():
    return {"word": random.choice(WORDS)}
