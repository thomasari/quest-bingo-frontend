import type { PropsWithChildren } from "react";
import "./Modal.scss";

interface Props {
  onExit?: () => void;
  title?: string;
  modifierClass?: string;
}

function Modal({
  modifierClass,
  onExit,
  title,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="modal-background" onClick={onExit}>
      <div
        className={`modal ${modifierClass ?? ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="material-symbols-outlined modal-close-button"
          onClick={onExit}
        >
          close
        </span>
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
