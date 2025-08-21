// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../server/context/Authcontext"; // ✅
import { ActiveScreenProvider } from "../src/ActiveScreenContext";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <ActiveScreenProvider>
        <App />
      </ActiveScreenProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
