import { useEffect, useRef, useState } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import type { ChatMessage, Player, RoomDto, SongDto } from "./types/types";
import { BACKEND_API_URL } from "../globals";

interface RoomSignalRHandlers {
  onRoomUpdate?: (room: RoomDto) => void;
  onSongStarted?: (song: SongDto) => void;
  onCorrectGuess?: (playerId: string, newScore: number) => void;
  onChat?: (message: ChatMessage) => void;
  onGameEnded?: (room: RoomDto) => void;
}

export default function useRoomSignalR(
  roomId?: string,
  handlers?: RoomSignalRHandlers,
) {
  const connectionRef = useRef<HubConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [room, setRoom] = useState<RoomDto | null>(null);

  /* =============================
     CONNECT
  ============================= */

  useEffect(() => {
    if (!roomId) return;

    const conn = new HubConnectionBuilder()
      .withUrl(`${BACKEND_API_URL}/hub/room?roomId=${roomId}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = conn;

    conn.start().catch(console.error);

    return () => {
      conn.stop();
    };
  }, [roomId]);

  /* =============================
     EVENTS
  ============================= */

  useEffect(() => {
    const conn = connectionRef.current;
    if (!conn) return;

    conn.on("RoomUpdate", (state: RoomDto) => {
      setRoom(state);
      handlers?.onRoomUpdate?.(state);
    });

    conn.on("CorrectGuess", (playerId: string, newScore: number) => {
      handlers?.onCorrectGuess?.(playerId, newScore);
    });

    conn.on("SongStarted", (song: SongDto) => {
      syncAudio(song.previewUrl, song.startAt);
      handlers?.onSongStarted?.(song);
    });

    conn.on("RoundEnded", (song: SongDto) => {
      syncAudio(song.previewUrl, song.startAt);
      handlers?.onSongStarted?.(song);
    });

    conn.on("GameEnded", (room: RoomDto) => {
      setRoom(room);
      handlers?.onGameEnded?.(room);
    });

    conn.on(
      "ReceiveChat",
      (sender: Player, message: string, isSystemMessage: boolean) => {
        handlers?.onChat?.({
          sender,
          message,
          isSystemMessage,
        });
      },
    );

    return () => {
      conn.off("RoomUpdate");
      conn.off("CorrectGuess");
      conn.off("SongStarted");
      conn.off("GameEnded");
      conn.off("ReceiveChat");
    };
  }, [handlers]);

  /* =============================
     AUDIO SYNC
  ============================= */

  function syncAudio(previewUrl: string, startAt: string) {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.src = previewUrl;

    const delay = new Date(startAt).getTime() - Date.now();

    if (delay > 0) {
      setTimeout(() => audio.play(), delay);
    } else {
      audio.currentTime = Math.abs(delay) / 1000;
      audio.play();
    }
  }

  /* =============================
     TIMER
  ============================= */

  function getRemainingTime(endTime?: string | null) {
    if (!endTime) return 0;
    const ms = new Date(endTime).getTime() - Date.now();
    return Math.max(0, Math.floor(ms / 1000));
  }

  /* =============================
     GUESS
  ============================= */

  async function sendChat(roomId: string, playerId: string, message: string) {
    if (!connectionRef.current) return;
    await connectionRef.current.invoke("SendChat", roomId, playerId, message);
  }

  async function sendGuess(playerId: string, message: string) {
    if (!connectionRef.current || !roomId) return;
    await connectionRef.current.invoke("SendGuess", roomId, playerId, message);
  }

  return {
    room,
    audioRef,
    sendGuess,
    sendChat,
    getRemainingTime,
  };
}
