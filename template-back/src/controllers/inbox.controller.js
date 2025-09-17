require('dotenv').config();
const { DateTime } = require("luxon");
const moment = require("moment-timezone");
const inboxModel = require('../models/inbox.model');
const userModel = require('../models/user.model');
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const { downloadCloudFile, uploadToCloudinary } = require('../services/cloudinary.service');
const { generateDocx, convertToPDF } = require('../services/docProcessor.service');

const BASE_URL = process.env.BASE_URL;

const storage = multer.diskStorage({
  destination: "uploadfiles/signatures/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const getAllMails = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({ status: 'error', message: 'User id not found.' });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    const companyId = user.companyId;
    const userRole = user.role;

    let query = {};

    if (userRole === 'admin') {
      query = {};
    } else if (userRole === 'company' || userRole === 'employee') {
      query = { companyId: companyId };
    } else {
      return res.status(403).json({ status: 'error', message: 'Unauthorized user role.' });
    }

    const mails = await inboxModel.find(query)
      .populate('documentTemplateId', 'name')
      .populate('emailTemplateId', 'template_name')
      .populate('signingUserId', 'name')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      mails: mails ? mails : [],
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while fetching mails',
      error: error.message,
    });
  }
};

const getMailById = async (req, res) => {
  const mailId = req.params.id;
  try {
    const mail = await inboxModel.findById(mailId).populate('emailTemplateId').populate('signingUserId', 'name');

    if (mail) {
      return res.status(200).json({
        status: 'success',
        inbox: mail,
      });
    }
    return res.status(404).json({
      status: 'error',
      message: 'Mail not found',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while fetching mail by ID',
      error: error.message,
    }); 3
  }
};

const deleteInbox = async (req, res) => {
  try {
    const inboxMessage = await inboxModel.findById(req.params.id);

    if (!inboxMessage) {
      return res.status(404).json({
        status: 'error',
        message: 'Inbox not found',
      });
    }

    inboxMessage.deleted = true;
    inboxMessage.deletedAt = new Date();
    await inboxMessage.save();

    return res.json({
      status: 'success',
      message: 'Inbox deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while deleting inbox',
    });
  }
};

