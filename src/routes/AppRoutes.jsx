// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Index from "../pages/index/Index";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import TurnosPaciente from "../pages/TurnosPaciente";
import PanelAdmin from "../pages/PanelAdmin";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Registro />} />
    <Route path="/paciente" element={<TurnosPaciente />} />
    <Route path="/admin" element={<PanelAdmin />} />
  </Routes>
);