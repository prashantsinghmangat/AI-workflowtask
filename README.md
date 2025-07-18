# 📧 Gmail to Pipedream Automation

Automate reading **primary** Gmail emails, sending them to a **Pipedream workflow**, summarizing with **Together AI**, and updating your database or tasks — all **serverless**.

---

## ✨ What this project does

✅ Checks your **Gmail inbox** every 5 minutes  
✅ Reads **only unread Primary emails**  
✅ Sends the email snippet to **Pipedream webhook**  
✅ **Pipedream** calls **Together AI** for summarizing or task extraction  
✅ Final result is logged, stored, or pushed to your DB  
✅ Marks the email as **read** so it’s not processed again

---

## 🗂️ Project Structure
/work-flow-auto
│
├── index.js # Run once to get Gmail OAuth token
├── checkGmail.js # Checks Gmail & calls webhook
├── cron.js # Runs checkGmail.js on a schedule
├── token.json # Stores Gmail OAuth token
├── .env # (Recommended) Store secrets here
├── README.md # This file!

---

## ⚙️ How it works (flow)

graph TD
  A[Gmail Inbox] -->|cron every 5 min| B[Node.js (checkGmail.js)]
  B -->|HTTP POST| C[Pipedream Trigger]
  C --> D[Together AI Step]
  D --> E[Code Step]
  E --> F[Save/Send to DB, Slack, Notion]


🚀 Setup Instructions
1️⃣ Create your Google Cloud Project
Go to Google Cloud Console.

Create a new project.

Enable Gmail API.

Go to APIs & Services → Credentials.

Create OAuth Client ID:

Application type: Web Application

Redirect URI: http://localhost:3000

Download your client_id and client_secret.

2️⃣ Authenticate Gmail
Run:

bash
Copy
Edit
node index.js
Follow the link → Sign in → Allow permissions.

Copy the code → Paste in terminal.

This saves token.json.

3️⃣ Create Pipedream Workflow
Go to Pipedream.

New Workflow → Trigger → HTTP Request.

Copy the trigger URL, e.g.:

arduino
Copy
Edit
https://eox86lfh20r14e3.m.pipedream.net
Add a step: Node.js code or Together AI action:

Call Together AI:

javascript
Copy
Edit
const emailText = steps.trigger.event.body.text;

const response = await fetch("https://api.together.xyz/inference", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "togethercomputer/llama-3-70b",
    prompt: `Summarize this email:\n${emailText}`,
  }),
});

return await response.json();
Add output step:

Store in Airtable, Supabase, Notion, Slack, or just log it.

Deploy your workflow.

4️⃣ Update your Node.js checkGmail.js
js
Copy
Edit
import fs from "fs";
import { google } from "googleapis";
import fetch from "node-fetch";

const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
const REDIRECT_URI = "http://localhost:3000";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const token = JSON.parse(fs.readFileSync("token.json"));
oAuth2Client.setCredentials(token);

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

async function checkMail() {
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread category:primary",
      maxResults: 5,
    });

    const messages = res.data.messages || [];
    console.log(`Found ${messages.length} unread Primary emails`);

    for (const msg of messages) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const snippet = full.data.snippet;
      console.log("Email snippet:", snippet);

      const webhookUrl = "YOUR_PIPEDREAM_WEBHOOK_URL";
      const webhookRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: snippet }),
      });

      const text = await webhookRes.text();
      console.log("Webhook response:", text);

      await gmail.users.messages.modify({
        userId: "me",
        id: msg.id,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });

      console.log(`✅ Marked email ${msg.id} as read`);
    }
  } catch (err) {
    console.error(err);
  }
}

checkMail();
5️⃣ Automate with cron.js
js
Copy
Edit
import cron from "node-cron";
import "./checkGmail.js";

cron.schedule("*/5 * * * *", () => {
  console.log("⏰ Checking Gmail...");
  import("./checkGmail.js");
});
Run with:

bash
Copy
Edit
node cron.js
Or forever with:

bash
Copy
Edit
npx pm2 start cron.js --name gmail-checker
✅ .env Example
env
Copy
Edit
CLIENT_ID=YOUR_CLIENT_ID
CLIENT_SECRET=YOUR_CLIENT_SECRET
TOGETHER_API_KEY=YOUR_TOGETHER_API_KEY
🗂️ Logs and Debugging
Gmail → If token fails, delete token.json and re-run index.js

Pipedream → Inspect logs in the workflow run history.

Together AI → Make sure your API key is valid.

Webhook URL → Must be correct and active.

🔒 Security Tips
✅ Never commit token.json or .env.
✅ Use gitignore.
✅ Store secrets in Pipedream environment variables.
✅ Rotate your OAuth and Together AI keys if you suspect leaks.

✅ Done!
📬 Now your Gmail → Pipedream → Together AI → DB flow is automated, scalable, and easy to maintain.

📚 Useful Links
Google OAuth Docs

Pipedream Docs

Together AI API

node-cron

PM2

Happy automating! 🚀✨

markdown
Copy
Edit

---

## ✅ Next step

If you’d like, I can package this as a **starter GitHub repo** with:
- `index.js`  
- `checkGmail.js`  
- `cron.js`  
- `.env.example`  
- This `README.md`  

Just say **“Yes, create the repo template!”** and I’ll generate it for you.

Want that? 🔥
