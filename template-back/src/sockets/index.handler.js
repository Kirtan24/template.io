const permissionSocketHandler = require('./handlers/permission.handler');
const { companySocketHandler } = require('./handlers/company.handler');
const emailtemplateSocketHandler = require('./handlers/emailtemplate.handler');
const inboxSocketHandler = require('./handlers/inbox.handler');
const templateSocketHandler = require('./handlers/template.handler');
const userSocketHandler = require('./handlers/user.handler');
const utilSocketHandler = require('./handlers/util.handler');

function registerSocketHandlers(socket) {
  permissionSocketHandler(socket);
  companySocketHandler(socket);
  emailtemplateSocketHandler(socket);
  inboxSocketHandler(socket);
  templateSocketHandler(socket);
  userSocketHandler(socket);
  utilSocketHandler(socket);
}

module.exports = registerSocketHandlers;
