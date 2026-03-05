import "./PlayerCard.scss";
import type { Player } from "../../types/types";
import { isBrightColor } from "../../utils/helpers";
import { useAppContext } from "../../context/context";

interface PlayerCardProps {
  player: Player;
  isHost: boolean;
  small?: boolean;
  isCorrectGuess?: boolean;
}

function PlayerCard({
  player,
  isHost,
  small,
  isCorrectGuess,
}: PlayerCardProps) {
  const { currentTheme } = useAppContext();
  const isBright = isBrightColor(player.color) && currentTheme === "light";

  const shadowStyle = isBright ? { ["-webkit-text-stroke"]: "2px #000" } : {};
  const outlineStyle = isBright
    ? {
        outline: "1px solid #000",
      }
    : {};

  return (
    <div
      style={{ borderColor: player.color, ...outlineStyle }}
      className={`player-card ${small ? " small" : ""} ${isCorrectGuess ? " correct-guess" : ""}`}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontVariationSettings: "'FILL' 1",
          color: player.color,
          ...shadowStyle,
        }}
      >
        {isHost ? "crown" : "person"}
      </span>
      <span
        style={{ color: player.color, ...shadowStyle }}
        className="player-name"
      >
        {player.name}
      </span>
      {player.score}
    </div>
  );
}

export default PlayerCard;
