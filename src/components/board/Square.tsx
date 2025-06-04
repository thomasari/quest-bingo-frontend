import { type PropsWithChildren } from "react";
import "./Board.scss";

interface Props {
  title: string;
  color: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  isClicked?: boolean;
}

function Square({
  title,
  color,
  onClick,
  isClicked,
}: PropsWithChildren<Props>) {
  return (
    <div
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      className={`square ${onClick ? "" : "disabled"} ${
        isClicked ? "clicked" : ""
      }`}
      style={{ backgroundColor: color }}
    >
      {title}
    </div>
  );
}

export default Square;
