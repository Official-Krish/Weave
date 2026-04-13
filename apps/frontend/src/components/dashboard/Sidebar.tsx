import { CalendarDays, Sparkles, Users, Video } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileDropdown } from "../Profile-dropdown";

export function Sidebar({
    section,
    setSection,
    liveMeetings,
    name,
    theme,
    toggleTheme,
    signOut,
}: {
    section: string;
    setSection: (section: "overview" | "meetings" | "recordings") => void;
    liveMeetings: unknown[];
    name: string;
    theme: "light" | "dark";
    toggleTheme: () => void;
    signOut: () => void;
}) {
    const navigate = useNavigate();
    return (
        <aside className="hidden w-55 shrink-0 flex-col border-r border-[#f5a623]/10 bg-[#0d0b08] px-3.5 py-5 lg:flex">
        <div className="mb-5 mt-2 flex items-center gap-2 px-2 cursor-pointer" onClick={() => navigate("/")}>
          <img src="/logo-navbar.svg" alt="Weave" className="h-8 w-auto" />
        </div>

        <p className="px-2 pb-1 pt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#f5a623]/40">Workspace</p>
        <SidebarItem icon={<Video />} label="Dashboard" active={section === "overview"} onClick={() => setSection("overview")} />
        <SidebarItem icon={<Video />} label="Meetings" active={section === "meetings"} badge={liveMeetings.length || undefined} onClick={() => setSection("meetings")} />
        <SidebarItem icon={<Sparkles />} label="Recordings" active={section === "recordings"} onClick={() => setSection("recordings")} />
        <SidebarItem icon={<CalendarDays />} label="Calendar" />

        <p className="px-2 pb-1 pt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#f5a623]/40">Account</p>
        <SidebarItem icon={<Users />} label="Team" />

        <div className="mt-auto border-t border-[#f5a623]/8 pt-3">
          <ProfileDropdown
            name={name}
            theme={theme}
            toggleTheme={toggleTheme}
            signOut={signOut}
            menuDirection="up"
            variant="sidebar"
          />
        </div>
      </aside>
    )
}

function SidebarItem({ icon, label, active, badge, onClick }: { icon: ReactNode; label: string; active?: boolean; badge?: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[13px] font-medium transition [&_svg]:size-4 cursor-pointer",
        active ? "bg-[#f5a623]/10 font-bold text-[#f5a623]" : "text-[#fff5de]/50 hover:bg-[#f5a623]/6 hover:text-[#fff5de]/85",
      ].join(" ")}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="rounded-full bg-[#f5a623]/15 px-2 py-0.5 text-[10px] font-bold text-[#f5a623]">{badge}</span>
      )}
    </button>
  );
}