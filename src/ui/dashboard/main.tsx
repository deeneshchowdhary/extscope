import React from "react";
import { createRoot } from "react-dom/client";
import { Dashboard } from "./Dashboard";
import "../styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Dashboard root element missing");

createRoot(container).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
