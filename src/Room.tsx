import { useEffect, useRef, useState } from "react";
import Button from "./components/button/Button";
import Input from "./components/input/Input";
import { useAppContext } from "./context/context";
import { getRoom, joinRoom, setGamemode, startGame } from "./api";
import "./Room.scss";
import Chat from "./components/chat/Chat";
import { Hue } from "@uiw/react-color";
import { hsvaToHexa } from "@uiw/color-convert";
import Dropdown from "./components/dropdown/Dropdown";
import PlayerCard from "./components/playercard/PlayerCard";
import type { ChatMessage, SongDto } from "./types/types";
import { useParams } from "react-router-dom";
import useRoomSignalR from "./useRoomSignalR";
import { motion } from "motion/react";
import Tooltip from "./components/tooltip/Tooltip";

const GamemodeOptions = [
  { value: "AllTime", label: "Alle tidsaldre" },
  { value: "Seventies", label: "70-tallet" },
  { value: "Eighties", label: "80-tallet" },
  { value: "Nineties", label: "90-tallet" },
  { value: "TwoThousands", label: "2000-tallet" },
  { value: "TwentyTens", label: "2010-tallet" },
  { value: "TwentyTwenties", label: "2020-tallet" },
];

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();

  const { player, currentRoom, setCurrentRoom, setPlayer } = useAppContext();

  const [playerName, setPlayerName] = useState("");
  const [playerNameError, setPlayerNameError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongDto | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [hsva, setHsva] = useState({ h: 24, s: 100, v: 100, a: 1 });
  const hex = hsvaToHexa(hsva);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [selectedGamemode, setSelectedGamemode] = useState(
    GamemodeOptions[0].value,
  );

  const audioRef = useRef<HTMLAudioElement>(null);

  /* ------------------- SignalR Hook ------------------- */

  const { sendChat, sendGuess } = useRoomSignalR(roomId, {
    onRoomUpdate: setCurrentRoom,
    onSongStarted: setCurrentSong,
    onCorrectGuess: (playerId: string, newScore: number) => {
      setCurrentRoom((prev) =>
        prev
          ? {
              ...prev,
              players: prev.players.map((p) =>
                p.id === playerId ? { ...p, score: newScore } : p,
              ),
            }
          : prev,
      );
    },
    onChat: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
    onGameEnded: (room) => {
      setCurrentRoom(room);
    },
  });

  /* ------------------- Fetch Room ------------------- */

  useEffect(() => {
    async function fetchRoom() {
      if (!roomId) return;
      setIsFetching(true);
      const room = await getRoom(roomId);
      setCurrentRoom(room);
      setIsFetching(false);
    }

    if (!currentRoom) fetchRoom();
  }, [currentRoom, roomId, setCurrentRoom]);

  /* ------------------- Handlers ------------------- */

  async function onJoinRoom() {
    if (!currentRoom) return;

    const joined = await joinRoom(currentRoom.id, {
      name: playerName,
      color: hex === "#000" ? "var(--text)" : hex,
    });

    setCurrentRoom(joined?.room || null);
    setPlayer(joined?.newPlayer || null);
  }

  async function onStartGame() {
    if (currentRoom) await startGame(currentRoom.id);
  }

  async function onChangedGamemode(value: string) {
    setSelectedGamemode(value);
    if (currentRoom) await setGamemode(currentRoom.id, value);
  }

  function validateAndSetPlayerName(name: string) {
    const valid = name.replace(/[^a-zA-Z0-9 _\p{Emoji_Presentation}]/gu, "");
    setPlayerName(valid);
    setPlayerNameError(valid.length === 0 ? "Navnet kan ikke være tomt" : null);
  }

  function handleSend(message: string) {
    if (!player || !currentRoom) return;

    if (currentRoom.game?.currentRound?.state === "Playing") {
      sendGuess(player.id, message);
    } else {
      sendChat(currentRoom.id, player.id, message);
    }
  }

  /* ------------------- UI States ------------------- */

  if (isFetching)
    return (
      <div className="room-page">
        <h2>Laster inn rom...</h2>
      </div>
    );

  if (!currentRoom)
    return (
      <div className="room-page">
        <h2>Fant ikke rommet med id {roomId}</h2>
      </div>
    );

  if (!player)
    return (
      <div className="room-page">
        <div className="room">
          <h2 className="joining-room-title">Bli med i {roomId}</h2>

          <Input
            label="Spillernavn"
            value={playerName}
            invalidText={playerNameError}
            maxLength={20}
            onChange={(v) => validateAndSetPlayerName(v.target.value)}
            modifierStyle={{ color: hex }}
          />

          <Hue
            hue={hsva.h}
            onChange={(c) => setHsva({ ...hsva, ...c })}
            width="100%"
            height="4rem"
          />

          <Button text="Bli med" disabled={!playerName} onClick={onJoinRoom} />
        </div>
      </div>
    );

  if (!currentRoom.game?.startedAt) {
    return (
      <div className="room-page">
        <WaveText
          roomId={roomId || ""}
          showCopyTooltip={showCopyTooltip}
          setShowCopyTooltip={setShowCopyTooltip}
          tooltipPosition={tooltipPosition}
          setTooltipPosition={setTooltipPosition}
        />
        <div className="lobby-page">
          <div className="lobby">
            <div className="players-area">
              <h3 className="players-title">SPILLERE</h3>
              <div className="players">
                {currentRoom.players.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isHost={currentRoom.host?.id === p.id}
                  />
                ))}
              </div>
            </div>
            {currentRoom.host?.id === player.id ? (
              <Dropdown
                modifierClass="gamemode-dropdown"
                label="Modus"
                options={GamemodeOptions}
                onChange={(value) => onChangedGamemode(value)}
                defaultValue={selectedGamemode}
              />
            ) : null}
            {currentRoom.host?.id === player.id ? (
              <Button
                text={"Start spillet"}
                onClick={onStartGame}
                modifierClass="start-button"
              />
            ) : (
              <h3 className="color-title">
                Venter på at verten skal starte spillet...
              </h3>
            )}
          </div>
          <Chat
            room={currentRoom}
            player={player}
            messages={messages}
            sendMessage={handleSend}
          />
        </div>
      </div>
    );
  }

  if (!currentRoom.game.currentRound?.startedAt && !currentRoom.game.ended)
    return (
      <div className="room-page">
        <h2>Laster inn sang...</h2>
      </div>
    );

  if (currentRoom.game.ended) {
    const sortedPlayers = [...currentRoom.players].sort(
      (a, b) => b.score - a.score,
    );

    const [gold, silver, bronze] = sortedPlayers;

    return (
      <div className="game-page">
        <h2 className="game-over-title">Spillet er ferdig!</h2>

        <div className="podium">
          {silver && (
            <div className="podium-place silver">
              <div className="medal">🥈</div>
              <div className="name" style={{ color: silver.color }}>
                {silver.name}
              </div>
              <div className="score">{silver.score} poeng</div>
            </div>
          )}

          {gold && (
            <div className="podium-place gold">
              <div className="medal">🥇</div>
              <div className="name" style={{ color: gold.color }}>
                {gold.name}
              </div>
              <div className="score">{gold.score} poeng</div>
            </div>
          )}

          {bronze && (
            <div className="podium-place bronze">
              <div className="medal">🥉</div>
              <div className="name" style={{ color: bronze.color }}>
                {bronze.name}
              </div>
              <div className="score">{bronze.score} poeng</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ------------------- Game View ------------------- */

  return (
    <div className="game-page">
      <div className="song-area">
        <div className="song-mask">
          {currentRoom.game.currentRound?.maskedName.split("").map((c, i) => (
            <span key={i}>{c === " " ? "\u00A0\u00A0" : c}</span>
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        autoPlay
        src={currentSong?.previewUrl}
        onTimeUpdate={(e) =>
          setCurrentTime((e.target as HTMLAudioElement).currentTime)
        }
      />

      <div className="song-timer">
        0:{Math.floor(currentTime).toString().padStart(2, "0")} / 0:30
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(currentTime / 30) * 100}%` }}
        />
      </div>

      <div className="game-area">
        <div className="game-players-area">
          {currentRoom.players.map((p) => (
            <PlayerCard
              key={p.id}
              small
              player={p}
              isHost={currentRoom.host?.id === p.id}
              isCorrectGuess={
                p.id in (currentRoom.game?.currentRound?.playerScores ?? {})
              }
            />
          ))}
        </div>

        <Chat
          room={currentRoom}
          player={player}
          messages={messages}
          sendMessage={handleSend}
        />
      </div>
    </div>
  );
}

interface WaveTextProps {
  roomId: string;
  showCopyTooltip: boolean;
  setShowCopyTooltip: (show: boolean) => void;
  tooltipPosition: { x: number; y: number };
  setTooltipPosition: (pos: { x: number; y: number }) => void;
}

function WaveText({
  roomId,
  showCopyTooltip,
  setShowCopyTooltip,
  tooltipPosition,
  setTooltipPosition,
}: WaveTextProps) {
  const url = `gjettlåta.no/${roomId}`;
  const letters = url.split("");

  function onCopyRoom(e: React.MouseEvent) {
    navigator.clipboard.writeText(url);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 3000);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }

  return (
    <div
      className="room-code"
      style={{ display: "flex", gap: 2 }}
      onClick={(e) => onCopyRoom(e)}
    >
      {letters.map((char, i) => (
        <motion.h1
          key={i}
          className="room-title"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        >
          {char}
        </motion.h1>
      ))}

      <motion.span
        className="material-symbols-outlined copy-icon"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: letters.length * 0.1,
        }}
      >
        content_copy
      </motion.span>
      {showCopyTooltip && (
        <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
          Kopiert!
        </Tooltip>
      )}
    </div>
  );
}
