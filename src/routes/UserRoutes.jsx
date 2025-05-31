// src/routes/UserRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import TurnosPaciente from "../pages/TurnosPaciente";

const isAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.role === "paciente";
};

export const UserRoutes = () => {
  return (
    <Routes>
      {isAuthenticated() ? (
        <Route path="/paciente" element={<TurnosPaciente />} />
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};