import dotenv from "dotenv";

// Load environment variables FIRST - before any other imports
dotenv.config();

import app from "./app";
import { runDatabaseMigrations } from "./db/runMigrations";

async function startServer() {
  try {
    // Run migrations first, before starting the server
    await runDatabaseMigrations();

    // Start the server only after migrations complete
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
