import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { DemoProvider } from "./DemoContext";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("App root element is missing.");

createRoot(root).render(
  <StrictMode>
    <DemoProvider><App /></DemoProvider>
  </StrictMode>,
);
