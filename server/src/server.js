import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "./config/db.js";
import { requireAuth } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import machineRoutes from "./routes/machines.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../../public");

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "smartmaint-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/machines", requireAuth, machineRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.name === "ValidationError" ? 400 : 500).json({ message: error.message || "Internal server error" });
});

const startServer = () => app.listen(port, () => console.log(`SmartMaint API listening on http://localhost:${port}`));

if (process.env.MONGODB_URI) {
  connectDatabase()
    .then(startServer)
    .catch((error) => { console.error("Database startup failed:", error.message); process.exit(1); });
} else {
  console.warn("MONGODB_URI not configured — continuing without database connection for static frontend preview.");
  startServer();
}
