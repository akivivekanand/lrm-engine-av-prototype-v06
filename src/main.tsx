import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// On browser refresh (new page load), clear all persisted app state
if (!sessionStorage.getItem("sessionActive")) {
  localStorage.clear();
}
sessionStorage.setItem("sessionActive", "1");

createRoot(document.getElementById("root")!).render(<App />);
