import { Moon, SunMedium } from "lucide-react";
import { motion } from "motion/react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
	{ to: "/", label: "Home", end: true },
	{ to: "/product", label: "Product" },
	{ to: "/meetings", label: "Meetings" },
	{ to: "/recordings", label: "Recordings" },
	{ to: "/editor", label: "Editor" },
];

type AppbarProps = {
	isLiveMeeting: boolean;
	isLanding: boolean;
	theme: "light" | "dark";
	isAuthenticated: boolean;
	name?: string | null;
	toggleTheme: () => void;
	signOut: () => void;
};

export function Appbar({
	isLiveMeeting,
	isLanding,
	theme,
	isAuthenticated,
	name,
	toggleTheme,
	signOut,
}: AppbarProps) {
	return (
		<motion.header
			initial={{ opacity: 0, y: -14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: "easeOut" }}
			className={[
				"z-40 rounded-full border px-5 py-4 backdrop-blur-xl transition-colors duration-300",
				isLanding
					? "sticky top-5 border-[#3b3327] bg-[#13110e]/78 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
					: "border-border/80 bg-card/80 shadow-[0_10px_30px_rgba(15,23,42,0.10)]",
				isLiveMeeting ? "mb-6" : "mb-10",
			].join(" ")}
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Link to="/" className="flex items-center gap-3">
					<div
						className={[
							"flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-shadow duration-300",
							isLanding
								? "bg-[#f4a62a] text-[#21180c] shadow-[0_10px_24px_rgba(244,166,42,0.35)]"
								: "bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(16,115,108,0.30)] dark:shadow-[0_8px_20px_rgba(79,210,197,0.22)]",
						].join(" ")}
					>
						W
					</div>
					<div>
						<p
							className={[
								"text-sm font-medium uppercase tracking-[0.24em]",
								isLanding ? "text-[#f8e8ca]/70" : "text-muted-foreground",
							].join(" ")}
						>
							Weave V1
						</p>
						<p
							className={[
								"text-sm",
								isLanding ? "text-[#f6f1e6]" : "text-muted-foreground/90",
							].join(" ")}
						>
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
										? isLanding
											? "bg-[#f4a62a] text-[#241a0d] shadow-[0_10px_24px_rgba(244,166,42,0.2)]"
											: "bg-foreground text-background shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
										: isLanding
											? "text-[#c9bea9] hover:bg-[#1b1814] hover:text-[#fff8eb]"
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
						className={[
							"inline-flex items-center gap-2 rounded-full border px-3 py-2 transition-all duration-300",
							isLanding
								? "border-[#3f372b] bg-[#171411] text-[#e8d7b7] hover:border-[#f4a62a]/45 hover:text-white"
								: "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
						].join(" ")}
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
						className={[
							"rounded-full border px-4 py-2 font-medium transition-all duration-300",
							isLanding
								? "border-[#4b412e] text-[#f7eedf] hover:bg-[#f7eedf] hover:text-[#17120b]"
								: "border-foreground/40 text-foreground hover:bg-foreground hover:text-background",
						].join(" ")}
					>
						{isAuthenticated ? name || "Signed in" : "Sign in"}
					</Link>
					{!isAuthenticated ? (
						<Link
							to="/signup"
							className={[
								"rounded-full px-4 py-2 font-medium transition-all duration-300 hover:brightness-105",
								isLanding
									? "bg-[#f4a62a] text-[#241a0d]"
									: "bg-primary text-primary-foreground",
							].join(" ")}
						>
							Sign up
						</Link>
					) : null}
					{isAuthenticated ? (
						<button
							type="button"
							onClick={signOut}
							className={[
								"rounded-full border px-4 py-2 font-medium transition-all duration-300",
								isLanding
									? "border-[#3f372b] bg-[#171411] text-[#d8c8a7] hover:bg-[#211b14] hover:text-white"
									: "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
							].join(" ")}
						>
							Sign out
						</button>
					) : null}
				</nav>
			</div>
		</motion.header>
	);
}
