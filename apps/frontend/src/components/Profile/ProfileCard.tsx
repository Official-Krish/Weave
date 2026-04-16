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
        <div className={`rounded-3xl border p-6 transition-colors ${ dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-bold text-lg tracking-tight select-none">
                            {getInitials(user.name)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900" />
                    </div>
                    <div>
                        {editing ? (
                            <input
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className={`text-lg font-bold bg-transparent border-b-2 border-amber-500 outline-none w-44 ${
                                dark ? "text-white" : "text-zinc-900"
                                }`}
                                autoFocus
                            />
                            ) : (
                            <div className={`text-lg font-bold tracking-tight ${dark ? "text-white" : "text-zinc-900"}`}>{user.name}</div>
                        )}
                        <div className={`text-sm ${dark ? "text-zinc-500" : "text-zinc-400"}`}>{user.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge>Free Plan</Badge>
                            <span className={`text-[11px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>Since {formatDate(user.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <button
                                onClick={() => { setEditing(false); setNameInput(user.name); }}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                dark ? "border-zinc-700 text-zinc-400 hover:border-zinc-600" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                                }`}
                            >Cancel</button>
                            <button
                                onClick={() => {
                                    setSaving(true);
                                    handleSaveMutation.mutate()
                                }}
                                disabled={saving}
                                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold cursor-pointer hover:bg-amber-400 transition-colors disabled:opacity-60"
                            >{saving ? "Saving…" : "Save"}</button>
                        </>
                    ) : (
                        <button
                        onClick={() => setEditing(true)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                            dark
                            ? "border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400"
                            : "border-zinc-200 text-zinc-500 hover:border-amber-400 hover:text-amber-500"
                        }`}
                        >Edit</button>
                    )}
                </div>
            </div>
        </div>
    )
}