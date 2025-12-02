const emailtemplateModel = require("../models/emailtemplate.model");
const templateModel = require("../models/template.model");
const userModel = require("../models/user.model");

const getAllEmailTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res
        .status(404)
        .json({ status: "error", message: "User id not found." });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found." });
    }

    const companyId = user.companyId;
    const userRole = user.role;

    console.log(user);

    let query = { deleted: { $ne: true } };

    if (userRole === "admin") {
      query = { deleted: { $ne: true } };
    } else if (userRole === "company" || userRole === "employee") {
      query = {
        $or: [{ companyId: null }, { companyId: companyId }],
        deleted: { $ne: true },
      };
    } else {
      return res
        .status(403)
        .json({ status: "error", message: "Unauthorized user role." });
    }

    const emailTemplates = await emailtemplateModel
      .find(query)
      .populate("companyId")
      .select("-__v");

    return res.status(200).json({
      status: "success",
      message:
        emailTemplates.length === 0
          ? "No email templates found"
          : "Email Templates retrieved successfully",
      emailTemplates,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server Error while fetching email templates",
      error: error,
    });
  }
};

const getEmailTemplateById = async (req, res) => {
  const templateId = req.params.id;
  try {
    const emailTemplate = await emailtemplateModel
      .findById(templateId)
      .populate("companyId");
    if (emailTemplate) {
      return res.json(emailTemplate);
    }
    return res.status(404).json({
      status: "error",
      message: "Email Template not found",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server Error while fetching email template by ID",
    });
  }
};

const addEmailTemplate = async (req, res) => {
  const { template_name, subject, body } = req.body;

  try {
    const user = await userModel.findById(req.user.id);
    const companyId =
      user?.companyId || (user.role === "admin" ? null : undefined);

    if (companyId === undefined) {
      return res
        .status(404)
        .json({ status: "error", message: "User or company not found" });
    }

    const newEmailTemplate = new emailtemplateModel({
      template_name,
      subject,
      body,
      companyId,
    });

    await newEmailTemplate.save();
    return res.status(201).json({
      status: "success",
      message: "Email Template Added Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server Error while adding email template",
    });
  }
};

const updateEmailTemplate = async (req, res) => {
  const templateId = req.params.id;
  const updates = req.body;

  try {
    const user = await userModel.findById(req.user.id);
    const companyId =
      user?.companyId || (user.role === "admin" ? null : undefined);

    if (companyId === undefined) {
      return res
        .status(404)
        .json({ status: "error", message: "User or company not found" });
    }

    let emailTemplate = await emailtemplateModel.findById(templateId);

    if (!emailTemplate) {
      return res.status(404).json({
        status: "error",
        message: "Email Template not found or not authorized",
      });
    }

    Object.keys(updates).forEach((key) => {
      if (emailTemplate[key] !== undefined && updates[key] !== undefined) {
        emailTemplate[key] = updates[key];
      }
    });

    await emailTemplate.save();

    return res.json({
      status: "success",
      message: "Email Template Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Server Error while updating email template",
    });
  }
};

const deleteEmailTemplate = async (req, res) => {
  try {
    const emailTemplate = await emailtemplateModel.findById(req.params.id);

    if (!emailTemplate) {
      return res.status(404).json({
        status: "error",
        message: "Email Template not found",
      });
    }

    console.log(emailTemplate);
    const isEmailTemplateInUse = await templateModel.countDocuments({
      emailTemplate: emailTemplate.id,
    });

    if (isEmailTemplateInUse) {
      return res.status(400).json({
        status: "error",
        message:
          "This email template is being used in one or more templates and cannot be deleted.",
      });
    }

    emailTemplate.deleted = true;
    emailTemplate.deletedAt = new Date();
    await emailTemplate.save();

    return res.json({
      status: "success",
      message: "Email Template Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server Error while deleting email template",
    });
  }
};

module.exports = {
  getAllEmailTemplates,
  getEmailTemplateById,
  addEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
};
