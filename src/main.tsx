import "./index.css";
import { MotionConfig } from "framer-motion";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// La intro depende del scroll: al recargar se parte desde arriba, salvo que la URL apunte a una sección.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!window.location.hash) window.scrollTo(0, 0);

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el elemento #root");

createRoot(root).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
