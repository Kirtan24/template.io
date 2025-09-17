const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const templateModel = require("../models/template.model");
const userModel = require("../models/user.model");
const {
  deleteCloudFile,
  uploadToCloudinary,
} = require("../services/cloudinary.service");

// Helper Functions - Extracted from main controller functions
const validateUser = async (userId) => {
  if (!userId) {
    throw new Error("User id not found");
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const buildTemplateQuery = (userRole, companyId) => {
  let query = { deleted: { $ne: true } };

  if (userRole === "admin") {
    query = {
      companyId: null,
      deleted: { $ne: true },
    };
  } else if (userRole === "company" || userRole === "employee") {
    query = {
      $or: [{ companyId: null }, { companyId: companyId }],
      isActive: true,
      deleted: { $ne: true },
    };
  } else {
    throw new Error("Unauthorized user role");
  }

  return query;
};

const validateTemplateId = (templateId) => {
  if (!templateId) {
    throw new Error("Template id is required");
  }
};

const validateFile = (file) => {
  if (!file) {
    throw new Error("File is required");
  }
};

const validateFilename = (filename) => {
  if (!filename) {
    throw new Error("Filename is required");
  }
};

const generateNewFilename = () => {
  return `template_${Date.now()}.docx`;
};

const handleOldFileCleanup = async (oldFilename) => {
  if (!oldFilename) return;

  try {
    const deleteResult = await deleteCloudFile(oldFilename, {
      resourceType: "raw",
      folder: "templates",
    });

    if (deleteResult.result !== "ok") {
      throw new Error("Failed to delete old file from Cloudinary");
    }
  } catch (deleteError) {
    console.error("Error deleting old file:", deleteError);
    throw new Error("Error deleting old file from Cloudinary");
  }
};

const processDocxFile = (fileBuffer) => {
  const zip = new PizZip(fileBuffer);
  const doc = new Docxtemplater(zip);
  doc.compile();

  return extractVariablesFromDocx(doc);
};

const extractVariablesFromDocx = (doc) => {
  const text = doc.getFullText();
  const variableSet = new Set();
  const regex = /{(.*?)}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    variableSet.add(match[1]);
  }

  return Array.from(variableSet);
};

const formatFields = (fields) => {
  return fields.map((field) => ({
    name: field.name,
    placeholder: field.placeholder,
    inputType: field.inputType,
    isSignature:
      field.inputType === "file" ? field.isSignature || false : undefined,
  }));
};

const createTemplateData = (templateInfo, cloudinaryResponse, companyId) => {
  const { name, description, emailTemplate, isSignature } = templateInfo;
  const filename = cloudinaryResponse.public_id.replace("templates/", "");

  return {
    name,
    filename,
    companyId,
    description,
    emailTemplate,
    isSignature: isSignature === "true",
    fileUrl: cloudinaryResponse.secure_url,
  };
};

const handleDocxProcessingError = (error) => {
  console.error("Error during DOCX processing:", error);

  if (error.id === "multi_error") {
    const errorMessages = error.properties.errors
      .map((err) => err.message)
      .join(", ");
    throw new Error(
      `The uploaded document has multiple issues with template tags: ${errorMessages}. Please upload a valid document.`
    );
  }

  throw new Error("Internal Server Error");
};

const handleGeneralUploadError = (error) => {
  console.error("General error:", error.message);

  if (error.message.includes("Duplicate open tag")) {
    throw new Error(
      "The uploaded document contains an issue with template tags. Please upload a valid document."
    );
  }

  throw error;
};

const findTemplateById = async (templateId) => {
  const template = await templateModel
    .findById(templateId)
    .populate("emailTemplate")
    .populate("companyId")
    .select("-__v");

  if (!template) {
    throw new Error("Template not found");
  }

  return template;
};

const validateTemplateActive = (template) => {
  if (!template.isActive) {
    const error = new Error("Template is inactive");
    error.statusCode = 203;
    throw error;
  }
};

const deleteFileFromCloudinary = async (filename) => {
  const deleteResult = await deleteCloudFile(filename, {
    resourceType: "raw",
    folder: "templates",
  });

  if (deleteResult.result !== "ok") {
    throw new Error("Failed to delete file from Cloudinary");
  }
};

const validateTemplateForDeletion = (template) => {
  if (!template) {
    throw new Error("Template not found");
  }

  if (!template.filename) {
    throw new Error("No file associated with this template");
  }
};

const markTemplateAsDeleted = async (template) => {
  template.deleted = true;
  template.deletedAt = new Date();
  await template.save();
};

// Main Controller Functions
const getAllTemplates = async (req, res) => {
  try {
    const user = await validateUser(req.user.id);
    const query = buildTemplateQuery(user.role, user.companyId);

    const templates = await templateModel
      .find(query)
      .populate("emailTemplate")
      .populate("companyId")
      .select("-__v");

    return res.json({
      status: "success",
      message:
        templates.length === 0
          ? "No templates found"
          : "Templates retrieved successfully",
      data: templates,
    });
  } catch (error) {
    console.error(error);
    const statusCode = error.message.includes("Unauthorized")
      ? 403
      : error.message.includes("not found")
      ? 404
      : 500;

    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Server Error while fetching templates",
    });
  }
};

