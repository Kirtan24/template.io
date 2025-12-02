const permissionModel = require("../../models/permission.model");
const templateModel = require("../../models/template.model");
const inboxModel = require("../../models/inbox.model");
const emailtemplateModel = require("../../models/emailtemplate.model");
const companyModel = require("../../models/company.model");
const userModel = require("../../models/user.model");
const planModel = require("../../models/plan.model");
const { emitToUser } = require("../../utils/socketHelpers");

const getAllInboxService = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User id not found.");
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const companyId = user.companyId;
    const userRole = user.role;

    let query = {};
    if (userRole === "admin") {
      query = {};
    } else if (userRole === "company" || userRole === "employee") {
      query = { companyId: companyId };
    } else {
      throw new Error("Unauthorized user role.");
    }

    const mails = await inboxModel
      .find(query)
      .select(
        "senderEmail recipientEmail subject body emailTemplateId documentTemplateId documentLink sentTimestamp companyId isSigned isForSign status scheduledTime signedTimestamp signingUserId oneTimeToken"
      )
      .populate("documentTemplateId", "name")
      .populate("emailTemplateId", "template_name")
      .populate("signingUserId", "name")
      .populate("companyId", "name")
      .sort({ createdAt: -1 });

    return mails || [];
  } catch (error) {
    throw new Error("Failed to fetch inbox.");
  }
};
function templateSocketHandler(socket) {
  socket.on("get-all-inbox", async (userId) => {
    try {
      const inboxItems = await getAllInboxService(userId);
      emitToUser(userId.toString(), "all-inbox", {
        status: "success",
        mails: inboxItems,
      });
    } catch (error) {
      emitToUser(userId.toString(), "all-inbox", {
        status: "error",
        mails: [],
        error: error.message || "Failed to fetch inbox",
      });
    }
  });
}

module.exports = templateSocketHandler;
