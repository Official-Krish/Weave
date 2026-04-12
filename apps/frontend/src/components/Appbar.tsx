import { Link, NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { HoverArrowButton } from "./ui/hover-arrow-button";
import { ProfileDropdown } from "./Profile-dropdown";

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
};

const authenticatedNavItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/meetingSetup", label: "Create or Join Meeting" },
];

const guestNavItems: NavItem[] = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
];

type AppbarProps = {
  isLiveMeeting: boolean;
  isLanding: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isAuthenticated: boolean;
  name?: string | null;
  signOut: () => void;
};

export function Appbar({
  isLiveMeeting,
  isLanding,
  theme,
  toggleTheme,
  isAuthenticated,
  name,
  signOut,
}: AppbarProps) {
  const navItems = isAuthenticated ? authenticatedNavItems : guestNavItems;

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={[
        isLanding
          ? "fixed top-0 left-0 border-b border-white/15 bg-background/20 backdrop-blur-xl supports-backdrop-filter:bg-background/15"
          : isLiveMeeting
            ? "relative"
            : "sticky top-0",
        "z-50 w-full px-6 lg:px-8",
        !isLanding && "border-b border-white/15 bg-background/80 backdrop-blur-xl",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
            alt="Weave logo"
            className="h-8 w-auto"
          />
        </Link>

        {/* Nav Links */}
		<div className="flex">
			<nav className="hidden items-center gap-7 md:flex mr-6">
				{navItems.map((item) => (
					<NavLink
					key={item.to}
					to={item.to}
					end={Boolean(item.end)}
					className={({ isActive }) =>
						[
						"text-sm transition-colors duration-200",
						isActive
							? "text-white"
							: "text-white/50 hover:text-white/90",
						].join(" ")
					}
					>
					{item.label}
					</NavLink>
				))}
			</nav>

			{/* CTA */}
			<div className="flex items-center gap-3">
				{isAuthenticated ? (
					<ProfileDropdown
					name={name}
					theme={theme}
					toggleTheme={toggleTheme}
					signOut={signOut}
					/>
				) : (
					<HoverArrowButton href="/signup" label="Try for free" />
				)}
			</div>
		</div>
      </div>
    </motion.header>
  );
}