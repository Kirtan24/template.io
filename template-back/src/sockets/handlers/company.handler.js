const permissionModel = require("../../models/permission.model");
const templateModel = require("../../models/template.model");
const inboxModel = require("../../models/inbox.model");
const emailtemplateModel = require("../../models/emailtemplate.model");
const companyModel = require("../../models/company.model");
const userModel = require("../../models/user.model");
const planModel = require("../../models/plan.model");
const { emitToUser } = require("../../utils/socketHelpers");

const getAllCompaniesService = async () => {
  const companies = await companyModel
    .find()
    .populate("permissions")
    .populate("plan", "name")
    .sort({ createdAt: -1 });

  return companies;
};

const inactiveCompany = async () => {
  try {
    const inactiveCount = await companyModel.countDocuments({
      companyStatus: "inactive",
    });
    const inactiveCompanies = await companyModel
      .find({ companyStatus: "inactive" })
      .populate("plan", "name");

    return {
      count: inactiveCount ? inactiveCount : 0,
      companies: inactiveCompanies ? inactiveCompanies : [],
    };
  } catch (err) {
    console.error("Error fetching inactive companies:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

function companySocketHandler(socket) {
  socket.on("get-all-companies", async (userId) => {
    try {
      const companies = await getAllCompaniesService();
      emitToUser(userId.toString(), "all-companies", {
        status: "success",
        companies,
      });
    } catch (error) {
      emitToUser(userId.toString(), "all-companies", {
        status: "error",
        companies: [],
        error: error.message || "Failed to fetch companies",
      });
    }
  });

  socket.on("inactive-companies-updated", async (userId) => {
    try {
      const companies = await inactiveCompany();
      emitToUser(userId.toString(), "inactive-companies", companies);
    } catch (error) {
      emitToUser(userId.toString(), "inactive-companies", {
        status: "error",
        companies: [],
        error: error.message || "Failed to fetch companies",
      });
    }
  });
}

module.exports = { companySocketHandler, inactiveCompany };
