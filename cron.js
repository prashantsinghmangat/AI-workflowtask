import cron from "node-cron";
import { checkMail } from "./checkGmail.js";

// Run once at startup (optional)
checkMail();

cron.schedule("*/5 * * * *", () => {
  console.log("⏰ Checking Gmail...");
  checkMail();
});
