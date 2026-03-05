import { useEffect, useRef, useState } from "react";
import Button from "./components/button/Button";
import Input from "./components/input/Input";
import { useAppContext } from "./context/context";
import {
  getRoom,
  joinRoom,
  restartGame,
  setGamemode,
  setRounds,
  startGame,
} from "./api";
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
import { Textfit } from "react-textfit";
import { isBrightColor } from "./utils/helpers";

const GamemodeOptions = [
  { value: "AllTime", label: "Alle tidsaldre" },
  { value: "Seventies", label: "70-tallet" },
  { value: "Eighties", label: "80-tallet" },
  { value: "Nineties", label: "90-tallet" },
  { value: "TwoThousands", label: "2000-tallet" },
  { value: "TwentyTens", label: "2010-tallet" },
  { value: "TwentyTwenties", label: "2020-tallet" },
];

const RoundOptions = [
  { value: 5, label: "5 runder" },
  { value: 10, label: "10 runder" },
  { value: 15, label: "15 runder" },
  { value: 20, label: "20 runder" },
  { value: 25, label: "25 runder" },
  { value: 30, label: "30 runder" },
];

const dummyPlayers = [
  { id: "1", name: "Alice", color: "#ff0000", score: 10 },
  { id: "2", name: "Bob", color: "#00ff00", score: 20 },
  { id: "3", name: "Charlie", color: "#0000ff", score: 15 },
  { id: "12", name: "Alice", color: "#ff0000", score: 10 },
  { id: "23", name: "Bob", color: "#00ff00", score: 20 },
  { id: "34", name: "Charlie", color: "#0000ff", score: 15 },
  { id: "15", name: "Alice", color: "#ff0000", score: 10 },
  { id: "25", name: "Bob", color: "#00ff00", score: 20 },
  { id: "35", name: "Charlie", color: "#0000ff", score: 15 },
  { id: "16", name: "Alice", color: "#ff0000", score: 10 },
  { id: "26", name: "Bob", color: "#00ff00", score: 20 },
  { id: "36", name: "Charlie", color: "#0000ff", score: 15 },
  { id: "17", name: "Alice", color: "#ff0000", score: 10 },
  { id: "27", name: "Bob", color: "#00ff00", score: 20 },
  { id: "37", name: "Charlie", color: "#0000ff", score: 15 },
];

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();

  const { player, currentRoom, setCurrentRoom, setPlayer, currentTheme } =
    useAppContext();

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

  const [selectedRounds, setSelectedRounds] = useState(RoundOptions[2].value);

  const audioRef = useRef<HTMLAudioElement>(null);

  /* ------------------- SignalR Hook ------------------- */

  const { sendChat, sendGuess } = useRoomSignalR(roomId, {
    onRoomUpdate: setCurrentRoom,
    onSongStarted: setCurrentSong,
    onCorrectGuess: (songName) => {
      setCurrentSong((s) => s && { ...s, displayName: songName });
    },
    onRoundEnded: (correctAnswer, intermissionEndsAt) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        console.log(intermissionEndsAt);
      }
      setCurrentSong((s) => s && { ...s, name: correctAnswer });
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

  async function onRestartGame() {
    if (currentRoom) await restartGame(currentRoom.id);
  }

  async function onChangedGamemode(value: string) {
    setSelectedGamemode(value);
    if (currentRoom) await setGamemode(currentRoom.id, value);
  }

  async function onChangedRounds(value: number) {
    setSelectedRounds(value);
    if (currentRoom) await setRounds(currentRoom.id, value);
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

  const isBright = isBrightColor(hex) && currentTheme === "light";

  const shadowStyle = isBright ? { ["-webkit-text-stroke"]: "2px #000" } : {};

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
            modifierStyle={{ color: hex, ...shadowStyle }}
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
                    small={currentRoom.players.length > 6}
                  />
                ))}
              </div>
            </div>
            <div
              className={`settings-area ${currentRoom.host?.id === player.id ? "" : "col"}`}
            >
              {currentRoom.host?.id === player.id ? (
                <Dropdown
                  modifierClass="gamemode-dropdown"
                  label="Modus"
                  options={GamemodeOptions}
                  onChange={(value) => onChangedGamemode(value as string)}
                  defaultValue={selectedGamemode}
                />
              ) : (
                <div>
                  <h3 className="players-title">
                    MODUS:{" "}
                    <span>
                      {" "}
                      {
                        GamemodeOptions.find(
                          (o) => o.value === currentRoom.game?.gameMode,
                        )?.label
                      }
                    </span>
                  </h3>
                </div>
              )}
              {currentRoom.host?.id === player.id ? (
                <Dropdown
                  modifierClass="gamemode-dropdown"
                  label="Antall runder"
                  options={RoundOptions}
                  onChange={(value) => onChangedRounds(value as number)}
                  defaultValue={selectedRounds}
                />
              ) : (
                <div>
                  <h3 className="players-title">
                    RUNDER: <span>{currentRoom.game?.totalRounds}</span>
                  </h3>
                </div>
              )}
            </div>
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
            <div className="podium-wrapper">
              <span className="place silver">2</span>
              <div className="podium-place silver">
                <Textfit mode="single" max={64} className="name">
                  {silver.name}
                </Textfit>
                <Textfit mode="single" max={64} className="score silver">
                  {silver.score}
                </Textfit>
              </div>
            </div>
          )}

          {gold && (
            <div className="podium-wrapper">
              <span className="place gold">1</span>
              <div className="podium-place gold">
                <Textfit mode="single" max={64} className="name">
                  {gold.name}
                </Textfit>
                <Textfit mode="single" max={64} className="score gold">
                  {gold.score}
                </Textfit>
              </div>
            </div>
          )}

          {bronze && (
            <div className="podium-wrapper">
              <span className="place bronze">3</span>
              <div className="podium-place bronze">
                <Textfit mode="single" max={64} className="name">
                  {bronze.name}
                </Textfit>
                <Textfit mode="single" max={64} className="score bronze">
                  {bronze.score}
                </Textfit>
              </div>
            </div>
          )}
        </div>
        {player.id === currentRoom.host?.id && (
          <Button
            text={"Tilbake til lobby"}
            onClick={onRestartGame}
            modifierClass="restart-button"
          />
        )}
      </div>
    );
  }

  /* ------------------- Game View ------------------- */

  const isPlayerGuessedCorrectly =
    (currentRoom.game?.currentRound?.playerScores &&
      player.id in currentRoom.game.currentRound.playerScores) ??
    false;

  const chunkSize = 10;

  const playerColumns = [];
  for (let i = 0; i < currentRoom.players.length; i += chunkSize) {
    playerColumns.push(currentRoom.players.slice(i, i + chunkSize));
  }

  return (
    <div className="game-page">
      <div className={`song-area ${isPlayerGuessedCorrectly ? "correct" : ""}`}>
        <div className={`song-mask`}>
          {(isPlayerGuessedCorrectly && currentSong
            ? currentSong.displayName
            : currentRoom.game.currentRound?.maskedName) ||
            ""
              .split("")
              .map((c, i) => (
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
        <span>
          {`0:${Math.floor(currentTime).toString().padStart(2, "0")} / 0:30`}
        </span>
        <span>{`Runde ${currentRoom.game?.currentRoundIndex + 1} / ${currentRoom.game?.totalRounds}`}</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(currentTime / 30) * 100}%` }}
        />
      </div>

      <div className="game-area">
        <div className="game-players-area">
          {playerColumns.map((column, i) => (
            <div key={i} className="player-column">
              {column.map((p) => (
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
    navigator.clipboard.writeText(`https://www.${url}`);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 3000);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }

  return (
    <div className="room-code-wrapper">
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
    </div>
  );
}
