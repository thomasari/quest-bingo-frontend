import type { PropsWithChildren } from "react";
import "./Tooltip.scss";

interface Props {
  x: number;
  y: number;
  modifierClass?: string;
}

function Tooltip({ x, y, children, modifierClass }: PropsWithChildren<Props>) {
  return (
    <div
      className={`tooltip ${modifierClass ?? ""}`}
      style={{
        position: "fixed",
        top: y + 10,
        left: x + 10,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}

export default Tooltip;
