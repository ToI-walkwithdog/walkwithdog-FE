import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { DemoProvider } from "./DemoContext";
import { SessionProvider } from "./session";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("App root element is missing.");

createRoot(root).render(
  <StrictMode>
    <SessionProvider><DemoProvider><App /></DemoProvider></SessionProvider>
  </StrictMode>,
);
