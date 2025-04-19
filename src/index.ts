import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";

import { errorHandler } from "./middleware/errorHandler";
import marketRoutes from "./routes/market.routes";

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || "https://your-frontend-domain.vercel.app"
      : "http://localhost:5173",
  credentials: true,
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);

app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Solo iniciamos el servidor si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
