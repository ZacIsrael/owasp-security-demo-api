// Import the express framework to create and manage the web server
import express, { Application, Request, Response } from "express";

// Enables Cross-Origin Resource Sharing, allowing frontend apps on
// different ports (like React) to make requests to this API
import cors from "cors";
import cookieParser from "cookie-parser";

// import routes
import authRouter from "./routes/auth.routes";

// Loads environment variables from a `.env` file into process.env
// Used for storing sensitive data like database credentials, API keys, etc.
import dotenv from "dotenv";
import { connectToPostgres } from "./database/postgres/connection";
import { errorHandler } from "./middleware/error.middleware";
// Must be called immediately after importing to make env vars available
dotenv.config();

// Create an Express application instance
const app: Application = express();

// Define the port in which the Express server will listen on
const port: number = parseInt(process.env.PORT || "8000", 10);

// connect to postgreSQL database
connectToPostgres();

// Enable cross-origin requests with credentials for production and development
// Ensure origin matches frontend URL(s) exactly
app.use(
  cors({
    origin: [
      // frontend url (for development)
      "http://localhost:3000",
      // if/when the frontend gets deployed, its url goes here
      // "https://real-app-frontend-domain.com"
    ],
    credentials: true,
  })
);

// Parses incoming HTTP requests with JSON payloads
// and makes the parsed data available on req.body
app.use(express.json());

// Parse cookies from incoming requests
// Required for reading refresh tokens stored in httpOnly cookies
app.use(cookieParser());

// API version
const API_VERSION = 1;

// import routes
app.use(`/api/v${API_VERSION}/auth`, authRouter);

app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("API running");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
