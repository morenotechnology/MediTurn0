// src/hooks/useTurno.js
import { useContext } from "react";
import { TurnoContext } from "../context/TurnoContext";

const useTurno = () => {
  const context = useContext(TurnoContext);
  if (!context) {
    throw new Error("useTurno debe usarse dentro de un TurnoProvider");
  }
  return context;
};

export default useTurno;