import "./PlayerCard.scss";
import type { Player } from "../../types/types";
import { isBrightColor } from "../../utils/helpers";

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
  const isBright = isBrightColor(player.color);
  const shadowStyle = isBright ? { ["-webkit-text-stroke"]: "0.5px #000" } : {};
  const outlineStyle = isBright
    ? { outline: "0.5px solid #000, -0.5px solid #000" }
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