const getTemplateById = async (req, res) => {
  try {
    validateTemplateId(req.params.id);
    const template = await findTemplateById(req.params.id);
    validateTemplateActive(template);

    return res.json(template);
  } catch (error) {
    console.error(error);
    const statusCode =
      error.statusCode ||
      (error.message.includes("not found")
        ? 404
        : error.message.includes("required")
        ? 400
        : 500);

    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Server Error while fetching template by ID",
    });
  }
};

const updateTemplateStatus = async (req, res) => {
  try {
    const templateId = req.params.id;
    const { isActive } = req.body;

    const template = await templateModel.findByIdAndUpdate(
      templateId,
      { isActive },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        status: "error",
        message: "Template not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Template status updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error updating template status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteFileFromCloudinaryController = async (req, res) => {
  try {
    const { filename } = req.params;
    validateFilename(filename);

    await deleteFileFromCloudinary(filename);

    return res.status(200).json({
      status: "success",
      message: "Process Canceled!",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    const statusCode = error.message.includes("required") ? 400 : 500;

    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Error deleting file from Cloudinary",
    });
  }
};

const uploadTemplate = async (req, res) => {
  try {
    const { name, description, emailTemplate, isSignature, oldFilename } =
      req.body;
    const file = req.file;

    validateFile(file);
    const user = await validateUser(req.user.id);
    const companyId = user.companyId || null;
    const newFilename = generateNewFilename();

    console.log(newFilename);

    await handleOldFileCleanup(oldFilename);
    const cloudinaryResponse = await uploadToCloudinary(
      file.buffer,
      newFilename
    );

    try {
      const uniqueVariables = processDocxFile(file.buffer);
      const templateData = createTemplateData(
        { name, description, emailTemplate, isSignature },
        cloudinaryResponse,
        companyId
      );

      console.log(templateData);

      return res.status(200).json({
        status: "success",
        message: "Template uploaded successfully",
        extractedVariables: uniqueVariables,
        data: templateData,
        newFilename: newFilename,
      });
    } catch (docxError) {
      handleDocxProcessingError(docxError);
    }
  } catch (error) {
    handleGeneralUploadError(error);
    const statusCode =
      error.message.includes("required") ||
      error.message.includes("template tags")
        ? 400
        : error.message.includes("not found")
        ? 404
        : 500;

    return res.status(statusCode).json({
      status: "error",
      message: error.message,
      error: error.message,
    });
  }
};

const addTemplate = async (req, res) => {
  const {
    name,
    description,
    emailTemplate,
    isSignature,
    fields,
    companyId,
    filename,
  } = req.body;

  try {
    const formattedCompanyId = companyId === "null" ? null : companyId;
    const formattedFields = formatFields(fields);

    console.log(formattedFields);

    const newTemplate = new templateModel({
      name,
      fields: formattedFields,
      filename,
      isSignature,
      description,
      emailTemplate,
      companyId: formattedCompanyId,
    });

    console.log(newTemplate);
    await newTemplate.save();

    return res.status(201).json({
      status: "success",
      message: "Template Saved Successfully",
      data: newTemplate,
    });
  } catch (error) {
    console.error("Error during final save:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error while saving the template",
    });
  }
};

const updateExistingTemplate = async (template, updateData) => {
  const { name, description, emailTemplate, fields, filename, isSignature } =
    updateData;
  const formattedFields = formatFields(fields);

  template.name = name;
  template.fields = formattedFields;
  template.filename = filename;
  template.isSignature = isSignature;
  template.description = description;
  template.emailTemplate = emailTemplate;

  console.log(template);
  await template.save();

  return template;
};

const createNewTemplate = async (templateData) => {
  const { name, filename, description, isSignature, fields } = templateData;
  const formattedFields = formatFields(fields);

  const template = new templateModel({
    name,
    filename,
    description,
    isSignature,
    fields: formattedFields,
  });

  await template.save();
  return template;
};

const updateTemplate = async (req, res) => {
  const {
    id,
    name,
    description,
    emailTemplate,
    fields,
    filename,
    isSignature,
  } = req.body;

  try {
    let template;

    if (id) {
      template = await templateModel.findById(id);
      if (!template) {
        return res.status(404).json({
          status: "error",
          message: "Template not found",
        });
      }

      template = await updateExistingTemplate(template, req.body);
    } else {
      template = await createNewTemplate(req.body);
    }

    return res.status(200).json({
      status: "success",
      message: "Template updated successfully",
      data: {
        id: template._id,
        name,
        fields: template.fields,
        description,
        emailTemplate,
      },
    });
  } catch (error) {
    console.error("Error during template update:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error while updating the template",
    });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    validateTemplateId(id);

    const template = await templateModel.findById(id);
    validateTemplateForDeletion(template);

    await deleteFileFromCloudinary(template.filename);
    await markTemplateAsDeleted(template);

    return res.status(200).json({
      status: "success",
      message: "Template and associated file deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template and file:", error);
    const statusCode = error.message.includes("required")
      ? 400
      : error.message.includes("not found")
      ? 404
      : 500;

    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Server error while deleting template and file",
    });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  uploadTemplate,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  updateTemplateStatus,
  deleteFileFromCloudinary: deleteFileFromCloudinaryController,
  uploadToCloudinary,
};
