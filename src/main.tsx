import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import App from "./App";

// SIN WagmiProvider - solo React
console.log("Main: starting...");
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log("Main: rendered");
