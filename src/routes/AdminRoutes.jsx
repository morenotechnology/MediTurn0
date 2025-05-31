// src/routes/AdminRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import PanelAdmin from "../pages/PanelAdmin";

const isAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.cedula === "admin"
;
};

export const AdminRoutes = () => {
  return (
    <Routes>
      {isAuthenticated() ? (
        <Route path="/admin" element={<PanelAdmin />} />
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};