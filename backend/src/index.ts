// Entry point of the application + Start the server

import { startDepositWatcher } from "./modules/deposit/deposit.watcher";
import server from "./server";
import { connectDB } from "./utils/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

// MONGO_URL is the name Railway's MongoDB service publishes, so it is the
// primary. MONGO_URI is kept as a fallback for existing local .env files.
const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI || "";

if (!MONGO_URL) {
  console.error(
    "MONGO_URL is not set. Set it to the MongoDB connection string " +
      "(on Railway: MONGO_URL=${{MongoDB.MONGO_URL}})."
  );
}

connectDB(MONGO_URL).then(() => {
  server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});