const sendMail = async (req, res) => {
  const { inboxId, attachmentPath, pdfFileName, subject, body, recipientEmail, senderEmail } = req.body;

  if (!attachmentPath || !pdfFileName || !subject || !body || !recipientEmail) {
    return res.status(400).json({
      status: 'error',
      message: "Missing required fields (attachmentPath, pdfFileName, subject, body, recipientEmail)"
    });
  }

  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({ status: 'error', message: 'User id not found.' });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    const inbox = await inboxModel.findById(inboxId);
    if (!inbox) {
      return res.status(404).json({ status: "error", message: "Inbox not found." });
    }

    const signUrl = `${process.env.FRONT_URL}/sign?token=${inbox.oneTimeToken}`;

    let emailBody = body;
    let status = "sent";
    if (inbox.isForSign) {
      inbox.oneTimeToken = crypto.randomBytes(32).toString("hex");
      status = "pending";
      const signUrl = `${process.env.FRONT_URL}/sign?token=${inbox.oneTimeToken}`;
      emailBody += `<br/><br/><strong>Sign the document:</strong> <a href="${signUrl}" target="_blank">${signUrl}</a>`;
    }

    inbox.senderEmail = senderEmail;
    inbox.subject = subject;
    inbox.body = emailBody;
    inbox.recipientEmail = recipientEmail;
    inbox.status = status;
    inbox.companyId = user.companyId;
    await inbox.save();

    console.log('Inbox updated successfully:', inbox);

    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const formattedSubject = subject.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const newFileName = `${formattedSubject}.pdf`;

    const mailOptions = {
      from: senderEmail,
      to: recipientEmail,
      subject: subject,
      html: emailBody,
      attachments: [
        {
          filename: newFileName,
          path: attachmentPath,
        },
      ],
    };

    console.log('Sending email...');
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          status: 'error',
          message: "Error sending email",
          error: error,
        });
      } else {
        console.log("Email sent successfully:", info.response);
        return res.status(200).json({
          status: 'success',
          message: "Email sent successfully",
          response: info.response,
        });
      }
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const scheduleMail = async (req, res) => {
  const { inboxId, attachmentPath, pdfFileName, subject, body, recipientEmail, senderEmail, scheduledTime } = req.body;

  // Validate required fields
  if (!inboxId || !attachmentPath || !pdfFileName || !subject || !body || !recipientEmail || !senderEmail || !scheduledTime) {
    return res.status(400).json({
      status: 'error',
      message: "Missing required fields (inboxId, attachmentPath, pdfFileName, subject, body, recipientEmail, senderEmail, scheduledTime)",
    });
  }

  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({ status: 'error', message: 'User ID not found.' });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    const inbox = await inboxModel.findById(inboxId);
    if (!inbox) {
      return res.status(404).json({ status: 'error', message: 'Inbox not found.' });
    }

    const scheduleDateIST = moment.tz(scheduledTime, "Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

    let emailBody = body;
    let status = "scheduled";
    if (inbox.isForSign) {
      inbox.oneTimeToken = crypto.randomBytes(32).toString("hex");
      const signUrl = `${process.env.FRONT_URL}/sign?token=${inbox.oneTimeToken}`;
      emailBody += `<br/><br/><strong>Sign the document:</strong> <a href="${signUrl}" target="_blank">${signUrl}</a>`;
    }

    inbox.senderEmail = senderEmail;
    inbox.subject = subject;
    inbox.body = emailBody;
    inbox.recipientEmail = recipientEmail;
    inbox.status = status;
    inbox.companyId = user.companyId;
    inbox.scheduledTime = scheduleDateIST;
    await inbox.save();

    console.log(`📅 Scheduled Time (IST): ${scheduleDateIST}`);

    return res.status(200).json({
      status: 'success',
      message: "Email scheduled successfully",
      scheduledTimeIST: scheduleDateIST,
      inbox
    });

  } catch (error) {
    console.error('❗ Error scheduling email:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    // console.log("✅ Current Time (UTC):", now);

    const scheduledMails = await inboxModel.find({ status: "scheduled", scheduledTime: { $lte: now } });
    // console.log("✅ Scheduled Mails Found:", scheduledMails.length);

    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    for (const mail of scheduledMails) {
      try {
        const formattedSubject = mail.subject.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        const newFileName = `${formattedSubject}.pdf`;

        const mailOptions = {
          from: mail.senderEmail,
          to: mail.recipientEmail,
          subject: mail.subject,
          html: mail.body,
          attachments: [{ filename: newFileName, path: mail.documentLink }],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Scheduled email sent successfully:", info.response);

        mail.status = "sent";
        await mail.save();
      } catch (error) {
        console.error("❌ Error sending scheduled email:", error);
      }
    }
  } catch (error) {
    console.error("❌ Error in scheduled mail cron job:", error);
  }
});

const validateToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ status: "error", message: "One Time Token is required." });
  }

  try {
    const inbox = await inboxModel.findOne({ oneTimeToken: token });

    if (!inbox) {
      return res.status(404).json({ status: "error", message: "Invalid or expired token." });
    }

    if (inbox.isSigned) {
      return res.status(403).json({ status: "error", message: "Document already signed. Token expired." });
    }

    return res.status(200).json({
      status: "success",
      message: "Valid token. Proceed with signing.",
      inboxId: inbox._id,
    });

  } catch (error) {
    console.error("❌ Token validation error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const uploadSignature = async (req, res) => {
  try {
    const { inboxId } = req.body;

    if (!req.file || !inboxId) {
      return res.status(400).json({ message: "Missing file or inbox ID" });
    }

    const inbox = await inboxModel.findById(inboxId);
    if (!inbox) {
      return res.status(404).json({ message: "Inbox not found" });
    }

    const uploadedFiles = inbox.uploadedFiles || [];
    const formData = inbox.formData || {};
    const recipientEmail = inbox.recipientEmail;

    const signingUser = await userModel.findOne({ email: recipientEmail });
    if (!signingUser) {
      return res.status(404).json({ message: "Signing user not found for recipient email" });
    }

    inbox.signingUserId = signingUser._id;
    inbox.signatureFile = req.file.path;
    inbox.status = "signed";
    await inbox.save();

    const finalPdfUrl = await renderDocument(inbox);

    res.json({
      message: "Signature uploaded successfully",
      signatureUrl: req.file.path,
      finalPdfUrl,
    });

  } catch (error) {
    console.error("Error uploading signature:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function renderDocument(inbox) {
  try {
    console.log("🔄 Re-rendering document...");

    const { formData, uploadedFiles, signatureFile, documentTemplateId } = inbox;

    // Fetch the original DOCX template from Cloudinary
    const templatePath = await downloadCloudFile(`templates/${documentTemplateId}`, {
      resourceType: 'raw',
      localFolder: 'uploadfiles',
      subFolder: 'templates'
    });
    if (!templatePath) {
      throw new Error("Failed to fetch template from Cloudinary");
    }

    // Include the signature file in the uploadedFiles array
    const updatedFiles = [
      ...uploadedFiles,
      { filename: "signature", fileData: fs.readFileSync(signatureFile) }
    ];

    // Generate updated DOCX
    const updatedDocxPath = await generateDocx(templatePath, formData, updatedFiles, inbox._id);
    if (!updatedDocxPath) {
      throw new Error("Failed to generate updated DOCX");
    }

    // Convert DOCX to PDF
    const updatedPdfPath = await convertToPDF(updatedDocxPath);
    if (!updatedPdfPath) {
      throw new Error("Failed to convert updated DOCX to PDF");
    }

    // Upload the final PDF to Cloudinary
    const fileBuffer = fs.readFileSync(updatedPdfPath);
    const cloudinaryResponse = await uploadToCloudinary(fileBuffer, path.basename(updatedPdfPath), "pdfs", "pdf");
    if (!cloudinaryResponse) {
      throw new Error("Failed to upload final PDF to Cloudinary");
    }

    // Update inbox document link and save changes
    inbox.documentLink = cloudinaryResponse.secure_url;
    await inbox.save();

    console.log("✅ Document re-rendered successfully:", cloudinaryResponse.secure_url);
    return cloudinaryResponse.secure_url;
  } catch (error) {
    console.error("❌ Error rendering document:", error);
    return null;
  }
}

module.exports = {
  getAllMails,
  getMailById,
  sendMail,
  scheduleMail,
  uploadSignature,
  upload,
  validateToken,
  deleteInbox,
};
