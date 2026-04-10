import { motion } from "motion/react";

export function Footer({ isLanding = false }: { isLanding?: boolean }) {
	return (
		<motion.footer
			initial={{ opacity: 0, y: 12 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.3 }}
			transition={{ duration: 0.35, ease: "easeOut" }}
			className={[
				"mx-auto mt-12 w-full max-w-7xl px-6 pb-8 pt-14 sm:px-8",
				isLanding ? "text-[#f5ead3]" : "",
			].join(" ")}
		>
			<div
				className={[
					"flex flex-col items-center justify-between gap-6 border-t pt-8 text-center md:flex-row md:text-left",
					isLanding ? "border-[#31291d]" : "border-border/30",
				].join(" ")}
			>
				<div>
					<p className={["font-headline text-2xl font-black", isLanding ? "text-[#fff5de]" : "text-foreground"].join(" ")}>Weave</p>
					<p className={["mt-2 text-sm", isLanding ? "text-[#b9ab90]" : "text-muted-foreground"].join(" ")}>
						© 2026 Weave. Crafted for creators who crave perfection.
					</p>
				</div>
				<div className={["flex flex-wrap items-center gap-6 text-sm", isLanding ? "text-[#c4b79e]" : "text-muted-foreground"].join(" ")}>
					<a href="#">Privacy</a>
					<a href="#">Terms</a>
					<a href="#">Support</a>
					<a href="#">GitHub</a>
					<a href="#">Twitter</a>
				</div>
			</div>
		</motion.footer>
	);
}
