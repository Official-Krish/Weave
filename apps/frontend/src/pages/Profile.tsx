
import { Billing } from "@/components/Profile/Billing";
import { Integerations } from "@/components/Profile/Integerations";
import { Meetings } from "@/components/Profile/Meetings";
import { Overview } from "@/components/Profile/Overview";
import { ProfileCard } from "@/components/Profile/ProfileCard";
import type { User } from "@/components/Profile/types";
import { useAuth } from "@/hooks/useAuth";
import { http } from "@/https";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"overview" | "meetings" | "billing" | "integrations">("overview");
    const { isAuthenticated } = useAuth();
    const dark = true;

    const userQuery = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const response = await http.get<{ user: User }>("/user/profile");
            return response.data.user;
        },
        enabled: isAuthenticated,
    });
    
    const user: User = userQuery.data ?? {
        name: "Error fetching user",
        email: "Error fetching email",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        meetings: [],
    };

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "meetings", label: "Meetings" },
        { id: "billing", label: "Billing" },
        { id: "integrations", label: "Integrations" },
    ] as const;

    return (
        <div className={`min-h-screen flex justify-center p-4 mt-8 transition-colors duration-300 ${ dark ? "bg-zinc-950" : "bg-zinc-100"
        }`}>
            <div className="w-full max-w-2xl space-y-4">

                {/* Profile Card */}
                <ProfileCard
                    user={user}
                    dark={dark}
                />

                {/* Tabs */}
                <div className={`rounded-2xl border p-1 flex gap-1 transition-colors ${ dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 text-xs font-semibold py-2 cursor-pointer rounded-xl transition-all ${
                                activeTab === tab.id
                                ? "bg-amber-500 text-black"
                                : dark
                                ? "text-zinc-500 hover:text-zinc-300"
                                : "text-zinc-400 hover:text-zinc-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <Overview 
                        user={user}
                        setActiveTab={setActiveTab}
                        dark={dark}
                    />
                )}

                {activeTab === "meetings" && (
                    <Meetings
                        meetings={user.meetings}
                        dark={dark}
                    />
                )}

                {activeTab === "billing" && (
                    <Billing dark={dark} />
                )}

                {activeTab === "integrations" && (
                    <Integerations dark={dark} />
                )}
            </div>
        </div>
    );
}