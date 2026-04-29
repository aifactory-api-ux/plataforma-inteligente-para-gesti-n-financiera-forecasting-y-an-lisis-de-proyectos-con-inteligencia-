import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App>
      <div className="min-h-screen bg-surface-background">
        <h1 className="text-3xl font-bold text-primary-navy">FinSight Platform</h1>
        <p className="text-neutral-600 mt-2">Intelligent Financial Management & Forecasting</p>
      </div>
    </App>
  </React.StrictMode>
);
