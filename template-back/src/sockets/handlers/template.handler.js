const permissionModel = require("../../models/permission.model");
const templateModel = require("../../models/template.model");
const inboxModel = require("../../models/inbox.model");
const emailtemplateModel = require("../../models/emailtemplate.model");
const companyModel = require("../../models/company.model");
const userModel = require("../../models/user.model");
const planModel = require("../../models/plan.model");
const { emitToUser } = require("../../utils/socketHelpers");

const getAllTemplatesService = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const companyId = user.companyId;
  const userRole = user.role;

  let query = { deleted: { $ne: true } };

  if (userRole === "admin") {
    query = { deleted: { $ne: true } }; // All templates
  } else if (userRole === "company" || userRole === "employee") {
    query = {
      $or: [{ companyId: null }, { companyId: companyId }],
      isActive: true,
      deleted: { $ne: true },
    };
  } else {
    throw new Error("Unauthorized user role");
  }

  const templates = await templateModel
    .find(query)
    .populate("emailTemplate")
    .populate("companyId")
    .select("-__v");

  return templates;
};

function templateSocketHandler(socket) {
  socket.on("get-all-templates", async (userId) => {
    try {
      const templates = await getAllTemplatesService(userId);
      emitToUser(userId.toString(), "all-templates", {
        status: "success",
        templates,
      });
    } catch (error) {
      emitToUser(userId.toString(), "all-templates", {
        status: "error",
        templates: [],
        error: error.message || "Failed to fetch templates",
      });
    }
  });
}

module.exports = templateSocketHandler;
