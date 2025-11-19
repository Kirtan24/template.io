require("dotenv").config();
const express = require("express");
const cors = require("cors");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const allRoutes = require("./src/routes");
const { connectToDb } = require("./src/config/mongo.config");
const { initSocket } = require("./src/sockets/socketIO");
const { startJobWorker } = require("./src/workers/jobWorker");
const morgan = require("morgan");

process.env.TZ = "Asia/Kolkata";

const app = express();
app.use(morgan("dev"));
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
// const FRONT_URL = process.env.FRONT_URL || "http://localhost:3000";

// ---------- Middlewares ----------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: FRONT_URL,
//     methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
//     credentials: true,
//   })
// );

// const allowedOrigins = [
//   "http://localhost:3000", // for local dev
//   "http://127.0.0.1:3000", // sometimes used locally
//   "http://frontend", // frontend container inside Docker
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
//     credentials: true,
//   })
// );

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ---------- Connect to DB & Sockets ----------
connectToDb();
initSocket(server);
startJobWorker();

// ---------- Routes ----------
app.use("/api", allRoutes);

// ---------- Base Route ----------
app.get("/", (req, res) => res.send("Template.io API is running"));

// ---------- Error Handling ----------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// ---------- Start Server ----------
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
