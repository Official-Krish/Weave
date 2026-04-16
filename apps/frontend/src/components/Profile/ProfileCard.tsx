import { useState } from "react";
import { formatDate, getInitials } from "./helpers";
import { Badge } from "./icons";
import type { User } from "./types";
import { useMutation } from "@tanstack/react-query";
import { http } from "@/https";
import { toast } from "sonner";

export const ProfileCard = ({
    user,
    dark
}: {
    user: User;
    dark: boolean;
}) => {
    const [nameInput, setNameInput] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const handleSaveMutation = useMutation({
        mutationFn: async () => {
        const response = await http.post("/user/update-profile", {
            name: nameInput,
        });

            return response.data;
        },
        onSuccess: () => {
            toast.success("Profile updated successfully");
            user.name = nameInput;
            setEditing(false);
            setSaving(false);
        },
        onError: (error) => {
            toast.error("Failed to update profile");
            console.error("Update profile failed:", error);
            setSaving(false);
        },
    });
    return (
        <div className={`rounded-[28px] border p-6 transition-colors shadow-[0_18px_56px_rgba(0,0,0,0.28)] ${ dark ? "border-white/10 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(12,12,12,0.96))]" : "bg-white border-zinc-200"}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#ffd166,#f5a623)] text-lg font-bold tracking-tight text-black shadow-[0_16px_30px_rgba(245,166,35,0.24)] select-none">
                            {getInitials(user.name)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#111111] bg-emerald-500 shadow-[0_0_0_4px_rgba(16,16,16,0.9)]" />
                    </div>
                    <div>
                        {editing ? (
                            <input
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className={`w-44 border-b-2 border-amber-500 bg-transparent pb-1 text-xl font-semibold outline-none ${
                                dark ? "text-white" : "text-zinc-900"
                                }`}
                                autoFocus
                            />
                            ) : (
                            <div className={`text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-zinc-900"}`}>{user.name}</div>
                        )}
                        <div className={`mt-1 text-sm ${dark ? "text-zinc-500" : "text-zinc-400"}`}>{user.email}</div>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge>Free Plan</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <button
                                onClick={() => { setEditing(false); setNameInput(user.name); }}
                                className={`cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors ${
                                dark ? "border-white/10 text-zinc-400 hover:border-white/15 hover:text-zinc-200" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                                }`}
                            >Cancel</button>
                            <button
                                onClick={() => {
                                    setSaving(true);
                                    handleSaveMutation.mutate()
                                }}
                                disabled={saving}
                                className="cursor-pointer rounded-xl bg-[linear-gradient(135deg,#ffd166,#f5a623)] px-3.5 py-2 text-xs font-semibold text-black shadow-[0_12px_24px_rgba(245,166,35,0.18)] transition-all hover:brightness-105 disabled:opacity-60"
                            >{saving ? "Saving…" : "Save"}</button>
                        </>
                    ) : (
                        <button
                        onClick={() => setEditing(true)}
                        className={`cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                            dark
                            ? "border-white/10 text-zinc-300 hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-100"
                            : "border-zinc-200 text-zinc-500 hover:border-amber-400 hover:text-amber-500"
                        }`}
                        >Edit</button>
                    )}
                </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                    { label: "Meetings", value: user.meetings.length },
                    { label: "Role", value: "Owner" },
                    { label: "Status", value: "Active" },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        <div className="text-[10px] uppercase text-zinc-600">
                            {item.label}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
