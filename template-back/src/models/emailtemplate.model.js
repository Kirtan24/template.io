const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const { models } = require("../constants/index");

const emailTemplateSchema = new mongoose.Schema(
  {
    template_name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.ObjectId,
      ref: models.COMPANY,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

emailTemplateSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: ["find", "findOne", "count", "countDocuments", "aggregate"],
});

module.exports = mongoose.model(models.EMAIL_TEMPLATE, emailTemplateSchema);
