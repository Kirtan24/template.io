require('dotenv').config();
const XLSX = require("xlsx");
const fs = require('fs');
const crypto = require("crypto");
const path = require('path');
const inboxModel = require('../models/inbox.model');
const userModel = require('../models/user.model');
const jobModel = require('../models/job.model');
const templateModel = require('../models/template.model');
const { generateDocx, convertToPDF } = require("../services/docProcessor.service");
const { downloadCloudFile, deleteCloudFile, uploadToCloudinary } = require('../services/cloudinary.service');

const uploadSignature = async (req, res) => {
  let downloadedFilePath = null;
  let generatedDocxPath = null;
  let pdfFilePath = null;

  try {
    console.log("📌 Received Request:", { body: req.body, file: req.file });

    const { inboxId } = req.body;
    if (!req.file || !inboxId) {
      return res.status(400).json({ status: "error", message: "Missing file or inbox ID" });
    }

    // 🔍 Fetch Inbox Data
    console.log("🔍 Fetching inbox data...");
    const inbox = await inboxModel.findById(inboxId);
    if (!inbox) return res.status(404).json({ status: "error", message: "Inbox not found" });

    const { formData, uploadedFiles, documentTemplateId, documentLink } = inbox;

    // 📥 Download Template
    console.log("📥 Downloading template from Cloudinary...");
    downloadedFilePath = await downloadCloudFile(`templates/${documentTemplateId}`, {
      resourceType: 'raw',
      localFolder: 'uploadfiles',
      subFolder: 'templates'
    });
    if (!downloadedFilePath) {
      return res.status(500).json({ status: "error", message: "Failed to fetch template file" });
    }

    // ✍️ Process Signature Field
    const fields = JSON.parse(inbox.fields || "[]");
    const signatureField = fields.find(field => field.isSignature === true);
    if (!signatureField) {
      return res.status(400).json({ status: "error", message: "Signature field not found" });
    }

    formData[signatureField.name] = [signatureField.name];
    const signfileBuffer = fs.readFileSync(req.file.path);
    const existingFileIndex = uploadedFiles.findIndex(file => file.filename === signatureField.name);

    if (existingFileIndex !== -1) {
      uploadedFiles[existingFileIndex].fileData = signfileBuffer;
      uploadedFiles[existingFileIndex].contentType = req.file.mimetype;
    } else {
      uploadedFiles.push({
        filename: signatureField.name,
        fileData: signfileBuffer,
        contentType: req.file.mimetype,
      });
    }

    inbox.uploadedFiles = uploadedFiles;
    inbox.isSigned = false;
    await inbox.save();

    // 📄 Generate DOCX
    console.log("📄 Generating new DOCX...");
    generatedDocxPath = await generateDocx(downloadedFilePath, formData, fields, inboxId);
    if (!generatedDocxPath) {
      return res.status(500).json({ status: "error", message: "Failed to generate DOCX" });
    }

    // 🔄 Convert DOCX to PDF
    console.log("🔄 Converting DOCX to PDF...");
    pdfFilePath = await convertToPDF(generatedDocxPath);
    if (!pdfFilePath) {
      return res.status(500).json({ status: "error", message: "Failed to convert DOCX to PDF" });
    }

    // 🗑️ Delete Old PDF from Cloudinary (if exists)
    if (documentLink) {
      const publicId = documentLink.split("/").pop().split(".")[0];
      console.log(`🗑️ Deleting old PDF from Cloudinary: ${publicId}`);

      const deleteResult = await deleteCloudFile(publicId, { resourceType: "raw", folder: "pdfs" });
      if (deleteResult.result !== "ok") {
        console.warn("⚠️ Failed to delete old PDF from Cloudinary.");
      }
    }

    // 📤 Upload New PDF to Cloudinary
    console.log("📤 Uploading PDF to Cloudinary...");
    const fileBuffer = fs.readFileSync(pdfFilePath);
    const renameFile = path.basename(pdfFilePath);
    const cloudinaryResponse = await uploadToCloudinary(fileBuffer, renameFile, "pdfs", "pdf");

    if (!cloudinaryResponse) {
      return res.status(500).json({ status: "error", message: "Failed to upload final PDF" });
    }

    // 📝 Update Inbox
    inbox.documentLink = cloudinaryResponse.secure_url;
    inbox.status = "signed";
    inbox.isSigned = true;
    await inbox.save();

    console.log("✅ Process Completed Successfully");
    console.log("Uploaded PDF to Cloudinary:", cloudinaryResponse.secure_url);

    return res.status(200).json({
      status: "success",
      message: "Signature uploaded.",
      pdfPath: path.basename(pdfFilePath),
      documentLink: cloudinaryResponse.secure_url,
      inboxId: inbox._id,
    });

  } catch (error) {
    console.error("❌ Error uploading signature:", error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  } finally {
    // 🗑️ Cleanup Temporary Files
    [downloadedFilePath, generatedDocxPath, pdfFilePath, req.file?.path].forEach(filePath => {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️ File deleted: ${filePath}`);
        } catch (err) {
          console.error(`❗ Failed to delete file: ${filePath}`, err);
        }
      }
    });
  }
};

const processTemplate = async (req, res) => {
  let downloadedFilePath = null;
  let generatedDocxPath = null;
  let pdfFilePath = null;
  let data = {};

  try {
    const { fileName: fetched_filename, templateId, companyId, fileMapping } = req.body;
    const fields = JSON.parse(req.body.fields || "[]");
    const fileMappingObj = JSON.parse(fileMapping || "{}");

    if (!fields.length) {
      return res.status(400).json({ status: "error", message: "Fields array is required." });
    }

    const template = await templateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({ status: "error", message: "Template not found" });
    }
    const emailTemplateId = template.emailTemplate;

    data = fields.reduce((acc, field) => {
      acc[field.name] = field.inputType === "file" ? [] : req.body[field.name] || "";
      return acc;
    }, {});

    console.log("📌 Received file mapping:", fileMappingObj);
    console.log("📌 Received files:", req.files);

    let uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const fieldName = Object.keys(fileMappingObj).find(key => fileMappingObj[key] == index);
        if (fieldName) {
          uploadedFiles.push({
            filename: fieldName,
            fileData: file.buffer,
            contentType: file.mimetype,
          });
          if (!data[fieldName]) {
            data[fieldName] = [];
          }
          data[fieldName].push(fieldName);
        }
      });
    }

    downloadedFilePath = await downloadCloudFile(`templates/${fetched_filename}`, {
      resourceType: 'raw',
      localFolder: 'uploadfiles',
      subFolder: 'templates'
    });
    if (downloadedFilePath) {
      console.log("✅ File Downloaded:", downloadedFilePath);

      try {
        const oneTimeToken = crypto.randomBytes(32).toString("hex");
        const newInbox = await inboxModel.create({
          documentTemplateId: path.basename(downloadedFilePath),
          emailTemplateId,
          sentTimestamp: new Date(),
          companyId: companyId || null,
          isSigned: false,
          isForSign: template.isSignature,
          uploadedFiles,
          formData: data,
          fields: JSON.stringify(fields),
          oneTimeToken,
        });

        console.log("Enter generateDocx")
        generatedDocxPath = await generateDocx(downloadedFilePath, data, fields, newInbox._id);
        console.log("Exit generateDocx")

        if (generatedDocxPath) {
          console.log("✅ DOCX Created:", generatedDocxPath);

          pdfFilePath = await convertToPDF(generatedDocxPath);
          if (fs.existsSync(pdfFilePath)) {
            console.log("✅ PDF Created:", pdfFilePath);

            const fileBuffer = fs.readFileSync(pdfFilePath);
            const renameFile = path.basename(pdfFilePath);
            const cloudinaryResponse = await uploadToCloudinary(fileBuffer, renameFile, "pdfs", "pdf");

            if (cloudinaryResponse) {
              console.log("✅ Uploaded to Cloudinary:", cloudinaryResponse.secure_url);

              newInbox.documentLink = cloudinaryResponse.secure_url;
              await newInbox.save();

              return res.status(200).json({
                status: "success",
                message: "PDF generated, uploaded, and inbox created!",
                pdfPath: path.basename(pdfFilePath),
                cloudinaryUrl: cloudinaryResponse.secure_url,
                inboxId: newInbox._id,
                oneTimeToken,
              });
            } else {
              return res.status(500).json({
                status: "error",
                message: "Failed to upload PDF to Cloudinary."
              });
            }
          } else {
            return res.status(500).json({
              status: "error",
              message: "PDF generation failed."
            });
          }
        } else {
          return res.status(500).json({
            status: "error",
            message: "Failed to generate the DOCX file."
          });
        }
      } catch (error) {
        console.error("Error during template processing:", error);
        return res.status(500).json({
          status: "error",
          message: "An error occurred during template processing."
        });
      }
    } else {
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch the template file."
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  } finally {
    [downloadedFilePath, generatedDocxPath, pdfFilePath].forEach((filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️  File deleted: ${filePath}`);
        } catch (err) {
          console.error(`❗ Failed to delete file: ${filePath}`, err);
        }
      }
    });
  }
};

const createJob = async (req, res) => {
  try {
    const { templateId, fileName, mapping, companyId } = req.body;
    const excelFile = req.files?.[0];

    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({ status: 'error', message: 'User ID not found.' });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    if (!excelFile) {
      return res.status(400).json({ status: "error", message: "Excel/CSV file is required." });
    }

    const job = await jobModel.create({
      type: "bulk_template_process",
      payload: {
        user,
        senderMail: user.email,
        templateId,
        fileName,
        mapping,
        companyId,
        excelFile: {
          buffer: excelFile.buffer.toString("base64"),
          originalname: excelFile.originalname,
          mimetype: excelFile.mimetype,
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Job has been queued successfully.",
      jobId: job._id,
    });
  } catch (error) {
    console.error("❌ Error queuing job:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  generateDocx,
  convertToPDF,
  processTemplate,
  uploadSignature,
  createJob
};
