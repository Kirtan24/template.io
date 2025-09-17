const permissionModel = require("../../models/permission.model");
const templateModel = require("../../models/template.model");
const inboxModel = require("../../models/inbox.model");
const emailtemplateModel = require("../../models/emailtemplate.model");
const companyModel = require("../../models/company.model");
const userModel = require("../../models/user.model");
const planModel = require("../../models/plan.model");
const { emitToUser } = require("../../utils/socketHelpers");

const getAllEmailTemplatesService = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw new Error("User not found.");

  const companyId = user.companyId;
  const userRole = user.role;

  let query = { deleted: { $ne: true } };

  if (userRole === "admin") {
    query = { deleted: { $ne: true } };
  } else if (userRole === "company" || userRole === "employee") {
    query = {
      $or: [{ companyId: null }, { companyId: companyId }],
      deleted: { $ne: true },
    };
  } else {
    throw new Error("Unauthorized user role.");
  }

  const emailTemplates = await emailtemplateModel
    .find(query)
    .populate("companyId")
    .select("-__v");

  return emailTemplates;
};

function templateSocketHandler(socket) {
  socket.on("get-all-email-templates", async (userId) => {
    try {
      const emailTemplates = await getAllEmailTemplatesService(userId);
      emitToUser(userId.toString(), "all-email-templates", {
        status: "success",
        emailTemplates,
      });
    } catch (error) {
      emitToUser(userId.toString(), "all-email-templates", {
        status: "error",
        emailTemplates: [],
        error: error.message || "Failed to fetch email templates",
      });
    }
  });
}

module.exports = templateSocketHandler;
