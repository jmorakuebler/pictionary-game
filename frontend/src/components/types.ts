export interface Player {
  id: string
  name: string
  order: number
}

export interface Team {
  id: number
  name: string
  color: string
  score: number
  players: Player[]
}

export interface GameSettings {
  turnTime: number
  minPlayers: number
  pointsToWin: number
} 