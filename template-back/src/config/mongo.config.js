require('dotenv').config();
var mongoose = require('mongoose');

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Database connected successfully");

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    db.once('open', function () {
      console.log(`Connected to ${process.env.DB_URL}`);
    });

  } catch (err) {
    console.log("Database connection error:", err);
  }
};

module.exports = { connectToDb };
