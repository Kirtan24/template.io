const permissionModel = require('../../models/permission.model');
const { emitToUser } = require('../../utils/socketHelpers');

function permissionSocketHandler(socket) {
  socket.on('get-all-permissions', async (userId) => {
    try {
      const permissions = await permissionModel.find().sort({ createdAt: -1 });
      emitToUser(userId.toString(), 'all-permissions', { permissions });
    } catch (error) {
      console.error("Socket error in get-all-permissions:", error);
      emitToUser(userId.toString(), 'all-permissions', {
        permissions: [],
        error: 'Failed to fetch permissions.',
      });
    }
  });
}

module.exports = permissionSocketHandler;
