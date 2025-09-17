let ioInstance = null;
const userSockets = {};

function registerSocketIO(io) {
  ioInstance = io;
}

function trackUserSocket(userId, socketId) {
  if (!userSockets[userId]) {
    userSockets[userId] = [];
  }

  if (!userSockets[userId].includes(socketId)) {
    userSockets[userId].push(socketId);
  }
}

function untrackSocket(socketId) {
  for (const userId in userSockets) {
    userSockets[userId] = userSockets[userId].filter(id => id !== socketId);
    if (userSockets[userId].length === 0) {
      delete userSockets[userId];
      console.log(`❌ User ${userId} fully disconnected`);
    }
  }
}

function emitToUser(userId, event, data, exceptSocketId = null) {
  const socketIds = userSockets[userId] || [];
  if (socketIds.length === 0) {
    console.warn(`⚠️ User ${userId} not connected. Cannot emit ${event}`);
    return;
  }

  socketIds
    .filter(id => id !== exceptSocketId)
    .forEach(socketId => {
      ioInstance?.to(socketId).emit(event, data);
    });
}

function emitToAdmins(adminUserIds = [], event, data) {
  adminUserIds.forEach((adminId) => {
    const socketIds = userSockets[adminId] || [];

    if (socketIds.length === 0) {
      console.warn(`⚠️ Admin ${adminId} not connected. Cannot emit ${event}`);
      return;
    }

    socketIds.forEach(socketId => {
      ioInstance?.to(socketId).emit(event, data);
    });
  });
}


function getUserSockets() {
  return userSockets;
}

module.exports = {
  registerSocketIO,
  trackUserSocket,
  untrackSocket,
  emitToUser,
  getUserSockets,
  emitToAdmins,
};
