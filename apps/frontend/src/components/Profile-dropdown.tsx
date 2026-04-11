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

type ProfileDropdownProps = {
	name?: string | null;
	theme: "light" | "dark";
	toggleTheme: () => void;
	signOut: () => void;
};

function getDisplayEmail(name: string) {
	const normalized = name.trim().toLowerCase().replace(/\s+/g, "");
	return `${normalized || "user"}@weave.app`;
}

export function ProfileDropdown({
	name,
	theme,
	toggleTheme,
	signOut,
}: ProfileDropdownProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);

	const displayName = name?.trim() || "Weave User";
	const displayEmail = getDisplayEmail(displayName);
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
				className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-black/45 px-2.5 py-1.5 text-left text-white transition hover:border-white/25"
			>
				<span className="inline-flex size-9 items-center justify-center rounded-full bg-[#f4a62a] text-sm font-bold text-[#1b1309]">
					{initial}
				</span>
				<span className="hidden md:flex md:flex-col">
					<span className="text-sm font-semibold leading-none">{displayName}</span>
					<span className="mt-1 text-xs text-white/60">User</span>
				</span>
				<ChevronDown className={`size-4 text-white/70 transition ${open ? "rotate-180" : ""}`} />
			</button>

			{open ? (
				<div className="absolute right-0 z-60 mt-3 w-[320px] overflow-hidden rounded-3xl border border-white/15 bg-[#111]/95 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
					<div className="border-b border-white/10 px-5 py-4">
						<p className="text-2xl font-semibold leading-tight">{displayName}</p>
						<p className="mt-1 text-sm text-white/60">{displayEmail}</p>
					</div>

					<div className="space-y-2 p-3">
						<MenuButton label="Edit profile" icon={<UserPen className="size-5" />} shortcut="E" />
						<MenuButton label="Widget settings" icon={<Settings className="size-5" />} shortcut="W" />
						<MenuButton
							label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
							icon={theme === "dark" ? <SunMedium className="size-5" /> : <Moon className="size-5" />}
							onClick={toggleTheme}
						/>
						<MenuButton label="Upgrade to professional" icon={<Sparkles className="size-5" />} />
					</div>

					<div className="border-t border-white/10 p-3">
						<button
							type="button"
							onClick={signOut}
							className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base text-white/90 transition hover:bg-white/8"
						>
							<LogOut className="size-5" />
							Log out
						</button>
					</div>
				</div>
			) : null}
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
			className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/8"
		>
			<span className="text-white/90">{icon}</span>
			<span className="flex-1 text-lg text-white/90">{label}</span>
			{shortcut ? (
				<span className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/50">{shortcut}</span>
			) : null}
		</button>
	);
}
