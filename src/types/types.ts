export interface Room {
  id: string;
  players: Player[];
  board: Board;
  gameStarted: string | null;
  gameEnded: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface Board {
  quests: Quest[][];
}

export interface Quest {
  id: string;
  text: string;
  completedByPlayerId: string | null;
}

export interface ChatMessage {
  sender: {
    name: string;
    color: string;
  };
  message: string;
}
