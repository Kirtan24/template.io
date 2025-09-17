const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const { models } = require('../constants/index');

const inboxSchema = new mongoose.Schema(
  {
    mailId: {
      type: Number,
      required: false,
    },
    senderEmail: {
      type: String,
      required: false,
    },
    recipientEmail: {
      type: String,
      required: false,
    },
    subject: {
      type: String,
      required: false,
    },
    body: {
      type: String,
      required: false,
    },

    emailTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: models.EMAIL_TEMPLATE,
      default: null,
    },
    documentTemplateId: {
      type: String,
      required: false,
      default: null,
    },
    documentLink: {
      type: String,
      default: null,
    },
    sentTimestamp: {
      type: Date,
      default: null,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: models.COMPANY,
      required: false,
      default: null,
    },
    isSigned: {
      type: Boolean,
      default: false,
    },
    isForSign: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['sent', 'pending', 'failed', 'scheduled', 'signed'],
      default: 'pending',
    },
    scheduledTime: {
      type: Date,
      default: null,
    },
    signedTimestamp: {
      type: Date,
      default: null,
    },
    signingUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: models.USER,
      default: null,
    },

    uploadedFiles: [
      {
        filename: String,
        fileData: Buffer,
        contentType: String,
      },
    ],
    signatureFile: {
      filename: String,
      fileData: Buffer,
      contentType: String,
    },
    fields: {
      type: String,
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    oneTimeToken: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

inboxSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: ['find', 'findOne', 'count', 'countDocuments', 'aggregate'],
});

module.exports = mongoose.model(models.INBOX, inboxSchema);
