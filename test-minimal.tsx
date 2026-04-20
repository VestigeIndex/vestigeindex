import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Minimal test component - no Web3 dependencies
function TestApp() {
  return (
    <div className="min-h-screen bg-red-600 flex items-center justify-center">
      <h1 className="text-4xl text-white font-bold">
        TEST - If you see RED, CSS works!
      </h1>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);