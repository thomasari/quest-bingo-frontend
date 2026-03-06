import { BACKEND_API_URL } from "../globals";
import type { Player, RoomDto } from "./types/types";

/* ============================= */
/* CREATE ROOM */
/* ============================= */

export async function createRoom(): Promise<RoomDto | null> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/room/create`);
    if (!res.ok) throw new Error("Failed to create room");

    const room: RoomDto = await res.json();
    return room?.id ? room : null;
  } catch (err) {
    console.error("Room creation failed:", err);
    return null;
  }
}

/* ============================= */
/* GET ROOM */
/* ============================= */

export async function getRoom(id: string): Promise<RoomDto | null> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/room/${id}`);
    if (!res.ok) throw new Error("Failed to fetch room");

    const room: RoomDto = await res.json();
    return room?.id ? room : null;
  } catch (err) {
    console.error("Room fetch failed:", err);
    return null;
  }
}

/* ============================= */
/* JOIN ROOM */
/* ============================= */

interface JoinRoomResponse {
  newPlayer: Player;
  room: RoomDto;
}

export async function joinRoom(
  roomId: string,
  player: { name: string; color: string },
): Promise<JoinRoomResponse | null> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/room/${roomId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(player),
    });

    if (!res.ok) throw new Error("Failed to join room");

    const data: JoinRoomResponse = await res.json();
    return data?.room && data?.newPlayer ? data : null;
  } catch (err) {
    console.error("Join room failed:", err);
    return null;
  }
}

/* ============================= */
/* START GAME */
/* ============================= */

export async function startGame(roomId: string): Promise<RoomDto | null> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/room/${roomId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to start game");

    const room: RoomDto = await res.json();
    return room?.id ? room : null;
  } catch (err) {
    console.error("Start game failed:", err);
    return null;
  }
}

/* ============================= */
/* GET GAMEMODES */
/* ============================= */

export async function getGamemodes(): Promise<
  { value: string; label: string }[]
> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/gamemodes`);
    if (!res.ok) throw new Error("Failed to fetch gamemodes");

    const gamemodes: { value: string; label: string }[] = await res.json();
    return gamemodes;
  } catch (err) {
    console.error("Failed to fetch gamemodes:", err);
    return [];
  }
}

/* ============================= */
/* SET GAMEMODE */
/* ============================= */

export async function setGamemode(
  roomId: string,
  gamemode: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/room/${roomId}/gamemode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gamemode), // raw enum string
    });

    return res.ok;
  } catch (err) {
    console.error("Set gamemode failed:", err);
    return false;
  }
}

/* ============================= */
/* SET ROUNDS */
/* ============================= */

export async function setRounds(
  roomId: string,
  rounds: number,
): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/room/${roomId}/rounds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rounds),
    });

    return res.ok;
  } catch (err) {
    console.error("Set rounds failed:", err);
    return false;
  }
}

/* ============================= */
/* RESTART GAME */
/* ============================= */

export async function restartGame(roomId: string): Promise<RoomDto | null> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/room/${roomId}/restart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to restart game");

    const room: RoomDto = await res.json();
    return room?.id ? room : null;
  } catch (err) {
    console.error("Start game failed:", err);
    return null;
  }
}
