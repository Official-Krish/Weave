export const Billing = ({
    dark
}: {
    dark: boolean;
}) => {
    return (
        <div className="space-y-3">
            {/* Current plan */}
            <div className={`rounded-2xl border p-5 transition-colors ${ dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
            }`}>
                <div className={`text-xs uppercase tracking-widest font-semibold mb-4 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Current Plan</div>
                <div className="flex items-center justify-between">
                    <div>
                        <div className={`text-xl font-bold ${dark ? "text-white" : "text-zinc-900"}`}>Free</div>
                            <div className={`text-xs mt-0.5 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Basic recording · 720p · 5 participants</div>
                        </div>
                        <button className="text-xs px-4 py-2 rounded-xl bg-amber-500 text-black cursor-pointer font-bold hover:bg-amber-400 transition-colors">
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
                        <div key={plan.name} className={`rounded-2xl border p-4 transition-colors ${
                        dark ? "bg-zinc-900/50 border-zinc-800 border-dashed" : "bg-zinc-50 border-zinc-200 border-dashed"
                        }`}>
                            <div className={`text-sm font-bold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>{plan.name}</div>
                            <div className="text-amber-500 font-bold text-base">{plan.price}</div>
                            <div className={`text-[11px] mt-1 ${dark ? "text-zinc-600" : "text-zinc-400"}`}>{plan.features}</div>
                            <div className={`text-[9px] mt-2 uppercase tracking-widest font-bold ${dark ? "text-zinc-700" : "text-zinc-300"}`}>Coming soon</div>
                        </div>
                    ))}
                </div>

                {/* Usage */}
                <div className={`rounded-2xl border p-4 transition-colors ${ dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200" }`}>
                    <div className={`text-xs uppercase tracking-widest font-semibold mb-3 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Usage this month</div>
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
                                    className="h-full rounded-full bg-amber-500 transition-all"
                                    style={{ width: `${(used / limit) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
        </div>
    )
}