import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import favoritesRoutes from "./routes/favorites.routes";
import orderRoutes from "./routes/orders";
import walletRoutes from "./routes/wallet.routes";

import { errorHandler } from "./middleware/errorHandler";
import marketRoutes from "./routes/market.routes";
import "./cron/cron";

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || "https://your-frontend-domain.vercel.app"
      : ["http://localhost:5173", "http://localhost:5174"],
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
app.use("/trading/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wallet", walletRoutes);

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
