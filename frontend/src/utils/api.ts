import { toast } from 'react-toastify'

export interface WordResponse {
    word: string
}

interface ApiError extends Error {
    status?: number;
}

export interface Player {
    id: string;
    name: string;
    order: number;
}

export interface Team {
    id: number;
    name: string;
    color: string;
    score: number;
    players: Player[];
}

export interface GameConfig {
    turnTime: number;
    minPlayers: number;
    pointsToWin: number;
}

export interface Game {
    id: string;
    red_team: {
        name: string;
        players: string[];
        score: number;
    };
    blue_team: {
        name: string;
        players: string[];
        score: number;
    };
    config: GameConfig;
    start_time: string;
    end_time?: string;
    is_completed: boolean;
    is_aborted: boolean;
}

export interface GameCreate {
    red_team: {
        name: string;
        players: string[];
        score: number;
    };
    blue_team: {
        name: string;
        players: string[];
        score: number;
    };
    config: GameConfig;
}

export interface GameUpdate {
    red_team_score?: number;
    blue_team_score?: number;
    end_time?: string;
    is_completed?: boolean;
    is_aborted?: boolean;
}

export const fetchWord = async (): Promise<string> => {
    console.log(`Getting new word from "${import.meta.env.VITE_API_BASE_URL}"`)
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/words/random-word`)
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`) as ApiError
            error.status = response.status
            throw error
        }
        const data = await response.json()
        return data.word
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error fetching word:', errorMessage)
        toast.error('Failed to fetch word. Using default word.')
        return 'default'
    }
}

export const fetchWordCount = async (): Promise<number> => {
    console.log(`Getting word count from "${import.meta.env.VITE_API_BASE_URL}"`)
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/words/word-count`)
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`) as ApiError
            error.status = response.status
            throw error
        }
        const data = await response.json()
        return data.word_count
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error fetching word count:', errorMessage)
        toast.error('Failed to fetch word count. Using default word count.')
        return 0
    }
}

// Game API functions
// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => toSnakeCase(item));
    
    return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const value = obj[key];
        acc[snakeKey] = toSnakeCase(value);
        return acc;
    }, {} as Record<string, any>);
};

export const createGame = async (game: GameCreate): Promise<Game> => {
    try {
        // Convert camelCase to snake_case for the request
        const snakeCaseGame = toSnakeCase(game);
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/games/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(snakeCaseGame),
        });
        
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`) as ApiError;
            error.status = response.status;
            throw error;
        }
        
        return await response.json();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error creating game:', errorMessage);
        toast.error('Failed to create game');
        throw error;
    }
};

export const getGame = async (gameId: string): Promise<Game> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/games/${gameId}`);
        
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`) as ApiError;
            error.status = response.status;
            throw error;
        }
        
        return await response.json();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching game:', errorMessage);
        toast.error('Failed to fetch game');
        throw error;
    }
};

export const updateGame = async (gameId: string, update: GameUpdate): Promise<Game> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/games/${gameId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(update),
        });
        
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`) as ApiError;
            error.status = response.status;
            throw error;
        }
        
        return await response.json();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error updating game:', errorMessage);
        toast.error('Failed to update game');
        throw error;
    }
};

export const listGames = async (): Promise<Game[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/games/`);
        
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`) as ApiError;
            error.status = response.status;
            throw error;
        }
        
        return await response.json();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error listing games:', errorMessage);
        toast.error('Failed to load game history');
        return [];
    }
};

