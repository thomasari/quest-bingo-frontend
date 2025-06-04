import type { Player, Room } from "../../types/types";
import Square from "./Square";
import "./Board.scss";

interface Props {
  room: Room;
  player?: Player;
  onUpdate: () => void;
}

function Board({ room, player, onUpdate }: Props) {
  return (
    <div className="board">
      {room.board.quests.flat().map((q, i) => (
        <Square
          onClick={onUpdate}
          color={player?.color}
          title={q.text}
          key={`${q.id}_${i}`}
        />
      ))}
    </div>
  );
}

export default Board;
