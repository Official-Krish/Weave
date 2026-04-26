import { WebClient } from "@slack/web-api";

export async function sendSlackDirectMessage(
  slackBotToken: string,
  slackUserId: string,
  eventDetails: {
    hostedby: string;
    summary: string;
    description: string;
    startDateTime: string;
    attendees: string[];
  }
) {
  const client = new WebClient(slackBotToken);

  const conversation = await client.conversations.open({
    users: slackUserId,
  });

  const channelId = conversation.channel?.id;
  if (!channelId) {
    throw new Error("Slack DM channel could not be opened.");
  }

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
      ? eventDetails.attendees.join(", ")
      : "No additional attendees";

  await client.chat.postMessage({
    channel: channelId,
    // Fallback text for notifications / accessibility
    text: `📅 Meeting invitation: ${eventDetails.summary} — hosted by ${eventDetails.hostedby} at ${formattedTime}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `📅  ${eventDetails.summary}`,
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            eventDetails.description
              ? `_${eventDetails.description}_`
              : "_No additional description provided._",
        },
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*🎙️ Hosted by*\n${eventDetails.hostedby}`,
          },
          {
            type: "mrkdwn",
            text: `*🕐 Start time*\n${formattedTime}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*👥 Attendees*\n${attendeeList}`,
        },
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*🔗 How to join*\nLog in to your *Weave* account and navigate to _Upcoming Meetings_ to join when the meeting starts.",
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Weave · Video & Voice Conferencing",
          },
        ],
      },
    ],
  });
}
