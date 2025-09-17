const socketIO = require("socket.io");
const socketHelper = require("../utils/socketHelpers");
const registerSocketHandlers = require("./index.handler");

const FRONT_URL =
  process.env.FRONT_URL || "http://localhost:3000" || "http://127.0.0.1:3000";

if (!FRONT_URL) {
  console.error("FRONT_URL is not defined in the environment variables.");
  process.exit(1);
}

function initSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  socketHelper.registerSocketIO(io);

  io.on("connection", (socket) => {
    // console.log('✅ New client connected:', socket.id);

    socket.on("user-connected", (userId) => {
      socketHelper.trackUserSocket(userId, socket.id);
      // console.log(`🟢 User ${userId} registered with socket ID: ${socket.id}`);
    });

    registerSocketHandlers(socket);

    socket.on("disconnect", () => {
      socketHelper.untrackSocket(socket.id);
      // console.log('❌ Client disconnected:', socket.id);
      // console.log('Current Connections:', JSON.stringify(socketHelper.getUserSockets()));
    });
  });
}

module.exports = { initSocket };
