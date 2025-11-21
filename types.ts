export interface CharacterStats {
  power: number;
  speed: number;
  intelligence: number;
  stamina: number;
}

export interface Character {
  id: string;
  name: string;
  anime: string;
  stats: CharacterStats;
  description: string;
}

export interface BattleResult {
  id: string;
  winnerId: string;
  loserId: string;
  narrative: string;
  winningMove: string;
  date: string;
  audioBase64?: string; // Raw PCM audio data from Gemini TTS
  winnerQuote?: string;
}

export interface LeaderboardEntry {
  characterId: string;
  name: string;
  wins: number;
  losses: number;
  totalBattles: number;
  winRate: number;
}

export type GameState = 'SELECTION' | 'BATTLE' | 'RESULT' | 'HISTORY';