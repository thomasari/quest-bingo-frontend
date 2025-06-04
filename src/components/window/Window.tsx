import type { PropsWithChildren } from "react";
import "./Window.scss";

interface Props {
  modifierClass?: string;
}

function Window({ modifierClass, children }: PropsWithChildren<Props>) {
  return <div className={`window ${modifierClass ?? ""}`}>{children}</div>;
}

export default Window;
