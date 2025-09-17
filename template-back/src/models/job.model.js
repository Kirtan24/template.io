const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'bulk_template_process'
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  payload: { type: mongoose.Schema.Types.Mixed }, // the req.body and file info
  result: { type: mongoose.Schema.Types.Mixed },
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);
