// Example only — merge into your real src/main.tsx / src/App.tsx.
// Shows the two providers every auth page needs, plus the toaster
// Register.tsx uses and the shared animation stylesheet.

import { BrowserRouter, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { LanguageProvider } from "./features/auth/context/Languagecontext";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { authRoutes } from "./features/auth/routes.example";

import "./features/auth/styles/auth.css";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" />
          <Routes>{authRoutes}</Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
