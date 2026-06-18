import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config();

export interface CalendarEvent {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN || null,
})

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export async function addEventToCalendar(event: CalendarEvent): Promise<string | null> {
  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.startTime },
        end: { dateTime: event.endTime },
      },
    });

    return response.data.htmlLink || null;
  } catch (error) {
    console.error("Failed to add event to calendar:", error);
    throw error;
  }
}