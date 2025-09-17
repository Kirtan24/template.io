const multer = require('multer');

const storage = multer.memoryStorage();
const singleUpload = multer({ storage }).single('file');
const anyUpload = multer({ storage }).any();

module.exports = {
  singleUpload,
  anyUpload,
};
