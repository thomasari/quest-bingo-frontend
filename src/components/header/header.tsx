import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/context";
import Button from "../button/Button";
import Switch from "../switch/Switch";
import "./header.scss";

export default function Header() {
  const { currentTheme, setCurrentTheme } = useAppContext();
  const navigate = useNavigate();
  return (
    <header className="header">
      <Button
        id={""}
        text={""}
        onClick={() => navigate("/")}
        icon={"home"}
        type="tertiary"
      />
      <Switch
        modifierClass="theme-switch"
        id={"theme-switch"}
        checked={currentTheme === "dark"}
        onChange={() => {
          setCurrentTheme(currentTheme === "dark" ? "light" : "dark");
        }}
      />
    </header>
  );
}
