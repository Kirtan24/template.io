const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module-free");
const ILovePDFApi = require("@ilovepdf/ilovepdf-nodejs");
const ILovePDFFile = require("@ilovepdf/ilovepdf-nodejs/ILovePDFFile");
const inboxModel = require('../models/inbox.model');

const publicKey = process.env.ILOVEAPI_PUBLIC_KEY;
const secretKey = process.env.ILOVEAPI_SECRET_KEY;

function loadImage(filepath) {
  const base64String = fs.readFileSync(filepath, "base64");
  return base64String;
}

async function generateDocx(templatePath, data, fields, inboxId) {
  try {
    if (!templatePath) {
      console.log("❌ Error: Template path is undefined.");
      return null;
    }

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);

    const imageOptions = {
      centered: false,
      getImage: (tagValue) => {
        return Buffer.from(tagValue, "base64");
      },
      getSize: () => [150, 50],
    };

    const doc = new Docxtemplater(zip, {
      modules: [new ImageModule(imageOptions)],
    });

    const renderData = {};

    const inboxEntry = await inboxModel.findById(inboxId);
    if (!inboxEntry) {
      console.log("❌ Error: Inbox entry not found.");
      return null;
    }

    fields.forEach((field) => {
      if (field.inputType === "file" || field.isSignature === false) {
        const fieldName = field.name.replace(/%/g, "");
        const storedFile = inboxEntry.uploadedFiles.find((file) => file.filename === field.name);

        console.log("field.name", field.name)
        console.log("storedFile", storedFile)

        if (storedFile) {
          renderData[fieldName] = storedFile.fileData.toString("base64");
        } else {
          console.warn(`⚠️ No stored file found for field: ${field.name}`);
        }
      } else {
        if (field.name && data[field.name]) {
          renderData[field.name] = data[field.name];
        }
      }
    });

    doc.render(renderData);

    const docxPath = `uploadfiles/templates/${Date.now()}.docx`;
    fs.writeFileSync(docxPath, doc.getZip().generate({ type: "nodebuffer" }));

    return docxPath;
  } catch (error) {
    console.error("❌ Error generating document:", error);
    return null;
  }
}

async function convertToPDF(docxPath) {
  try {
    if (!docxPath) {
      console.log("Error: DOCX path is undefined.");
      return;
    }

    const instance = new ILovePDFApi(publicKey, secretKey);
    const task = instance.newTask("officepdf");

    await task.start();
    const file = new ILovePDFFile(docxPath);
    await task.addFile(file);

    await task.process();
    const outputBuffer = await task.download();

    const timestamp = Date.now();
    const pdfPath = `uploadfiles/pdf/pdf_${path.basename(docxPath, ".docx")}_${timestamp}.pdf`;

    fs.writeFileSync(pdfPath, outputBuffer);

    return pdfPath;
  } catch (error) {
    console.error("Error converting to PDF:", error);
  }
}

module.exports = {
  generateDocx,
  convertToPDF,
};
