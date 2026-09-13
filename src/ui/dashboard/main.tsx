import React from "react";
import { createRoot } from "react-dom/client";
import { Dashboard } from "./Dashboard";
import "../styles.css";

async function bootstrap() {
  if (import.meta.env.DEV && typeof (globalThis as { chrome?: unknown }).chrome === "undefined") {
    const { installChromeMock } = await import("../../dev/chrome-mock");
    installChromeMock();
  }

  const container = document.getElementById("root");
  if (!container) throw new Error("Dashboard root element missing");

  createRoot(container).render(
    <React.StrictMode>
      <Dashboard />
    </React.StrictMode>
  );
}

void bootstrap();
