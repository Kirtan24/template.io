const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cloudinary = require('../config/cloudinary.config');
const { Readable } = require('stream');

async function downloadCloudFile(publicId, options = {}) {
  const {
    resourceType = "raw",
    localFolder = "uploadfiles",
    subFolder = ""
  } = options;

  // Retrieve file details from Cloudinary
  const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });
  const fileExtension = result.format ? `.${result.format}` : "";
  const fileName = result.public_id.split('/').pop() + fileExtension;
  const fullLocalFolder = subFolder ? path.join(localFolder, subFolder) : localFolder;

  if (!fs.existsSync(localFolder)) {
    fs.mkdirSync(localFolder);
  }
  if (subFolder && !fs.existsSync(fullLocalFolder)) {
    fs.mkdirSync(fullLocalFolder, { recursive: true });
  }

  const localFilePath = path.join(fullLocalFolder, fileName);
  await downloadFile(result.url, localFilePath);
  return localFilePath;
}

async function downloadFile(url, dest) {
  const response = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(dest);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function deleteCloudFile(publicId, options = {}) {
  const { resourceType = "raw", folder = "" } = options;
  // Construct the full public ID if folder is specified
  const fullPublicId = folder ? `${folder}/${publicId}` : publicId;
  const result = await cloudinary.uploader.destroy(fullPublicId, { resource_type: resourceType });
  return result;
}

const uploadToCloudinary = (buffer, filename, folder = "templates", format = "docx") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: folder,
        public_id: filename,
        format: format,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

module.exports = {
  downloadCloudFile,
  deleteCloudFile,
  uploadToCloudinary,
};
