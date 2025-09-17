const permissionModel = require("../../models/permission.model");
const templateModel = require("../../models/template.model");
const inboxModel = require("../../models/inbox.model");
const emailtemplateModel = require("../../models/emailtemplate.model");
const companyModel = require("../../models/company.model");
const userModel = require("../../models/user.model");
const planModel = require("../../models/plan.model");
const { emitToUser } = require("../../utils/socketHelpers");

const getTotalCompanies = async () => {
  return await companyModel.countDocuments({ companyStatus: "active" });
};

const getTotalUsers = async ({ userId, companyId }) => {
  const user = await userModel.findById(userId);
  if (user.role === "admin") {
    return await userModel.countDocuments({ role: { $ne: "admin" } });
  } else {
    return await userModel.countDocuments({ companyId });
  }
};

const getTotalTemplates = async () => {
  return await templateModel.countDocuments({
    $or: [{ companyId: null }, { companyId: { $ne: null, $exists: true } }],
  });
};

const getTemplatesCreatedByCompany = async ({ companyId }) => {
  // console.log(companyId);
  return await templateModel.countDocuments({
    companyId: { $ne: null, $exists: true },
  });
};

const getTotalActiveDashboards = async ({ companyId }) => {
  const company = await companyModel.findById(companyId, {
    activeDashboard: 1,
  });
  return company?.activeDashboard || 0;
};

const utilSocketHandler = (socket) => {
  socket.on("get-total-companies", async (data) => {
    try {
      const total = await getTotalCompanies();
      emitToUser(data?.userId, "total-companies", total);
    } catch (error) {
      emitToUser(data.userId, "total-companies", {
        status: "error",
        total: 0,
        error: error.message || "Failed to fetch total companies",
      });
    }
  });

  socket.on("get-total-users", async (data) => {
    try {
      const total = await getTotalUsers(data);
      emitToUser(data.userId, "total-users", total);
    } catch (error) {
      emitToUser(data.userId, "total-users", {
        status: "error",
        total: 0,
        error: error.message || "Failed to fetch total users",
      });
    }
  });

  socket.on("get-total-templates", async (data) => {
    try {
      const total = await getTotalTemplates();
      emitToUser(data.userId, "total-templates", total);
    } catch (error) {
      emitToUser(data.userId, "total-templates", {
        status: "error",
        total: 0,
        error: error.message || "Failed to fetch total templates",
      });
    }
  });

  socket.on("get-templates-created-by-company", async (data) => {
    try {
      const total = await getTemplatesCreatedByCompany(data);
      emitToUser(data.userId, "templates-created-by-company", total);
    } catch (error) {
      emitToUser(data.userId, "templates-created-by-company", {
        status: "error",
        total: 0,
        error: error.message || "Failed to fetch company templates",
      });
    }
  });

  socket.on("get-total-active-dashboards", async (data) => {
    try {
      const total = await getTotalActiveDashboards(data);
      emitToUser(data.userId, "total-active-dashboards", total);
    } catch (error) {
      emitToUser(data.userId, "total-active-dashboards", {
        status: "error",
        total: 0,
        error: error.message || "Failed to fetch active dashboards",
      });
    }
  });
};

module.exports = utilSocketHandler;
