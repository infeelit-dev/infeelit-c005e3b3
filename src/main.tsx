import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Infeelit failed to mount:", error);
  rootElement.innerHTML =
    '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Nunito,sans-serif;text-align:center;background:linear-gradient(180deg,hsl(187 50% 78%) 0%,hsl(25 85% 80%) 100%)">' +
    '<div><p style="font-size:18px;font-weight:700;color:#1a3a40;margin:0 0 8px">Infeelit</p>' +
    '<p style="font-size:14px;color:#1a3a40;margin:0">Loading error — please refresh or open in Firefox/Safari/Chrome.</p></div></div>';
}

window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);
});
