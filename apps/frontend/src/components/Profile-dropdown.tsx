import { useEffect, useRef, useState, type ReactNode } from "react";
import {
	ChevronDown,
	LogOut,
	Moon,
	Settings,
	Sparkles,
	SunMedium,
	UserPen,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import type { UserProfileResponse } from "@repo/types/api";
import { http } from "../https";

type ProfileDropdownProps = {
	name?: string | null;
	theme: "light" | "dark";
	toggleTheme: () => void;
	signOut: () => void;
};

export function ProfileDropdown({
	name,
	theme,
	toggleTheme,
	signOut,
}: ProfileDropdownProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);

	const profileQuery = useQuery({
		queryKey: ["user-profile"],
		queryFn: async () => {
			const response = await http.get<UserProfileResponse>("/user/me");
			return response.data.user;
		},
		enabled: true,
		staleTime: 5 * 60 * 1000,
	});

	const displayName = profileQuery.data?.name?.trim() || name?.trim() || "Weave User";
	const displayEmail = profileQuery.data?.email?.trim() || "";
	const initial = displayName.charAt(0).toUpperCase();

	useEffect(() => {
		const onPointerDown = (event: MouseEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		const onEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", onPointerDown);
		document.addEventListener("keydown", onEscape);

		return () => {
			document.removeEventListener("mousedown", onPointerDown);
			document.removeEventListener("keydown", onEscape);
		};
	}, []);

	return (
		<div ref={rootRef} className="relative">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="inline-flex items-center gap-2.5 rounded-lg border border-white/15 bg-black/45 px-2 py-1.5 text-left text-white transition hover:border-white/25 cursor-pointer"
			>
				<span className="inline-flex size-8 items-center justify-center rounded-full bg-[#f4a62a] text-sm font-bold text-[#1b1309]">
					{initial}
				</span>
				<span className="hidden md:flex md:flex-col">
					<span className="text-sm font-semibold leading-none">{displayName}</span>
					<span className="mt-1 text-[11px] text-white/60">User</span>
				</span>
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={{ duration: 0.18, ease: "easeOut" }}
					className="inline-flex"
				>
					<ChevronDown className="size-3.5 text-white/70" />
				</motion.span>
			</button>

			<AnimatePresence>
				{open ? (
					<motion.div
						initial={{ opacity: 0, y: -8, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -8, scale: 0.98 }}
						transition={{ duration: 0.18, ease: "easeOut" }}
						className="absolute right-0 z-60 mt-2 w-65 overflow-hidden rounded-2xl border border-white/15 bg-[#111]/95 text-white shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
					>
						<div className="border-b border-white/10 px-4 py-3">
							<p className="text-lg font-semibold leading-tight">{displayName}</p>
							<p className="mt-1 truncate text-xs text-white/60">
								{profileQuery.isLoading ? "Loading email..." : displayEmail}
							</p>
						</div>

						<div className="space-y-1.5 p-2.5">
							<MenuButton label="Edit profile" icon={<UserPen className="size-4.5" />} shortcut="E" />
							<MenuButton label="Widget settings" icon={<Settings className="size-4.5" />} shortcut="W" />
							<MenuButton
								label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
								icon={theme === "dark" ? <SunMedium className="size-4.5" /> : <Moon className="size-4.5" />}
								onClick={toggleTheme}
							/>
							<MenuButton label="Upgrade to professional" icon={<Sparkles className="size-4.5" />} />
						</div>

						<div className="border-t border-white/10 p-2.5">
							<button
								type="button"
								onClick={signOut}
								className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-white/90 transition hover:bg-white/8"
							>
								<LogOut className="size-4.5" />
								Log out
							</button>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

type MenuButtonProps = {
	label: string;
	icon: ReactNode;
	shortcut?: string;
	onClick?: () => void;
};

function MenuButton({ label, icon, shortcut, onClick }: MenuButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/8"
		>
			<span className="text-white/90">{icon}</span>
			<span className="flex-1 text-white/90">{label}</span>
			{shortcut ? (
				<span className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/50">{shortcut}</span>
			) : null}
		</button>
	);
}
