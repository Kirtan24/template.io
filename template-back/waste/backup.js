const mongoose = require('mongoose');
const fs = require('fs');
const { models } = require('../src/constants/index');

// Import your Mongoose models
const EmailTemplate = require('../src/models/emailtemplate.model');
const Company = require('../src/models/company.model');
const Permission = require('../src/models/permission.model');
const Template = require('../src/models/template.model');
const User = require('../src/models/user.model');
const Inbox = require('../src/models/inbox.model');  // New Inbox model import
const Plan = require('../src/models/plan.model');  // New Inbox model import

// MongoDB connection string
// const mongoURI = 'mongodb://localhost:27017/template';
const mongoURI = '';

// Models map
const modelMap = {
  companies: Company,
  // emailTemplates: EmailTemplate,
  // permissions: Permission,
  // templates: Template,
  // users: User,
  // inboxes: Inbox,
  // plans: Plan,
};

// ✅ Perform Backup
async function backupData() {
  try {
    // Connect to the database
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('Connected to the database.\n');

    // Fetch all data including soft-deleted records
    const collections = Object.keys(modelMap);
    const backupData = {};

    for (const collection of collections) {
      const model = modelMap[collection];
      if (!model) continue;

      const records = await model
        .find({ $or: [{ deleted: true }, { deleted: false }, { deleted: { $exists: false } }] })
        .lean();

      console.log(`${collection}: ${records.length} records (including deleted)`);

      backupData[collection] = records;
    }

    // Save data to a backup file
    const backupFilePath = './backup.json';
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    console.log('\n✅ Backup successful! Data saved to backup.json');
  } catch (error) {
    console.error('❗ Error during backup:', error);
  } finally {
    mongoose.connection.close();
  }
}

// ✅ Perform Restore with Truncate
async function insertBackupData() {
  try {
    // Connect to the database
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });

    const backupData = require('./backup/front-backup-16-april.json');

    for (const [collectionName, records] of Object.entries(backupData)) {
      const model = modelMap[collectionName];
      if (!model) {
        console.error(`❗ Model not found for collection: ${collectionName}`);
        continue;
      }

      console.log(`\n⚠️ Truncating collection: ${collectionName}...`);
      await model.deleteMany({});
      console.log(`✅ Collection truncated: ${collectionName}`);

      console.log(`Restoring ${records.length} records to ${collectionName}...`);

      if (records.length > 0) {
        await model.insertMany(records);
        console.log(`✅ Successfully restored ${records.length} records to ${collectionName}`);
      } else {
        console.log(`⚠️ No records to restore for ${collectionName}`);
      }
    }

    console.log('\n✅ Restore process completed!');
  } catch (error) {
    console.error('❗ Error during restore:', error);
  } finally {
    mongoose.connection.close();
  }
}

// ✅ Choose Action (Backup or Restore)
const action = process.argv[2];

if (action === 'b') {
  backupData();
} else if (action === 'r') {
  insertBackupData();
} else {
  console.log('Usage: node backupRestore.js [b for backup|r for restore]');
}
