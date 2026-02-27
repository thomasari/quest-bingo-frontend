import { useEffect, useRef, useState } from "react";
import "./Chat.scss";
import type { ChatMessage, Player, RoomDto } from "../../types/types";
import Input from "../input/Input";
import Button from "../button/Button";

interface Props {
  room: RoomDto;
  player: Player;
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  modifierClass?: string;
}

function Chat({ room, player, messages, sendMessage, modifierClass }: Props) {
  const [newMessage, setNewMessage] = useState("");
  const chatLogRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll */
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend() {
    if (newMessage.trim().length === 0) return;
    sendMessage(newMessage);
    setNewMessage("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  const currentRound = room.game?.currentRound;

  const hasGuessed =
    currentRound &&
    currentRound.playerScores &&
    player.id in currentRound.playerScores;

  const disabled =
    ((room.game?.currentRound?.state === "Playing" && hasGuessed) ?? false) ||
    room.game?.currentRound?.state === "Intermission";

  return (
    <div className={`chat ${modifierClass ?? ""}`}>
      <div className="chat-log" ref={chatLogRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-message ${m.isSystemMessage ? "system" : ""}`}
            style={m.isSystemMessage ? { color: m.sender.color } : {}}
          >
            {!m.isSystemMessage && (
              <span className="chat-sender" style={{ color: m.sender.color }}>
                {m.sender.name}:
              </span>
            )}
            {!m.isSystemMessage && " "}
            {m.message}
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        <Button
          text={room.game?.currentRound?.state === "Playing" ? "Gjett" : "Send"}
          onClick={handleSend}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default Chat;
