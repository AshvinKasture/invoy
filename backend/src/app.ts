import cors from "cors";
import express from "express";
import { globalErrorHandler } from "./middleware/errorHandler";
import userRoute from "./routes/users";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoute);

app.get("/", (req, res) => {
  res.send("Welcome to the Invoy API!");
});

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

export default app;
