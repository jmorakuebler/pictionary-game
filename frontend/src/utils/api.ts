import { toast } from 'react-hot-toast'

export interface WordResponse {
    word: string
}

export interface ApiError extends Error {
    status?: number
    message: string
}

export const fetchWord = async (): Promise<string> => {
    console.log(`Getting new word from "${import.meta.env.VITE_API_BASE_URL}"`)
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/word`)
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
