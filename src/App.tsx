/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.scss";
import type { Player, Room } from "./types/types";
import { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import Input from "./components/input/Input";
import { validatePlayerName } from "./utils/validators";
import Window from "./components/window/Window";
import Button from "./components/button/Button";
import Chat from "./components/chat/Chat";
import Board from "./components/board/Board";
import { BACKEND_API_URL } from "../globals";

function Home() {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");

  async function onCreateRoom() {
    try {
      const response = await fetch(`${BACKEND_API_URL}/create`);

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const room = (await response.text()) as string;

      if (!room) {
        throw new Error("Invalid room data received");
      }

      navigate(`/room/${room}`);
    } catch (err: any) {
      console.error("Room creation failed:", err.message);
      // Optionally show error to user here
    }
  }

  async function onJoinRoom(id: string) {
    navigate(`/room/${id}`);
  }

  return (
    <div className="page">
      <div className="home">
        <h1 className="title">Quest Bingo</h1>
        <Input
          id={"room-code-input"}
          onChange={(v) => setRoomId(v.currentTarget.value.toUpperCase())}
          value={roomId}
          maxLength={5}
          onClickSubmit={() => onJoinRoom(roomId)}
          onKeySubmit={() => onJoinRoom(roomId)}
          buttonText="Join room"
          buttonDisabled={roomId.length !== 5}
          buttonType="primary"
          modifierClass="room-code-input"
          buttonIcon="arrow_right_alt"
        />
        <span className="menu-divider">OR</span>
        <Button
          id="create-room-button"
          icon="arrow_right_alt"
          text={"Create room"}
          onClick={onCreateRoom}
        />
      </div>
    </div>
  );
}

function JoinRoom({ roomId }: { roomId: string }) {
  const [room, setRoom] = useState<Room | undefined>();
  const [player, setPlayer] = useState<Player | undefined>();
  const [playerName, setPlayerName] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const navigate = useNavigate();

  const [elapsed, setElapsed] = useState("0:00:00");

  useEffect(() => {
    if (!room?.gameStarted || room.gameEnded) return;

    const start = new Date(room.gameStarted).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - start;

      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setElapsed(
        `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.gameStarted, room?.gameEnded]);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(`${BACKEND_API_URL}/hub/room?roomId=${roomId}`)
      .withAutomaticReconnect()
      .build();

    conn
      .start()
      .then(() => {
        setConnection(conn); // <-- only set it after it's ready
      })
      .catch((err) => console.error("SignalR start error:", err));

    return () => {
      conn.stop();
    };
  }, [roomId]);

  // Start connection + subscribe to events
  useEffect(() => {
    if (!connection) return;

    connection.on("PlayerJoined", (newPlayer: Player) => {
      setRoom((prevRoom) => {
        if (!prevRoom) return prevRoom;

        const exists = prevRoom.players.some((p) => p.id === newPlayer.id);
        if (exists) return prevRoom;

        return {
          ...prevRoom,
          players: [...prevRoom.players, newPlayer],
        };
      });
    });

    connection.on("PlayerChangedName", (updatedPlayer: Player) => {
      setRoom((prevRoom) => {
        if (!prevRoom) return prevRoom;

        return {
          ...prevRoom,
          players: prevRoom.players.map((p) =>
            p.id === updatedPlayer.id ? updatedPlayer : p
          ),
        };
      });
    });

    connection.on("RoomUpdate", (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });
  }, [connection]);

  // Join room (fetch room + player)
  useEffect(() => {
    if (room !== undefined) return;
    if (!connection || connection.state !== "Connected") return;

    const existingPlayerId = localStorage.getItem("playerId");

    async function joinRoom() {
      try {
        const getRoomResponse = await fetch(
          `${BACKEND_API_URL}/room/${roomId}`
        );
        if (!getRoomResponse.ok) throw new Error("Room not found");

        const room = (await getRoomResponse.json()) as Room;
        setRoom(room);

        const existingPlayer = room.players.find(
          (p) => p.id === existingPlayerId
        );
        if (existingPlayer) {
          setPlayer(existingPlayer);
          setPlayerName(existingPlayer.name);
        } else {
          const joinRoomResponse = await fetch(
            `${BACKEND_API_URL}/join/${roomId}`,
            {
              method: "POST",
            }
          );
          if (!joinRoomResponse.ok) throw new Error("Failed to join room");

          const { player: newPlayer, room: updatedRoom } =
            await joinRoomResponse.json();
          setPlayer(newPlayer);
          setPlayerName(newPlayer.name);
          setRoom(updatedRoom);
          localStorage.setItem("playerId", newPlayer.id);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }

    joinRoom();
  }, [roomId, room, connection]);

  async function onSetPlayerName(newName: string) {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/room/${roomId}/player/${player?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newName),
        }
      );

      if (!response.ok) throw new Error("Player not found");

      const updatedPlayer = (await response.json()) as Player;
      setPlayer(updatedPlayer);
      setPlayerName(updatedPlayer.name);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function onStartGame() {
    try {
      const response = await fetch(`${BACKEND_API_URL}/room/${roomId}/start`);

      if (!response.ok) throw new Error("Room not found");

      const updatedRoom = (await response.json()) as Room;
      setRoom(updatedRoom);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function onEndGame() {
    try {
      const response = await fetch(`${BACKEND_API_URL}/room/${roomId}/end`);

      if (!response.ok) throw new Error("Room not found");
    } catch (err: any) {
      setError(err.message);
    }
  }

  const getScore = (p: Player) => {
    const completedQuests = room?.board.quests
      .flat()
      .filter((q) => q.completedByPlayerId === p.id).length;
    return completedQuests || 0;
  };

  if (error)
    return (
      <div className="room-page">
        <Window>
          {error !== undefined && <h2>{error}</h2>}
          <Button
            id={""}
            text="Back to home"
            onClick={() => navigate("/")}
            icon="home"
            modifierClass="error-home-button"
          ></Button>
        </Window>
      </div>
    );

  return (
    <div className="room-page">
      {room === undefined && <Window>Joining room {roomId}</Window>}
      {room?.gameStarted ? (
        <div className="room-game-content">
          <div>
            <Board
              room={room}
              player={player}
              isPlaying={!room.gameEnded}
            ></Board>
          </div>
          <div className="room-game-info">
            <div className="room-game-stats">
              <h1>{room.gameEnded ? "Game ended!" : elapsed}</h1>
              {room.players.map((p) => (
                <div key={p.id} style={{ color: p.color }}>
                  <h1 className="player-score">
                    <span
                      className="name-edit-icon material-symbols-outlined"
                      style={{ color: p.color }}
                    >
                      person
                    </span>
                    {p.name}: {getScore(p)}
                  </h1>
                </div>
              ))}
            </div>
            <Chat roomId={roomId} playerId={player?.id}></Chat>
            {room?.gameStarted &&
              player?.id === room?.players?.[0]?.id &&
              !room.gameEnded && (
                <Button
                  id={""}
                  text="End game"
                  modifierClass="end-game-button"
                  type="secondary"
                  icon="flag"
                  onClick={() => onEndGame()}
                />
              )}
            {room?.gameStarted && room.gameEnded && (
              <Button
                id={""}
                onClick={() => navigate("/")}
                text="Home"
                icon="home"
                type="primary"
                modifierClass="end-game-button"
              />
            )}
          </div>
        </div>
      ) : (
        <Window modifierClass="room">
          <div className="room-content">
            <h1 className="title">
              Room{" "}
              <span
                style={{ color: player?.color, cursor: "pointer" }}
                onClick={() => navigator.clipboard.writeText(roomId)}
              >
                {roomId}
                <span className="title-icon material-symbols-outlined">
                  content_copy
                </span>
              </span>
            </h1>
            <div className="player-section">
              <div className="player-list">
                {room?.players.map((p) => {
                  const isHost = p.id === room.players[0].id;
                  const isYou = p.id === player?.id;

                  return (
                    <span
                      className="player"
                      key={p.id}
                      style={{ color: p.color }}
                    >
                      <span
                        className="name-edit-icon material-symbols-outlined"
                        style={{ color: p.color }}
                      >
                        person
                      </span>
                      {p.name}
                      {isYou && <span> (you)</span>}
                      {!isYou && isHost && <span> (host)</span>}
                    </span>
                  );
                })}
              </div>
              <Input
                label={"Player name"}
                id={"123"}
                onChange={(e) => setPlayerName(e.currentTarget.value)}
                value={playerName}
                invalidText={validatePlayerName(playerName)}
                onKeySubmit={() => onSetPlayerName(playerName)}
                onClickSubmit={() => onSetPlayerName(playerName)}
                buttonText="Change"
                buttonDisabled={player?.name === playerName}
              />
            </div>
          </div>
          <Chat roomId={roomId} playerId={player?.id} />
        </Window>
      )}
      <div className="button-bottom-section">
        {!room?.gameStarted && player?.id === room?.players?.[0]?.id && (
          <Button
            id={""}
            text="Start game"
            onClick={() => onStartGame()}
            modifierClass="start-game-button"
          />
        )}
        {!room?.gameStarted && (
          <Button
            id={""}
            onClick={() => navigate("/")}
            text="Back"
            type="secondary"
            modifierClass="home-button"
          />
        )}
      </div>
    </div>
  );
}

function RoomWrapper() {
  const { roomId } = useParams();
  return <JoinRoom roomId={roomId!} />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<RoomWrapper />} />
      </Routes>
    </Router>
  );
}
