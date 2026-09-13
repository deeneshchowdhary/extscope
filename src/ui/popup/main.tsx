import React from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "./Popup";
import "../styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Popup root element missing");

createRoot(container).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
