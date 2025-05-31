// src/context/TurnoContext.jsx
import { createContext, useContext, useState } from "react";

const TurnoContext = createContext();

export const TurnoProvider = ({ children }) => {
  const [turnoActual, setTurnoActual] = useState(10);
  const [cola, setCola] = useState([11, 12, 13]);
  const [miTurno, setMiTurno] = useState(null);

  const pedirTurno = () => {
    const nuevo = cola[cola.length - 1] + 1;
    setCola([...cola, nuevo]);
    setMiTurno(nuevo);
  };

  const atenderSiguiente = () => {
    if (cola.length === 0) return;
    const siguiente = cola[0];
    setTurnoActual(siguiente);
    setCola(cola.slice(1));
  };

  return (
    <TurnoContext.Provider value={{
      turnoActual,
      cola,
      miTurno,
      pedirTurno,
      atenderSiguiente
    }}>
      {children}
    </TurnoContext.Provider>
  );
};

export const useTurnoContext = () => useContext(TurnoContext);