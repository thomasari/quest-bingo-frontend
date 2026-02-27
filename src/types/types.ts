export interface RoomDto {
  id: string;
  players: Player[];
  host: Player | null;
  game: GameDto | null;
}

export interface GameDto {
  gameMode: GameMode;
  startedAt: string | null;
  ended: boolean;
  currentRoundIndex: number;
  currentRound: RoundDto | null;
}

export interface RoundDto {
  state: RoundState;
  startedAt: string | null;
  endsAt: string | null;
  intermissionEndsAt: string | null;
  maskedName: string;
  playerScores: { [key: string]: number };
}

export interface SongDto {
  displayName: string;
  previewUrl: string;
  startAt: string;
  endsAt: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
}

export const GameMode = {
  Seventies: "Seventies",
  Eighties: "Eighties",
  Nineties: "Nineties",
  TwoThousands: "TwoThousands",
  TwentyTens: "TwentyTens",
  TwentyTwenties: "TwentyTwenties",
  AllTime: "AllTime",
} as const;

export type GameMode = (typeof GameMode)[keyof typeof GameMode];

export const RoundState = {
  Countdown: "Countdown",
  Playing: "Playing",
  Intermission: "Intermission",
  Ended: "Ended",
} as const;

export type RoundState = (typeof RoundState)[keyof typeof RoundState];

export interface ChatMessage {
  sender: Player;
  message: string;
  isSystemMessage: boolean;
}
