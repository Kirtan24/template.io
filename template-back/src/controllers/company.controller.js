require("dotenv").config();
const companyModel = require("../models/company.model");
const templateModel = require("../models/template.model");
const emailTemplateModel = require("../models/emailtemplate.model");
const userModel = require("../models/user.model");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../services/mail.service");

const getAllCompanies = async (req, res) => {
  try {
    const companies = await companyModel
      .find()
      .populate("permissions")
      .populate("plan", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ companies });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching companies", error: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const company = await companyModel.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Fetch and log associated users
    let users = await userModel.countDocuments({ companyId: id });
    console.log(`Users associated with company ${id}:`, users);

    // Fetch and log associated templates
    let templates = await templateModel.countDocuments({ companyId: id });
    console.log(`Templates associated with company ${id}:`, templates);

    // Fetch and log associated email templates
    let emailTemplates = await emailTemplateModel.countDocuments({
      companyId: id,
    });
    console.log(
      `Email templates associated with company ${id}:`,
      emailTemplates
    );

    // Delete associated users
    const deletedUsers = await userModel.deleteMany({ companyId: id });
    console.log(
      `${deletedUsers.deletedCount} users deleted associated with the company.`
    );

    // Delete associated templates
    const deletedTemplates = await templateModel.deleteMany({ companyId: id });
    console.log(
      `${deletedTemplates.deletedCount} templates deleted associated with the company.`
    );

    // Delete associated email templates
    const deletedEmailTemplates = await emailTemplateModel.deleteMany({
      companyId: id,
    });
    console.log(
      `${deletedEmailTemplates.deletedCount} email templates deleted associated with the company.`
    );

    // Delete the company itself
    await company.deleteOne();

    res.status(200).json({
      status: "success",
      message:
        "Company, associated users, templates, and email templates deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting company and related data: " + error.message,
    });
  }
};

const updatePermissions = async (req, res) => {
  try {
    const { id, permissions, type } = req.body;

    if (type === "cmp") {
      const company = await companyModel.findById(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const oldPermissions = company.permissions;
      company.permissions = permissions;
      await company.save();

      const users = await userModel.find({ companyId: id });

      for (let user of users) {
        user.permissions = user.permissions.filter((perm) =>
          permissions.includes(perm)
        );
        await user.save();
      }

      res
        .status(200)
        .json({
          message: "Company permissions updated and user permissions adjusted.",
          company,
        });
    } else if (type === "u") {
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.permissions = permissions;
      await user.save();

      res
        .status(200)
        .json({ message: "User permissions updated successfully.", user });
    } else {
      return res
        .status(400)
        .json({ message: 'Invalid type provided. Must be "cmp" or "u".' });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating permissions", error: error.message });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyModel.findById(id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ company });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching company details",
        error: error.message,
      });
  }
};

const companyEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await companyModel.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    const employees = await userModel.find({ companyId: id }).sort({ role: 1 });
    res.status(200).json({ employees });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employees", error: error.message });
  }
};

const companyProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await companyModel
      .findById(id)
      .select("name email contactNumber address plan companyStatus")
      .populate("permissions")
      .populate("plan", "name");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ company });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching company profile",
        error: error.message,
      });
  }
};

