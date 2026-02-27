import { useState } from "react";
import Button from "./components/button/Button";
import Input from "./components/input/Input";
import Modal from "./components/modal/Modal";
import { useAppContext } from "./context/context";
import { createRoom } from "./api";
import { motion } from "motion/react";
import "./Home.scss";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [roomId, setRoomId] = useState("");
  const { setCurrentRoom, setPlayer, isLoading, setIsLoading } =
    useAppContext();

  const navigate = useNavigate();

  async function onCreateRoom() {
    setIsLoading(true);
    const room = await createRoom();
    setCurrentRoom(room);
    setIsLoading(false);
    if (room) navigate(`/${room.id}`);
  }

  async function onJoinRoom() {
    setPlayer(null);
    navigate(`/${roomId}`);
  }

  const letters = "GJETT LÅTA".split("");

  function WaveText() {
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {letters.map((char, i) => (
          <motion.h1
            className="title"
            key={i}
            animate={{
              y: ["0%", "-10%", "0%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          >
            {char}
          </motion.h1>
        ))}
      </div>
    );
  }

  return (
    <div className="home-page">
      <WaveText />
      <div className="home">
        <div className="home-join-section">
          <Input
            placeholder="Kode"
            onChange={(v) => setRoomId(v.currentTarget.value.toUpperCase())}
            value={roomId}
            maxLength={5}
            modifierClass="room-code-input"
          />
          <Button
            icon="arrow_right_alt"
            text={"Bli med"}
            onClick={onJoinRoom}
            disabled={roomId.length !== 5}
          />
        </div>
        <span className="menu-divider">ELLER</span>
        <Button
          icon="arrow_right_alt"
          text={"Opprett rom"}
          onClick={onCreateRoom}
          type="secondary"
          isLoading={isLoading}
        />
        <Button
          icon="info"
          text="Hvordan spille"
          onClick={() => setShowHowToPlayModal(true)}
          type="secondary"
        />
      </div>
      {showHowToPlayModal && (
        <Modal
          title="Hvordan spille"
          onExit={() => setShowHowToPlayModal(false)}
        >
          <div className="how-to-play-content">hei</div>
        </Modal>
      )}
    </div>
  );
}
