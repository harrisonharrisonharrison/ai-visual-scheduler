import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { addEventToCalendar, type CalendarEvent } from "./calendar";
import { mockCalendarEvent } from "./mockData";

dotenv.config();

// TOGGLE THIS FOR TESTING
const USE_MOCK = true;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CalendarEventSchema = z.object({
  summary: z.string(),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

async function main(userContext?: string) {
  let eventData: CalendarEvent;

  if (USE_MOCK) {
    console.log("⚠️ Running in MOCK mode. Using data from mockData.ts.");
    eventData = mockCalendarEvent;
  } else {
    console.log("Reading image...");
    const imageBase64 = fs.readFileSync("./sample.jpg").toString("base64");

    const userContent: any[] = [
      {
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
      },
    ];

    if (userContext) {
      userContent.push({
        type: "text",
        text: `Context provided by the user about this event: "${userContext}".`,
      });
    }

    console.log(`Sending to OpenAI gpt-4o-mini...`);

    const today = new Date().toISOString().split("T")[0];
    const userTimezone = "America/Los_Angeles";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful calendar assistant designed to log user activities. Extract event details from the user's image and any provided text.


CRITICAL CONTEXT:

Today's current date and time is: ${today}

The user's timezone is: ${userTimezone}


RULES:

Time Format: Output startTime and endTime strictly in ISO 8601 format with the timezone offset (e.g., 2026-06-17T18:00:00-07:00).

Duration: Default the event duration to 30 minutes unless the details explicitly state otherwise.

Timing Context: If the image implies an activity just happened (e.g., eating a meal, a gym selfie, an empty coffee cup) and no explicit time is shown, calculate the startTime as exactly 30 minutes prior to the current time provided above.

Content Fallback: If the exact activity is unclear, generate a concise, logical summary based on the visual setting (e.g., "Gym Workout" or "Coffee Shop Visit") and provide a shorter description.

VIBE CHECK (CRITICAL):

Keep titles and descriptions extremely low-effort, and conversational. Use all lowercase. Sprinkle in slang like "lol" or "lmao" appropriately. Be condescending and slightly mean, as if the user is barely capable of logging their own life events.`,
        },
        { role: "user", content: userContent },
      ],
      response_format: zodResponseFormat(CalendarEventSchema, "calendar_event"),
    });

    eventData = JSON.parse(response.choices[0]?.message.content || "{}");
  }

  console.log("\nSuccess! Final Event Data:", eventData);

  console.log("\nPushing to Google Calendar...");
  const link = await addEventToCalendar(eventData);
  
  if (link) {
    console.log("🚀 Event live at:", link);
  } else {
    console.log("❌ Failed to push to calendar.");
  }
}

main("banquet");