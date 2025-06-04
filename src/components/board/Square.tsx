import { useState, type PropsWithChildren } from "react";
import "./Board.scss";

interface Props {
  title: string;
  color?: string;
  onClick: React.MouseEventHandler<HTMLElement>;
}

function Square({ title, color, onClick }: PropsWithChildren<Props>) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      onClick={(e) => {
        onClick(e);
        setIsPressed((t) => !t);
      }}
      className={`square`}
      style={{ backgroundColor: isPressed ? color : "white" }}
    >
      {title}
    </div>
  );
}

export default Square;
