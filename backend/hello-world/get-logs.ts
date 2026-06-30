import { google } from "googleapis";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const getLogsHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("Fetching recent etchings...");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

    const response = await calendar.events.list({
      calendarId: calendarId,
      maxResults: 100, 
      singleEvents: true,
      orderBy: "startTime",
      timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      timeMax: new Date().toISOString(), 
    });

    const events = response.data.items || [];

    const formattedLogs = events
      .map((item) => ({
        id: item.id || Math.random().toString(),
        title: item.summary || "UNTITLED ETCHING",
        summary: item.description || "NO ETCHINGS RECORDED. UNGA.",
        link: item.htmlLink || "https://calendar.google.com",
        startTime:
          item.start?.dateTime || item.start?.date || new Date().toISOString(),
      }))
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )
      .slice(0, 15); 

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(formattedLogs),
    };
  } catch (error: any) {
    console.error("Error fetching calendar logs:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Failed to retrieve stone logs",
        details: error.message,
      }),
    };
  }
};