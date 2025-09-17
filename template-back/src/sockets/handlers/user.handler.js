const permissionModel = require("../../models/permission.model");
const templateModel = require("../../models/template.model");
const inboxModel = require("../../models/inbox.model");
const emailtemplateModel = require("../../models/emailtemplate.model");
const companyModel = require("../../models/company.model");
const userModel = require("../../models/user.model");
const planModel = require("../../models/plan.model");
const { emitToUser } = require("../../utils/socketHelpers");

const getAllUserService = async (data) => {
  if (!data.userId) {
    throw new Error("User not authenticated");
  }

  const user = await userModel
    .findById(data.userId)
    .populate("companyId", "name");

  if (!user) {
    throw new Error("User not found");
  }

  let users;

  if (user.role === "admin") {
    users = data.companyId
      ? await userModel
          .find({ companyId: data.companyId })
          .populate("companyId", "name")
          .sort({ role: 1 })
      : await userModel.find().populate("companyId", "name").sort({ role: 1 });
  } else {
    users = await userModel
      .find({ companyId: user.companyId })
      .populate("companyId", "name")
      .sort({ role: 1 });
  }

  return users;
};

function templateSocketHandler(socket) {
  socket.on("get-all-employee", async (data) => {
    try {
      const employee = await getAllUserService(data);
      emitToUser(data.userId.toString(), "all-employee", {
        status: "success",
        users: employee,
      });
    } catch (error) {
      emitToUser(data.userId.toString(), "all-employee", {
        status: "error",
        users: [],
        error: error.message || "Failed to fetch employee",
      });
    }
  });
}

module.exports = templateSocketHandler;
