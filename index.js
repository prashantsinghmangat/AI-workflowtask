import fs from "fs";
import { google } from "googleapis";
import open from "open";
import readline from "readline";

// ======= CONFIG =======
// const CLIENT_ID = "";
// const CLIENT_SECRET = "";
// const REDIRECT_URI = "http://localhost:3000";

// ======= SETUP =======
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// ======= GET ACCESS TOKEN =======
const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];

function getAccessToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this URL:", authUrl);
  open(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error("Error retrieving access token", err);
        return;
      }
      oAuth2Client.setCredentials(token);
      fs.writeFileSync("token.json", JSON.stringify(token));
      console.log("✅ Token stored to token.json");
    });
  });
}

// Run once to get token
getAccessToken();
