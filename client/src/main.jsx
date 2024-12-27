import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/ui/toaster";
import { UserProvider } from "./context/User.context";

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <App />
    <Toaster />
  </UserProvider>
);
