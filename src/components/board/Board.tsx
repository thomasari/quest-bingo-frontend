import type { Player, Room } from "../../types/types";
import Square from "./Square";
import "./Board.scss";
import { BACKEND_API_URL } from "../../../globals";

interface Props {
  room: Room;
  player?: Player;
  isPlaying: boolean;
}

function Board({ room, player, isPlaying }: Props) {
  async function handleSquareClick(questId: string) {
    const quest = room.board.quests.flat().find((q) => q.id === questId);
    if (!quest) return;

    if (quest.completedByPlayerId && quest.completedByPlayerId !== player?.id) {
      console.warn(
        "Cannot complete quest, another player already completed it."
      );
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/room/${room.id}/quest/${questId}`,
        {
          method: "PATCH",
          body: JSON.stringify(player?.id),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Quest not found");
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("Unknown error", err);
      }
    }
  }

  function getColorFromPlayer(playerId: string | null): string {
    if (!playerId) return "var(--bg)";
    const playerColor = room.players.find((p) => p.id === playerId)?.color;
    return playerColor || "var(--bg)";
  }

  return (
    <div className="board">
      {room.board.quests.flat().map((q, i) => {
        const isTakenByOther =
          q.completedByPlayerId !== null &&
          q.completedByPlayerId !== player?.id;

        return (
          <Square
            onClick={
              !isPlaying || isTakenByOther
                ? undefined
                : async () => await handleSquareClick(q.id)
            }
            color={getColorFromPlayer(q.completedByPlayerId)}
            title={q.text}
            key={`${q.id}_${i}`}
            isClicked={q.completedByPlayerId !== null}
          />
        );
      })}
    </div>
  );
}

export default Board;
