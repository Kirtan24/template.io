const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const { models } = require('../constants/index');

const auditLogSchema = new mongoose.Schema(
  {
    action_type: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    model_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: models.USER,
      default: null,
    },
    changes: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

auditLogSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: ['find', 'findOne', 'count', 'countDocuments', 'aggregate'],
});

module.exports = mongoose.model(models.AUDIT_LOG, auditLogSchema);
