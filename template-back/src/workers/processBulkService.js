const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const inboxModel = require("../models/inbox.model");
const templateModel = require("../models/template.model");
const emailTemplateModel = require("../models/emailtemplate.model");
const controller = require("../controllers/template.controller");
const {
  generateDocx,
  convertToPDF,
} = require("../services/docProcessor.service");
const {
  downloadCloudFile,
  deleteCloudFile,
} = require("../services/cloudinary.service");
const { emitToUser } = require("../utils/socketHelpers");

async function processBulkTemplate(payload) {
  const {
    templateId,
    fileName,
    mapping,
    companyId,
    excelFile,
    senderMail,
    user,
  } = payload;
  const userId = user._id;

  const uploadedTempFiles = [];
  const createdInboxes = [];
  const uploadedCloudinaryPublicIds = [];

  const mappingObj = JSON.parse(mapping);

  const buffer = Buffer.from(excelFile.buffer, "base64");
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const result = [];

  try {
    const template = await templateModel.findById(templateId);
    if (!template) throw new Error("Template not found.");

    const emailTemplateId = template.emailTemplate;
    const emailTemplate = await emailTemplateModel.findById(emailTemplateId);
    if (!emailTemplate) throw new Error("Email Template not found.");
    console.log("✅ Email template fetched");

    const downloadedTemplatePath = await downloadCloudFile(
      `templates/${template.filename}`
    );
    if (!downloadedTemplatePath) throw new Error("Template download failed.");

    uploadedTempFiles.push(downloadedTemplatePath);

    for (let [index, row] of excelData.entries()) {
      try {
        const formData = {};
        const fields = [];
        let recipientEmail = row["Email"];

        for (const [fieldName, excelColumn] of Object.entries(mappingObj)) {
          formData[fieldName] = row[excelColumn] || "";
          fields.push({ name: fieldName, inputType: "text" });
        }

        const oneTimeToken = crypto.randomBytes(32).toString("hex");

        const newInbox = await inboxModel.create({
          documentTemplateId: path.basename(downloadedTemplatePath),
          emailTemplateId,
          sentTimestamp: new Date(),
          companyId: companyId || null,
          isSigned: false,
          isForSign: template.isSignature,
          uploadedFiles: [],
          formData,
          fields: JSON.stringify(fields),
          oneTimeToken,
        });

        createdInboxes.push(newInbox._id);

        const generatedDocxPath = await generateDocx(
          downloadedTemplatePath,
          formData,
          fields,
          newInbox._id
        );
        uploadedTempFiles.push(generatedDocxPath);
        if (!generatedDocxPath) throw new Error("DOCX generation failed");
        console.log("✅ DOCX Created:", generatedDocxPath);

        const pdfFilePath = await convertToPDF(generatedDocxPath);
        uploadedTempFiles.push(pdfFilePath);
        if (!fs.existsSync(pdfFilePath))
          throw new Error("PDF generation failed");
        console.log("✅ PDF Created:", pdfFilePath);

        const fileBuffer = fs.readFileSync(pdfFilePath);
        const renameFile = path.basename(pdfFilePath);
        const cloudinaryResponse = await controller.uploadToCloudinary(
          fileBuffer,
          renameFile,
          "pdfs",
          "pdf"
        );

        if (!cloudinaryResponse) throw new Error("Cloudinary upload failed");
        uploadedCloudinaryPublicIds.push(cloudinaryResponse.public_id);
        newInbox.documentLink = cloudinaryResponse.secure_url;
        console.log("✅ PDF Uploaded to Cloudinary");

        console.log("✅ Makeing the mail to send.");

        const subject = emailTemplate.subject.replace(
          "{{templateTitle}}",
          template.title || "Document"
        );
        let emailBody =
          emailTemplate.body ||
          "Hello,<br/>Please find your document attached.";

        const signUrl = `${process.env.FRONT_URL}/sign?token=${oneTimeToken}`;
        if (template.isSignature) {
          emailBody += `<br/><br/><strong>Sign the document:</strong> <a href="${signUrl}" target="_blank">${signUrl}</a>`;
          newInbox.status = "pending";
        } else {
          newInbox.status = "sent";
        }

        newInbox.subject = subject;
        newInbox.body = emailBody;
        newInbox.recipientEmail = recipientEmail;
        await newInbox.save();
        console.log("✅ New Inbox Saved");

        const formattedSubject = subject
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 50);
        const newFileName = `${formattedSubject}.pdf`;

        const mailOptions = {
          from: senderMail,
          to: recipientEmail,
          subject,
          html: emailBody,
          attachments: [
            {
              filename: newFileName,
              path: pdfFilePath,
            },
          ],
        };

        console.log("Sending mail with...", mailOptions);
        const transporter = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
          },
        });

        await transporter.sendMail(mailOptions);
        console.log("✅ Mail send successfully...");

        result.push({
          inboxId: newInbox._id,
          cloudinaryUrl: cloudinaryResponse.secure_url,
          oneTimeToken,
          email: recipientEmail || "N/A",
        });
      } catch (rowError) {
        console.error(
          `❌ Error processing row ${index + 1}:`,
          rowError.message
        );
        throw rowError;
      }
    }

    console.log("✅ Excel Data Done.");

    emitToUser(userId, "bulk-processing", {
      status: "success",
      message: `Bulk Job completed and Email Send Suucessfully.`,
      result,
    });

    return {
      message: `${result.length} PDF(s) processed and uploaded successfully.`,
      result,
    };
  } catch (error) {
    console.error("❌ Error in bulk processing:", error.message);

    for (const inboxId of createdInboxes) {
      try {
        await inboxModel.findByIdAndDelete(inboxId);
      } catch (err) {
        console.error("❗ Error deleting inbox:", inboxId, err);
      }
    }

    for (const publicId of uploadedCloudinaryPublicIds) {
      try {
        console.log(publicId);
        await deleteCloudFile(publicId, {
          resourceType: "raw",
          folder: "pdfs",
        });
      } catch (err) {
        console.error("❗ Error deleting Cloudinary file:", publicId, err);
      }
    }

    emitToUser(userId, "bulk-processing", {
      status: "failure",
      message:
        "Some rows failed to process. All created resources have been rolled back.",
    });

    throw new Error(
      "Some rows failed to process. All created resources have been rolled back."
    );
  } finally {
    for (const file of uploadedTempFiles) {
      if (file && fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log("🗑️ Deleted temp file:", file);
        } catch (err) {
          console.error("❗ Error deleting file:", file, err);
        }
      }
    }
  }
}

module.exports = {
  processBulkTemplate,
};
