const fs = require("fs");
const os = require("os");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const path = require("path");
const companyModel = require("../models/company.model");
const emailtemplateModel = require("../models/emailtemplate.model");
const permissionModel = require("../models/permission.model");
const templateModel = require("../models/template.model");
const userModel = require("../models/user.model");
const inboxModel = require("../models/inbox.model");
const planModel = require("../models/plan.model");

const modelMap = {
  companies: companyModel,
  emailTemplates: emailtemplateModel,
  permissions: permissionModel,
  templates: templateModel,
  users: userModel,
  inboxes: inboxModel,
  plans: planModel,
};

const backupDatabase = async (req, res) => {
  try {
    console.log("Starting database backup...");

    let rootFolder = false;
    let { models, fileName } = req.body;

    const mongooseModels = mongoose.connection.models;
    if (!models || models.length === 0) {
      models = Object.keys(mongooseModels);
      console.log("⚠️ No models selected. Backing up all models:", models);
    }

    const backupFileName = fileName
      ? `${fileName}.json`
      : `backup_${Date.now()}.json`;
    let backupFilePath;

    if (rootFolder) {
      backupFilePath = path.join(__dirname, "..", "..", backupFileName);
    } else {
      const backupFolder = path.join(__dirname, "..", "..", "waste", "backup");

      if (!fs.existsSync(backupFolder)) {
        fs.mkdirSync(backupFolder, { recursive: true });
        console.log("✅ Backup folder created.");
      }
      backupFilePath = path.join(backupFolder, backupFileName);
    }

    const backupData = {};

    for (const modelKey of models) {
      const model = modelMap[modelKey];

      if (!model) {
        console.warn(`⚠️ No model found for key: ${modelKey}`);
        continue;
      }

      const count = await model.countDocuments();
      console.log(`${modelKey}: ${count} records found.`);

      backupData[modelKey] = count > 0 ? await model.find().lean() : [];
    }

    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    console.log("✅ Database backup completed.");

    res.status(200).json({
      status: "success",
      message: "Database backup completed.",
      backupFilePath,
    });
  } catch (error) {
    console.error("❗ Error during backup:", error);
    res
      .status(500)
      .json({ status: "error", message: "Database backup failed." });
  }
};

const restoreDatabase = async (req, res) => {
  try {
    console.log("Starting database restore...");
    const backupFilePath = "./front-backup.json";

    if (!fs.existsSync(backupFilePath)) {
      return res.status(404).json({
        status: "error",
        message: "Backup file not found.",
      });
    }

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, "utf8"));

    for (const [collectionName, records] of Object.entries(backupData)) {
      const model = modelMap[collectionName];

      if (!model) {
        console.warn(`⚠️ Model not found for collection: ${collectionName}`);
        continue;
      }

      console.log(`\nDeleting existing data from ${collectionName}...`);
      await model.deleteMany({});
      console.log(`✅ Collection cleared.`);

      if (records.length > 0) {
        console.log(`Restoring ${records.length} records...`);
        await model.insertMany(records);
        console.log(`✅ Successfully restored ${records.length} records.`);
      } else {
        console.log(`⚠️ No records to restore for ${collectionName}.`);
      }
    }

    res.status(200).json({
      status: "success",
      message: "Database restored successfully.",
    });
  } catch (error) {
    console.error("❗ Error during restore:", error);
    res.status(500).json({
      status: "error",
      message: "Database restore failed.",
    });
  }
};

const getModels = async (req, res) => {
  try {
    const models = Object.keys(modelMap);
    res.json({ status: "success", models });
  } catch (error) {
    console.error("Error fetching models:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch models" });
  }
};

const sleep = async (req, res) => {
  try {
    const { time } = req.params;
    const sleepTime = parseInt(time, 10);

    if (isNaN(sleepTime) || sleepTime <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid sleep time. Provide a positive number.",
      });
    }

    console.log(`Sleeping for ${sleepTime} milliseconds...`);
    await new Promise((resolve) => setTimeout(resolve, sleepTime));
    console.log("✅ Wake up!");

    res.status(200).json({
      status: "success",
      message: `Slept for ${sleepTime} milliseconds.`,
    });
  } catch (error) {
    console.error("❗ Error in sleep function:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the sleep request.",
    });
  }
};

const serverInfo = async (req, res) => {
  try {
    const cpuInfo = os.cpus();
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.status(200).json({
      status: "success",
      cpuInfo,
      memoryUsage,
      uptime,
    });
  } catch (error) {
    console.error("❗ Error fetching server info:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching server info.",
    });
  }
};

const generateUUID = (req, res) => {
  const uuid = crypto.randomUUID();
  res.status(200).json({
    status: "success",
    uuid,
  });
};

const hashData = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        status: "error",
        message: "Data is required to generate a hash.",
      });
    }

    const hash = await bcrypt.hash(data, 10);
    res.status(200).json({
      status: "success",
      hash,
    });
  } catch (error) {
    console.error("❗ Error hashing data:", error);
    res.status(500).json({
      status: "error",
      message: "Error hashing data.",
    });
  }
};

const generateRandomNumber = (req, res) => {
  const { min, max } = req.query;
  const minNum = parseInt(min, 10) || 0;
  const maxNum = parseInt(max, 10) || 100;

  if (minNum >= maxNum) {
    return res.status(400).json({
      status: "error",
      message: "Invalid range. Ensure min < max.",
    });
  }

  const randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
  res.status(200).json({
    status: "success",
    randomNumber: randomNum,
  });
};

const clearLogs = async (req, res) => {
  try {
    const logFilePath = path.resolve("./logs/app.log");
    if (fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, "");
      console.log("✅ Logs cleared.");
      res.status(200).json({
        status: "success",
        message: "Logs cleared.",
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Log file not found.",
      });
    }
  } catch (error) {
    console.error("❗ Error clearing logs:", error);
    res.status(500).json({
      status: "error",
      message: "Error clearing logs.",
    });
  }
};

module.exports = {
  getModels,
  backupDatabase,
  restoreDatabase,
  sleep,
  serverInfo,
  generateUUID,
  hashData,
  generateRandomNumber,
  clearLogs,
};
