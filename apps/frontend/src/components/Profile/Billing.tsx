import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export const Billing = ({
    dark
}: {
    dark: boolean;
}) => {
    const navigate = useNavigate();
    return (
        <motion.div className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Current plan */}
            <div className={`rounded-[24px] border p-5 transition-colors shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${ dark ? "border-white/8 bg-white/[0.03]" : "bg-white border-zinc-200"
            }`}>
                <div className={`mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Current Plan</div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className={`text-xl font-bold ${dark ? "text-white" : "text-zinc-900"}`}>Free</div>
                        <div className={`mt-1 text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Basic recording · 720p · 5 participants</div>
                        </div>
                        <button className="cursor-pointer rounded-xl bg-[linear-gradient(135deg,#ffd166,#f5a623)] px-4 py-2 text-xs font-bold text-black shadow-[0_12px_24px_rgba(245,166,35,0.16)] transition-all hover:brightness-105"
                            onClick={() => navigate("/pricing")}
                        >
                            Upgrade
                        </button>
                    </div>
                </div>

                {/* Plans coming */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { name: "Pro", price: "$12/mo", features: "4K · 25 participants · Cloud storage" },
                        { name: "Team", price: "$29/mo", features: "4K · Unlimited · Analytics · SSO" },
                    ].map((plan) => (
                        <div key={plan.name} className={`rounded-[22px] border p-4 transition-colors ${
                        dark ? "border-white/8 bg-black/20" : "bg-zinc-50 border-zinc-200 border-dashed"
                        }`}>
                            <div className={`text-sm font-bold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>{plan.name}</div>
                            <div className="text-base font-bold text-amber-400">{plan.price}</div>
                            <div className={`mt-1 text-[11px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>{plan.features}</div>
                            <div className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.22em] ${dark ? "border-white/10 bg-white/[0.03] text-zinc-500" : "text-zinc-300"}`}>Coming soon</div>
                        </div>
                    ))}
                </div>

                {/* Usage */}
                <div className={`rounded-[24px] border p-4 transition-colors ${ dark ? "border-white/8 bg-black/20" : "bg-white border-zinc-200" }`}>
                    <div className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Usage this month</div>
                    {[
                        { label: "Recordings", used: 0, limit: 5 },
                        { label: "Storage", used: 0, limit: 5, unit: "GB" },
                    ].map(({ label, used, limit, unit }) => (
                        <div key={label} className="mb-3 last:mb-0">
                            <div className="flex justify-between mb-1">
                                <span className={`text-xs ${dark ? "text-zinc-400" : "text-zinc-600"}`}>{label}</span>
                                <span className={`text-xs font-mono ${dark ? "text-zinc-500" : "text-zinc-400"}`}>{used}{unit || ""} / {limit}{unit || ""}</span>
                            </div>
                            <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-zinc-800" : "bg-zinc-200"}`}>
                                <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,#ffd166,#f5a623)] transition-all"
                                    style={{ width: `${(used / limit) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
        </motion.div>
    )
}
