// src/App.jsx
import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import Menu from "./components/shared/Menu";

const App = () => {
  return (
    <div>
      <Menu />
      <main>
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
