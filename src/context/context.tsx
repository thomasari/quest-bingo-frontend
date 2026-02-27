import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type ContextType = {
  currentTheme: "light" | "dark";
  setCurrentTheme: Dispatch<SetStateAction<"light" | "dark">>;
  currentRoom: RoomDto | null;
  setCurrentRoom: Dispatch<SetStateAction<RoomDto | null>>;
  player: Player | null;
  setPlayer: Dispatch<SetStateAction<Player | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

const Context = createContext<ContextType>({} as ContextType);

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  return useContext(Context);
}

import type { ReactNode } from "react";
import type { Player, RoomDto } from "../types/types";

export default function ContextProvider({ children }: { children: ReactNode }) {
  function applyTheme() {
    let theme = sessionStorage.getItem("theme");

    if (!theme) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      theme = prefersDark ? "dark" : "light";
      sessionStorage.setItem("theme", theme);
    }

    document.documentElement.setAttribute("data-theme", theme);
  }

  function getTheme(): "light" | "dark" {
    return (document.documentElement.getAttribute("data-theme") ||
      (sessionStorage.getItem("theme") as "light" | "dark") ||
      "light") as "light" | "dark";
  }

  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
    getTheme(),
  );

  const [currentRoom, setCurrentRoom] = useState<RoomDto | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    applyTheme();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    sessionStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  return (
    <Context.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        currentRoom,
        setCurrentRoom,
        player,
        setPlayer,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </Context.Provider>
  );
}
