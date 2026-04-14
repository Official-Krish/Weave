import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { MeetingDetails } from "@repo/types/api";
import { Meetings } from "../components/dashboard/Meetings";
import { RecordingsPage } from "../components/dashboard/RecordingsPage";
import { useAuth } from "../hooks/useAuth";
import { http } from "../https";
import { getHttpErrorMessage } from "../lib/httpError";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Overview } from "@/components/dashboard/Overview";
import { Topbar } from "@/components/dashboard/Topbar";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("weave-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, name, signOut } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const section = searchParams.get("section") || "overview";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("weave-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const meetingsQuery = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await http.get<MeetingDetails[]>("/meeting/getAll");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const meetings = meetingsQuery.data ?? [];
  
  const liveMeetings = meetings.filter((meeting) => !meeting.isEnded);
  

  const setSection = (nextSection: "overview" | "meetings" | "recordings") => {
    const nextParams = new URLSearchParams(searchParams);

    if (nextSection === "overview") {
      nextParams.delete("section");
    } else {
      nextParams.set("section", nextSection);
    }

    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#0a0908] border-b border-[#f5a623]/10">
      <Sidebar
        section={section}
        setSection={setSection}
        liveMeetings={liveMeetings}
        name={name ?? "User"}
        theme={theme}
        toggleTheme={toggleTheme}
        signOut={signOut}
      />

      <main className="flex flex-1 flex-col gap-5 overflow-auto p-6 sm:p-7">
        <Topbar
          name={name}
          liveMeetings={liveMeetings}
          meetings={meetings}
        />

        <AnimatePresence mode="wait">
          {section === "overview" ? (
            <Overview
              meetings={meetings}
              setSection={setSection}
            />
          ) : section === "meetings" ? (
            <motion.div
              key="meetings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Meetings
                meetings={meetings}
                isLoading={meetingsQuery.isLoading}
                isError={meetingsQuery.isError}
                errorMessage={getHttpErrorMessage(meetingsQuery.error, "Could not load meetings.")}
                onOpenMeeting={(meetingId) => navigate(`/meeting/live/${meetingId}`)}
                onOpenRecording={(recordingId) => navigate(`/recordings/${recordingId}`)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="recordings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <RecordingsPage
                meetings={meetings}
                isLoading={meetingsQuery.isLoading}
                isError={meetingsQuery.isError}
                error={meetingsQuery.error}
                onOpenRecording={(recordingId) => navigate(`/recordings/${recordingId}`)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}