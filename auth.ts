import { google } from "googleapis";
import * as http from "http";
import * as url from "url";
import * as dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const scopes = ["https://www.googleapis.com/auth/calendar.events"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: scopes,
});

console.log("1. Click this URL to authorize the app:\n\n", authUrl, "\n");
console.log("2. Waiting for Google callback on port 3000...");

const server = http.createServer(async (req, res) => {
  try {
    if (req.url && req.url.startsWith("/callback")) {
      const qs = new url.URL(req.url, "http://localhost:3000").searchParams;
      const code = qs.get("code");
      
      if (code) {
        res.end("Authentication successful! You can close this tab and return to your terminal.");
        server.close();
        
        const { tokens } = await oauth2Client.getToken(code);
        console.log("\n=== SUCCESS! ADD THIS TO YOUR .ENV FILE ===");
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log("=============================================\n");
        process.exit(0);
      } else {
        res.end("No code found in URL.");
      }
    }
  } catch (error) {
    console.error("Error exchanging token:", error);
    res.end("An error occurred.");
  }
});

server.listen(3000);