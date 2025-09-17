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

const getAllTemplates = async (req, res) => {
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

    let query = { deleted: { $ne: true } };

    if (userRole === "admin") {
      query = { companyId: null };
      query = { deleted: { $ne: true } };
    } else if (userRole === "company" || userRole === "employee") {
      query = {
        $or: [{ companyId: null }, { companyId: companyId }],
        isActive: true,
        deleted: { $ne: true },
      };
    } else {
      return res
        .status(403)
        .json({ status: "error", message: "Unauthorized user role." });
    }

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
    return res.status(500).json({
      status: "error",
      message: "Server Error while fetching templates",
    });
  }
};

const getTemplateById = async (req, res) => {
  const templateId = req.params.id;
  if (!templateId) {
    return res
      .status(400)
      .json({ status: "error", message: "template id is required" });
  }
  try {
    const template = await templateModel
      .findById(templateId)
      .populate("emailTemplate")
      .populate("companyId")
      .select("-__v");

    if (!template) {
      return res
        .status(404)
        .json({ status: "error", message: "Template not found" });
    }

    if (!template.isActive) {
      return res.status(203).json({
        status: "error",
        message: "Template is inactive",
      });
    }

    return res.json(template);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Server Error while fetching template by ID",
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
      return res
        .status(404)
        .json({ status: "error", message: "Template not found" });
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

const deleteFileFromCloudinary = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        status: "error",
        message: "Filename is required",
      });
    }

    const deleteResult = await deleteCloudFile(filename, {
      resourceType: "raw",
      folder: "templates",
    });

    if (deleteResult.result === "ok") {
      return res.status(200).json({
        status: "success",
        message: "Process Canceled!",
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Failed to delete file from Cloudinary",
      });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({
      status: "error",
      message: "Error deleting file from Cloudinary",
    });
  }
};

const uploadTemplate = async (req, res) => {
  try {
    const { name, description, emailTemplate, isSignature, oldFilename } =
      req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const companyId = user.companyId || null;
    const newFilename = `template_${Date.now()}.docx`;
    console.log(newFilename);

    // Handle deleting old file if it exists using the Cloudinary service.
    if (oldFilename) {
      try {
        const deleteResult = await deleteCloudFile(oldFilename, {
          resourceType: "raw",
          folder: "templates",
        });
        if (deleteResult.result !== "ok") {
          return res.status(500).json({
            status: "error",
            message: "Failed to delete old file from Cloudinary",
          });
        }
      } catch (deleteError) {
        console.error("Error deleting old file:", deleteError);
        return res.status(500).json({
          status: "error",
          message: "Error deleting old file from Cloudinary",
        });
      }
    }

    // Upload new file to Cloudinary using service function.
    const cloudinaryResponse = await uploadToCloudinary(
      file.buffer,
      newFilename
    );
    const filename = cloudinaryResponse.public_id.replace("templates/", "");

    try {
      const zip = new PizZip(file.buffer);
      const doc = new Docxtemplater(zip);
      doc.compile();
      const text = doc.getFullText();
      const variableSet = new Set();
      const regex = /{(.*?)}/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        variableSet.add(match[1]);
      }
      const uniqueVariables = Array.from(variableSet);

      const templateData = {
        name,
        filename,
        companyId,
        description,
        emailTemplate,
        isSignature: isSignature === "true",
        fileUrl: cloudinaryResponse.secure_url,
      };

      console.log(templateData);

      return res.status(200).json({
        status: "success",
        message: "Template uploaded successfully",
        extractedVariables: uniqueVariables,
        data: templateData,
        newFilename: newFilename,
      });
    } catch (error) {
      console.error("Error during DOCX processing:", error);
      if (error.id === "multi_error") {
        const errorMessages = error.properties.errors
          .map((err) => err.message)
          .join(", ");
        return res.status(400).json({
          status: "error",
          message: `The uploaded document has multiple issues with template tags: ${errorMessages}. Please upload a valid document.`,
        });
      }
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  } catch (error) {
    console.error("General error:", error.message);
    if (error.message.includes("Duplicate open tag")) {
      return res.status(400).json({
        status: "error",
        message:
          "The uploaded document contains an issue with template tags. Please upload a valid document.",
      });
    }
    return res
      .status(500)
      .json({ message: error.message, error: error.message });
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

    const formattedFields = fields.map((field) => ({
      name: field.name,
      placeholder: field.placeholder,
      inputType: field.inputType,
      isSignature:
        field.inputType === "file" ? field.isSignature || false : undefined,
    }));

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

      // Format fields properly
      const formattedFields = fields.map((field) => ({
        name: field.name,
        placeholder: field.placeholder,
        inputType: field.inputType,
        isSignature:
          field.inputType === "file" ? field.isSignature || false : undefined,
      }));

      // Update template fields
      template.name = name;
      template.fields = formattedFields;
      template.filename = filename;
      template.isSignature = isSignature;
      template.description = description;
      template.emailTemplate = emailTemplate;
      console.log(template);
      await template.save();
    } else {
      // Format fields for a new template
      const formattedFields = fields.map((field) => ({
        name: field.name,
        placeholder: field.placeholder,
        inputType: field.inputType,
        isSignature:
          field.inputType === "file" ? field.isSignature || false : undefined,
      }));

      template = new templateModel({
        name,
        filename,
        description,
        isSignature,
        fields: formattedFields,
      });

      await template.save();
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
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "Template ID is required" });
    }

    const template = await templateModel.findById(id);

    if (!template) {
      return res.status(404).json({
        status: "error",
        message: "Template not found",
      });
    } else if (!template.filename) {
      return res.status(400).json({
        status: "error",
        message: "No file associated with this template",
      });
    }

    const filename = template.filename;
    const deleteResult = await deleteCloudFile(filename, {
      resourceType: "raw",
      folder: "templates",
    });

    if (deleteResult.result !== "ok") {
      return res.status(500).json({
        status: "error",
        message: "Failed to delete file from Cloudinary",
      });
    }

    template.deleted = true;
    template.deletedAt = new Date();
    await template.save();

    return res.status(200).json({
      status: "success",
      message: "Template and associated file deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template and file:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while deleting template and file",
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
  deleteFileFromCloudinary,
  uploadToCloudinary,
};
