const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const { models } = require('../constants/index');

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: models.COMPANY,
      required: false,
      default: null,
    },
    emailTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: models.EMAIL_TEMPLATE,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSignature: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: null,
    },
    fields: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

templateSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: ['find', 'findOne', 'count', 'countDocuments', 'aggregate'],
});

module.exports = mongoose.model(models.TEMPLATE, templateSchema);
