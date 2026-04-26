import axios from "axios";

export const sendDiscordNotification = async (
    webhookUrl: string,
    eventDetails: {
        hostedby: string;
        summary: string;
        description: string;
        startDateTime: string;
        attendees: string[];
    }
) => {
    try {
        const startDate = new Date(eventDetails.startDateTime);
        const formattedTime = startDate.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
        });

        const attendeeList =
            eventDetails.attendees.length > 0
                ? eventDetails.attendees.map((e) => `\`${e}\``).join(", ")
                : "No additional attendees";

        const payload = {
            username: "Weave",
            avatar_url: "https://weave.krishdev.xyz/favicon.ico",
            embeds: [
                {
                    title: `📅  ${eventDetails.summary}`,
                    description:
                        eventDetails.description
                            ? eventDetails.description
                            : "No additional description provided.",
                    color: 0xf5a623, // warm amber — matches Weave brand
                    fields: [
                        {
                            name: "🎙️  Hosted by",
                            value: eventDetails.hostedby,
                            inline: true,
                        },
                        {
                            name: "🕐  Start time",
                            value: formattedTime,
                            inline: true,
                        },
                        {
                            name: "👥  Attendees",
                            value: attendeeList,
                            inline: false,
                        },
                        {
                            name: "🔗  How to join",
                            value:
                                "Log in to your **Weave** account and navigate to *Upcoming Meetings* to join when the meeting starts.",
                            inline: false,
                        },
                    ],
                    footer: {
                        text: "Weave · Video & Voice Conferencing",
                    },
                    timestamp: startDate.toISOString(),
                },
            ],
        };

        await axios.post(webhookUrl, payload);
    } catch (error) {
        console.error("Error sending Discord notification:", error);
    }
};
