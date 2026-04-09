import { Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/product", label: "Product" },
  { to: "/meetings", label: "Meetings" },
  { to: "/recordings", label: "Recordings" },
  { to: "/editor", label: "Editor" },
];

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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("weave-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8">
        <header className="motion-rise mb-10 rounded-full border border-border/80 bg-card/80 px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl transition-colors duration-300">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_rgba(16,115,108,0.30)] transition-shadow duration-300 dark:shadow-[0_8px_20px_rgba(79,210,197,0.22)]">
                W
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Weave V1
                </p>
                <p className="text-sm text-muted-foreground/90">
                  Local-first recording webapp
                </p>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "rounded-full px-4 py-2 transition-all duration-300",
                      isActive
                        ? "bg-foreground text-background shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
                        : "text-muted-foreground hover:bg-secondary/90 hover:text-foreground",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground"
                aria-label="Toggle theme"
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <SunMedium className="h-4 w-4" />
                )}
              </button>
              <Link
                to="/signin"
                className="rounded-full border border-foreground/40 px-4 py-2 font-medium text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </header>

        <main className="motion-rise motion-delay-1 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
