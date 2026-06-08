import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { MikokoProvider } from "./hooks/useMikoko.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MikokoProvider>
      <App />
    </MikokoProvider>
  </React.StrictMode>
);
