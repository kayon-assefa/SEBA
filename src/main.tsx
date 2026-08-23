import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";           // ← add this line

import App from "./App";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { LanguageProvider } from "./features/auth/context/Languagecontext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <Toaster position="top-right" />
        <App />
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);