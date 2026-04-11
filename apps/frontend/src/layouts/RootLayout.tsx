import { motion } from "motion/react";
import { Outlet, useLocation } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("weave-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function RootLayout() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const location = useLocation();
  const { isAuthenticated, name, signOut } = useAuth();
  const isLiveMeeting = location.pathname.startsWith("/meetings/live/");
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("weave-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <div>
      <Appbar
        isLiveMeeting={isLiveMeeting}
        isLanding={isLanding}
        theme={theme}
        toggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
        name={name}
        signOut={signOut}
      />

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>

      {!isLiveMeeting ? <Footer isLanding={isLanding} /> : null}
    </div>
  );
}
