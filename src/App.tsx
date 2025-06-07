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
import SplitText from "./components/SplitText/SplitText";
import Modal from "./components/modal/Modal";
import Tooltip from "./components/tooltip/Tooltip";
import Switch from "./components/switch/Switch";

function applyTheme() {
  let theme = sessionStorage.getItem("theme");

  if (!theme) {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    theme = prefersDark ? "dark" : "light";
    sessionStorage.setItem("theme", theme);
  }

  document.documentElement.setAttribute("data-theme", theme);
}

function setTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  sessionStorage.setItem("theme", theme);
}

function getTheme(): "light" | "dark" {
  return (document.documentElement.getAttribute("data-theme") ||
    (sessionStorage.getItem("theme") as "light" | "dark") ||
    "light") as "light" | "dark";
}

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    applyTheme();
  }, []);

  const [roomId, setRoomId] = useState("");
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
    getTheme()
  );

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
      <Switch
        modifierClass="theme-switch"
        id={"theme-switch"}
        checked={currentTheme === "dark"}
        onChange={() => {
          setTheme(currentTheme === "dark" ? "light" : "dark");
          setCurrentTheme(getTheme());
        }}
      />
      <SplitText
        text="Quest Bingo"
        className="title"
        delay={50}
        duration={3}
        ease="elastic.out"
        splitType="chars"
        from={{ y: 40 }}
        to={{ y: 0 }}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
      />
      <div className="home">
        <Input
          placeholder="Room code"
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
        <Button
          id="create-room-button"
          icon="info"
          text="How to play"
          onClick={() => setShowHowToPlayModal(true)}
          type="secondary"
        />
      </div>
      {showHowToPlayModal && (
        <Modal title="How to play" onExit={() => setShowHowToPlayModal(false)}>
          <div className="how-to-play-content">
            <p>
              <strong>Quest Bingo</strong> is a multiplayer challenge game where
              all players join a lobby and share the same quest board. Everyone
              sees the same randomized quests, and the goal is to complete as
              many as possible before the game ends!
            </p>

            <h3>
              <span className="material-symbols-outlined">gavel</span>Game
              Rules:
            </h3>
            <ul>
              <li>
                Quests can be completed in <em>any game</em> that fits the
                description (e.g., "Kill a zombie").
              </li>
              <li>
                You may only use the same game to complete{" "}
                <strong>up to 3 quests</strong>.
              </li>
              <li>
                You are encouraged to <strong>start from a new save</strong>{" "}
                when beginning a game, to keep it fair.
              </li>
              <li>
                It is <strong>not allowed</strong> to help other players
                complete their quests.
              </li>
              <li>
                Clicking a quest marks it as completed and locks it for other
                players. You can re-open a quest by clicking again.
              </li>
              <li>
                The game ends when <strong>all quests are completed</strong> or
                the <strong>host ends the game manually</strong>.
              </li>
              <li>
                The player with the most completed quests at the end wins!
              </li>
            </ul>

            <h3>
              <span className="material-symbols-outlined">star</span>Tips:
            </h3>
            <ul>
              <li>Coordinate with others to avoid overlapping efforts.</li>
              <li>
                Pick games that let you efficiently complete multiple quests.
              </li>
              <li>Be quick — only one player can complete each quest!</li>
              <li>
                Optional: Take a screenshot or clip when completing a quest for
                proof.
              </li>
              <li>Have fun, be creative, and embrace the chaos!</li>
            </ul>
          </div>
        </Modal>
      )}
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

  useEffect(() => {
    applyTheme();
  }, []);

  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
    getTheme()
  );

  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

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

  function onCopyRoom(e: React.MouseEvent) {
    navigator.clipboard.writeText(roomId);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 3000);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }

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
      <Switch
        modifierClass="theme-switch"
        id={"theme-switch"}
        checked={currentTheme === "dark"}
        onChange={() => {
          setTheme(currentTheme === "dark" ? "light" : "dark");
          setCurrentTheme(getTheme());
        }}
      />
      {room === undefined ? (
        <div>Joining room {roomId}</div>
      ) : room?.gameStarted ? (
        <div className="room-game-content">
          <div className="board-section">
            <Board
              room={room}
              player={player}
              isPlaying={!room.gameEnded}
            ></Board>
            <div className="room-player-scores">
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
          </div>
          <div className="room-game-info">
            <div className="room-game-stats">
              <h1 className="timer">
                {room.gameEnded ? "Game ended!" : elapsed}
              </h1>
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
            <h1 className="room-title">
              Room{" "}
              <span
                style={{ color: "var(--primary)", cursor: "pointer" }}
                onClick={(e) => onCopyRoom(e)}
              >
                {roomId}
                <span className="title-icon material-symbols-outlined">
                  content_copy
                </span>
              </span>
              {showCopyTooltip && (
                <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                  Copied to clipboard!
                </Tooltip>
              )}
            </h1>
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
          <Chat roomId={roomId} playerId={player?.id} />
        </Window>
      )}
      {room !== undefined && (
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
      )}
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
