import { google } from "googleapis";

const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export async function createCalendarEvent(
    refreshToken: string,
    eventDetails: {
        summary: string;
        description: string;
        startDateTime: string;
        endDateTime: string;   
        attendees: string[];
    }
) {
    auth.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: "v3", auth });

    try {
        const response = await calendar.events.insert({ 
        calendarId: "primary",
            requestBody: {
                summary: eventDetails.summary,
                description: eventDetails.description,
                start: { dateTime: eventDetails.startDateTime, timeZone: "UTC" },
                end:   { dateTime: eventDetails.endDateTime || eventDetails.startDateTime,   timeZone: "UTC" },
                attendees: eventDetails.attendees.map((email) => ({ email })),
            },
        });
        return response.data.id;
    } catch (err) {
        console.error("Failed to create calendar event:", err);
        throw err; 
    }
}

export async function deleteCalendarEvent(refreshToken: string, eventId: string) {
    auth.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: "v3", auth });

    try {
        await calendar.events.delete({ calendarId: "primary", eventId });
    } catch (err) {
        console.error("Failed to delete calendar event:", err);
        throw err; 
    }
}

export async function updateCalendarEvent(
    refreshToken: string,
    eventId: string,
    updatedDetails: {
        summary?: string;
        description?: string;
        startDateTime?: string;
        endDateTime?: string;   
        attendees?: string[];
    }
) {
    auth.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: "v3", auth });

    try {
        await calendar.events.patch({ 
            calendarId: "primary",
            eventId,
            requestBody: {
                summary: updatedDetails.summary,
                description: updatedDetails.description,
                start: updatedDetails.startDateTime ? { dateTime: updatedDetails.startDateTime, timeZone: "UTC" } : undefined,
                end:   updatedDetails.endDateTime   ? { dateTime: updatedDetails.endDateTime,   timeZone: "UTC" } : undefined,
                attendees: updatedDetails.attendees ? updatedDetails.attendees.map((email) => ({ email })) : undefined,
            },
        });
        return;
    } catch (err) {
        console.error("Failed to update calendar event:", err);
        throw err; 
    }
}