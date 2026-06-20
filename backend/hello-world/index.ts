import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
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
  summary: z.string().describe("The event title written like an ad-lib heavy rapper ad-lib. completely lowercase."),
  description: z.string().describe("Details of what happened, littered with rapper ad-libs like FWEH! or SLATT!"),
  startTime: z.string(),
  endTime: z.string(),
});

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    let eventData: CalendarEvent;

    const body = JSON.parse(event.body || "{}");
    const base64Image = body.image;
    const userContext = body.context || "";

    if (USE_MOCK) {
      console.log("⚠️ Running in MOCK mode. Using data from mockData.ts.");
      eventData = mockCalendarEvent;
    } else {
      console.log("Reading image from request body...");

      if (!base64Image) {
        return {
          statusCode: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ error: "No image provided in the request body." }),
        };
      }

      const userContent: any[] = [
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Image}` },
        },
      ];

      if (userContext) {
        userContent.push({
          type: "text",
          text: `Context provided by the user about this event: "${userContext}".`,
        });
      }

      console.log(`Sending to OpenAI gpt-4o-mini...`);

      const userTimezone = "America/Los_Angeles";

      const currentDateTime = new Date().toLocaleString("en-US", {
        timeZone: userTimezone,
        dateStyle: "full",
        timeStyle: "long",
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful calendar assistant designed to log user activities. Extract event details from the user's image and any provided text. CRITICAL CONTEXT: Today's current date and time is: ${currentDateTime} The user's timezone is: ${userTimezone} 
            
            RULES: Time Format: Output startTime and endTime strictly in ISO 8601 format with the timezone offset (e.g., 2026-06-17T18:00:00-07:00). Duration: Default the event duration to 30 minutes unless the details explicitly state otherwise. 
            
            Timing Context: If the image implies an activity just happened (e.g., eating a meal, a gym selfie, an empty coffee cup) and no explicit time is shown, calculate the startTime as exactly 30 minutes prior to the current time provided above. 
            
            Content Fallback: If the exact activity is unclear, generate a concise, logical summary based on the visual setting (e.g., "Gym Workout" or "Coffee Shop Visit") and provide a shorter description. 
            
            VIBE CHECK (CRITICAL): You must apply this personality EXCLUSIVELY to the "summary" and "description" fields of the JSON. You are a mysterious, ad-lib-heavy rapper, speaking confidently through short punchy sentences, repetition, slang, and expressive reactions rather than formal language. Use ad-libs often as emotional punctuation (e.g., "FWEH!", "HOMIXIDE!", "WHAT!", "SLATT!", "SCHYEAH!") in responses`,
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
      
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" }, 
        body: JSON.stringify({ 
          message: "Event logged successfully!", 
          link: link, 
          eventData 
        }),
      };
    } else {
      console.log("❌ Failed to push to calendar.");
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Failed to push to Google Calendar." }),
      };
    }
  } catch (error) {
    console.error("Critical Lambda Error:", error);
    
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};