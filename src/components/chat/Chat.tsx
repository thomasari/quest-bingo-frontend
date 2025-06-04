import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";
import "./Chat.scss";
import type { ChatMessage } from "../../types/types";
import Input from "../input/Input";
import { BACKEND_API_URL } from "../../../globals";

interface Props {
  roomId: string;
  modifierClass?: string;
  playerId: string | undefined;
}

function Chat({ roomId, modifierClass, playerId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState<HubConnection | null>(null);

  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const loadChatHistory = async () => {
      const res = await fetch(`${BACKEND_API_URL}/room/${roomId}/chat`);
      if (res.ok) {
        const history = (await res.json()) as ChatMessage[];
        setMessages(history);
      }
    };

    loadChatHistory();
  }, [roomId]);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(`${BACKEND_API_URL}/hub/room?roomId=${roomId}`)
      .withAutomaticReconnect()
      .build();

    conn.on(
      "ReceiveChat",
      (senderName: string, senderColor: string, message: string) => {
        setMessages((prev) => [
          ...prev,
          {
            sender: {
              name: senderName,
              color: senderColor,
            },
            message,
          },
        ]);
      }
    );

    conn.start().then(() => setConnection(conn));

    return () => {
      conn.stop();
    };
  }, [roomId]);

  async function sendMessage() {
    if (
      newMessage.trim().length === 0 ||
      !connection ||
      connection.state !== "Connected" ||
      playerId === undefined
    )
      return;

    await connection.invoke("SendChat", roomId, playerId, newMessage);
    setNewMessage("");
  }

  return (
    <div className={`chat ${modifierClass ?? ""}`}>
      <div className="chat-log" ref={chatLogRef}>
        {messages.map((m, i) => (
          <div key={i} className="chat-message">
            <span className="chat-sender" style={{ color: m.sender.color }}>
              {m.sender.name}:
            </span>{" "}
            {m.message}
          </div>
        ))}
      </div>
      <Input
        onChange={(e) => setNewMessage(e.target.value)}
        value={newMessage}
        onKeySubmit={sendMessage}
        onClickSubmit={sendMessage}
        id="chat-input"
        buttonText="Send"
      ></Input>
    </div>
  );
}

export default Chat;
