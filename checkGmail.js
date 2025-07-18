import fs from "fs";
import { google } from "googleapis";
import fetch from "node-fetch";

// CONFIG
// const CLIENT_ID = "";
// const CLIENT_SECRET = "";
// const REDIRECT_URI = "http://localhost:3000";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const token = JSON.parse(fs.readFileSync("token.json"));
oAuth2Client.setCredentials(token);

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

export async function checkMail() {
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread category:primary",
      maxResults: 5,
    });

    const messages = res.data.messages || [];
    console.log(`Found ${messages.length} unread emails`);

    for (const msg of messages) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const snippet = full.data.snippet;
      console.log("Email snippet:", snippet);

      const webhookUrl = "";  //add you webhook url
      const webhookRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: snippet }),
      });

      const contentType = webhookRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const webhookJson = await webhookRes.json();
        console.log("✅ Webhook JSON:", webhookJson);
      } else {
        const text = await webhookRes.text();
        console.log("⚠️ Webhook returned non-JSON:", text);
      }

      await gmail.users.messages.modify({
        userId: "me",
        id: msg.id,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });

      console.log(`✅ Processed and marked email ${msg.id} as read`);
    }
  } catch (err) {
    console.error(err);
  }
}