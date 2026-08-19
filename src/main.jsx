import React from "react";
import ReactDOM from "react-dom/client";
// Los estilos van antes que App para que el orden de capas de Tailwind
// (theme, base, components, utilities) quede fijado primero en el bundle.
import "@/styles/fonts.css";
import "@/index.css";
import App from "@/App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
