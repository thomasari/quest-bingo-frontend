import { useEffect, useState } from "react";
import Button from "./components/button/Button";
import Input from "./components/input/Input";
import Modal from "./components/modal/Modal";
import { useAppContext } from "./context/context";
import { createRoom } from "./api";
import { motion } from "motion/react";
import "./Home.scss";
import { useNavigate } from "react-router-dom";

const WaveText = () => {
  const letters = "GJETT LÅTA".split("");

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
};

export default function Home() {
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [roomId, setRoomId] = useState("");
  const { setCurrentRoom, setPlayer, isLoading, setIsLoading } =
    useAppContext();

  const navigate = useNavigate();

  useEffect(() => {
    setPlayer(null);
    setCurrentRoom(null);
  }, [setCurrentRoom, setPlayer]);

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
          <div className="how-to-play-content">
            <b>Opprett eller bli med</b>
            <p>
              For å starte spillet, kan du enten opprette et nytt rom eller bli
              med i et eksisterende rom ved å bruke en kode.
            </p>
            <b>Spilleregler</b>
            <p>
              Når spillet starter, vil en sang begynne å spille, og du må gjette
              sangens tittel. Skriv inn gjetningen din i chatten og send den
              inn. Jo raskere du gjetter riktig, desto flere poeng får du!
            </p>
            <b>Runder og modus</b>
            <p>
              Spillet består av opptil 30 runder, og hver runde varer i 30
              sekunder. Du vil få mer poeng jo raskere du gjetter riktig!
            </p>
            <b>Vinn spillet</b>
            <p>
              Etter et forhåndsbestemt antall runder, vil spilleren med flest
              poeng bli kåret til vinneren!
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
