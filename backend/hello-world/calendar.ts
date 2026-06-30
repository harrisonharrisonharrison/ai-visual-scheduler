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
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

const getMappedColorId = (summary: string): string => {
  const text = summary.toLowerCase();
  
  // 1. Gym & Physical Fitness
  const gymSynonyms = ["gym", "workout", "exercise", "lift", "run", "cardio", "training", "fitness", "stretching"];
  if (gymSynonyms.some(synonym => text.includes(synonym))) {
    return "11"; // Tomato (Bold Red for high energy/physical output)
  }
  
  // 2. Guitar & Music Practice
  const guitarSynonyms = ["guitar", "music", "practice", "jam", "song", "shred", "strum", "rehearsal", "scales"];
  if (guitarSynonyms.some(synonym => text.includes(synonym))) {
    return "3"; // Grape (Deep Purple for creative/artistic efforts)
  }
  
  // 3. Cooking, Food, & Meals
  const cookSynonyms = ["cook", "chef", "dinner", "lunch", "breakfast", "meal", "food", "eat", "baking", "prep", "grocery"];
  if (cookSynonyms.some(synonym => text.includes(synonym))) {
    return "5"; // Banana (Bright Yellow for kitchen/food activities)
  }
  
  // 4. Friends & Social Interaction
  const friendSynonyms = ["friend", "hangout", "party", "social", "meetup", "chill", "gather", "date", "drinks", "visit"];
  if (friendSynonyms.some(synonym => text.includes(synonym))) {
    return "7"; // Peacock (Light Blue for calm, conversational, social settings)
  }
  
  return "8"; // Default: Graphite (Stone Gray) for standard/unclassified tasks
};


export async function addEventToCalendar(event: CalendarEvent): Promise<string | null> {
  try {
    const eventColor = getMappedColorId(event.summary);

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.startTime },
        end: { dateTime: event.endTime },
        colorId: eventColor,
      },
    });

    return response.data.htmlLink || null;
  } catch (error) {
    console.error("Failed to add event to calendar:", error);
    throw error;
  }
}