import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { EditorApp } from "./components/editor/EditorApp";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EditorApp />
  </StrictMode>,
);
