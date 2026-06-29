import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { addEventToCalendar } from "./calendar";

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.IMAGE_BUCKET_NAME!;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CalendarEventSchema = z.object({
  summary: z
    .string()
    .describe(
      "The event title written in caveman speech using simple words, broken grammar, and short sentences. Completely lowercase.",
    ),
  description: z
    .string()
    .describe(
      "Details of what happened written in caveman speech. Use simple words, broken grammar, and short, primitive sentences (e.g. 'me eat big food. belly happy.' 'me lift rock. arms strong.'). Avoid modern slang and complex grammar.",
    ),
  startTime: z.string(),
  endTime: z.string(),
});

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const headers = { "Access-Control-Allow-Origin": "*" };

  try {
    if (event.resource === "/upload-url" && event.httpMethod === "GET") {
      const fileName = `calendar_img_${Date.now()}.jpg`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        ContentType: "image/jpeg",
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ uploadUrl, fileName }),
      };
    }

    if (event.resource === "/log-event" && event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { fileName, context } = body;

      if (!fileName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Missing fileName" }),
        };
      }

      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
      });
      const s3Response = await s3Client.send(getCommand);
      const byteArray = await s3Response.Body?.transformToByteArray();

      if (!byteArray) throw new Error("Failed to read image from S3");
      const base64Image = Buffer.from(byteArray).toString("base64");

      const viewImageUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 604800,
      });

      const userTimezone = "America/Los_Angeles";
      const currentDateTime = new Date().toLocaleString("en-US", {
        timeZone: userTimezone,
      });

      let promptText = `You are a helpful calendar assistant designed to log user activities. Extract event details from the user's image and any provided text. CRITICAL CONTEXT: Today's current date and time is: ${currentDateTime} The user's timezone is: ${userTimezone}
      RULES: Time Format: Output startTime and endTime strictly in ISO 8601 format with the timezone offset (e.g., 2026-06-17T18:00:00-07:00). Duration: Default the event duration to 30 minutes unless the details explicitly state otherwise.
      Timing Context: If the image implies an activity just happened (e.g., eating a meal, a gym selfie, an empty coffee cup) and no explicit time is shown, calculate the startTime as exactly 30 minutes prior to the current time provided above.
      Content Fallback: If the exact activity is unclear, generate a concise, logical summary based on the visual setting (e.g., "Gym Workout" or "Coffee Shop Visit") and provide a shorter description.
      VIBE CHECK (CRITICAL): You must apply this personality EXCLUSIVELY to the "summary" and "description" fields of the JSON. Speak like a caveman using very simple words, broken grammar, and short sentences. Leave out unnecessary words like "the," "is," or "are" when it sounds natural. Refer to yourself and others simply (e.g., "Me go gym." "You hunt good."). Focus on actions and objects rather than complex explanations. Keep the tone primitive, direct, and a little playful. Avoid modern slang, technical language, or complete grammatical sentences. Examples of style: "Me eat big food. Belly happy." "Sun down. Me go sleep." "Big lift. Arms strong. Good day." "Fire hot. Coffee good. Me wake."`;

      if (context) promptText += ` User provided context: "${context}".`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: promptText },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
            ],
          },
        ],
        response_format: zodResponseFormat(
          CalendarEventSchema,
          "calendar_event",
        ),
      });

      const eventData = JSON.parse(
        response.choices[0]?.message.content || "{}",
      );

      eventData.description = `${eventData.description}\n\n<a href="${viewImageUrl}">🖼️ View Logged Photo</a>`;

      const calendarLink = await addEventToCalendar(eventData);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Success!", calendarLink, eventData }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Route not found" }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