const inactiveCompany = async (req, res) => {
  try {
    const inactiveCount = await companyModel.countDocuments({
      companyStatus: "inactive",
    });
    const inactiveCompanies = await companyModel
      .find({ companyStatus: "inactive" })
      .populate("plan", "name");

    return res.status(200).json({
      count: inactiveCount ? inactiveCount : 0,
      companies: inactiveCompanies ? inactiveCompanies : [],
    });
  } catch (err) {
    console.error("Error fetching inactive companies:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const getPermissionsByPlan = (plan) => {
  const plans = {
    basic: [
      "67bf5ea0fb8a2e9f773050de",
      "67bf5ea0fb8a2e9f773050e6",
      "67bf5ea0fb8a2e9f773050df",
      "67bf5ea0fb8a2e9f773050e0",
      "67bf5ea0fb8a2e9f773050e1",
      "67bf5ea0fb8a2e9f773050e9",
      "67bf5ea0fb8a2e9f773050e7",
      "67e3ebe4abe632ac789fef63",
      "67bf5ea0fb8a2e9f773050e8",
      "67c0c605d4c82d5aa4b5af25",
      "67bf5ea0fb8a2e9f773050ea",
      "67c056c7bb3b8c72cc725c53",
    ],
    professional: [
      "67bf5ea0fb8a2e9f773050de",
      "67bf5ea0fb8a2e9f773050e6",
      "67bf5ea0fb8a2e9f773050ea",
      "67bf5ea0fb8a2e9f773050d8",
      "67bf5ea0fb8a2e9f773050da",
      "67bf5ea0fb8a2e9f773050db",
      "67bf5ea0fb8a2e9f773050dc",
      "67bf5ea0fb8a2e9f773050df",
      "67bf5ea0fb8a2e9f773050e0",
      "67bf5ea0fb8a2e9f773050e1",
      "67bf5ea0fb8a2e9f773050e7",
      "67c0c605d4c82d5aa4b5af25",
      "67bf5ea0fb8a2e9f773050e8",
      "67bf5ea0fb8a2e9f773050e9",
      "67c056c7bb3b8c72cc725c53",
      "67c056c7bb3b8c72cc725c56",
      "67e3ebe4abe632ac789fef63",
      "67bf5ea0fb8a2e9f773050d9",
      "67ea8b15e3da734f0ee0d490",
      "67bf5ea0fb8a2e9f773050eb",
    ],
    enterprise: [
      "67bf5ea0fb8a2e9f773050d8",
      "67bf5ea0fb8a2e9f773050de",
      "67bf5ea0fb8a2e9f773050e6",
      "67bf5ea0fb8a2e9f773050ea",
      "67bf5ea0fb8a2e9f773050d9",
      "67bf5ea0fb8a2e9f773050da",
      "67bf5ea0fb8a2e9f773050db",
      "67bf5ea0fb8a2e9f773050df",
      "67bf5ea0fb8a2e9f773050e0",
      "67bf5ea0fb8a2e9f773050e1",
      "67bf5ea0fb8a2e9f773050e7",
      "67bf5ea0fb8a2e9f773050e8",
      "67c0c605d4c82d5aa4b5af25",
      "67bf5ea0fb8a2e9f773050e9",
      "67c056c7bb3b8c72cc725c53",
      "67bf5ea0fb8a2e9f773050eb",
      "67c056c6bb3b8c72cc725c50",
      "67c056c7bb3b8c72cc725c56",
      "67e3ebe4abe632ac789fef63",
      "67bf5ea0fb8a2e9f773050dc",
    ],
  };
  return plans[plan] || [];
};

const approveCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);
    const admin = await userModel.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name: company.name,
      email: company.email,
      password: hashedPassword,
      phone: company.contactNumber,
      companyId: companyId,
      role: "company",
      permissions: company.permissions,
    });

    await newUser.save();

    company.companyStatus = "active";
    await company.save();

    await sendEmail(
      admin.email,
      company.email,
      "Company Registration Approved",
      `Congratulations! Your company registration has been approved.\n\nHere are your login credentials:\nUsername: ${company.email}\nPassword: ${password}\n\nPlease log in and change your password immediately.`
    );

    return res.status(200).json({
      status: "success",
      message: "Company approved successfully and login credentials sent.",
      company,
    });
  } catch (err) {
    console.error("Error approving company:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const rejectCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);
    const admin = await userModel.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.companyStatus = "suspended";
    await company.save();

    await sendEmail(
      admin.email,
      company.email,
      "Company Registration Rejected",
      "We regret to inform you that your company registration has been rejected. Please contact support for further details."
    );

    return res.status(200).json({
      status: "success",
      message: "Company rejected successfully",
      company,
    });
  } catch (err) {
    console.error("Error rejecting company:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllCompanies,
  deleteCompany,
  updatePermissions,
  companyEmployees,
  companyProfile,
  getCompanyById,
  inactiveCompany,
  getPermissionsByPlan,
  approveCompany,
  rejectCompany,
  sendEmail,
};
