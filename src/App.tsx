/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.scss";
import Header from "./components/header/header";
import Home from "./Home";
import Room from "./Room";

export default function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:roomId" element={<Room />} />
        </Routes>
      </Router>
    </>
  );
}
