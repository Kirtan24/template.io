const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const { models } = require("../constants/index");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    activeDashboard: {
      type: Number,
      default: 0,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: models.PLAN,
      required: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: models.PERMISSION,
      },
    ],
    companyStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
    },
    lastUpdated: {
      type: Date,
    },
    lastLoggedInUser: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: models.USER,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

companySchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: ["find", "findOne", "count", "countDocuments", "aggregate"],
});

companySchema.virtual("isActive").get(function () {
  return this.companyStatus === "active";
});

companySchema.virtual("isSuspended").get(function () {
  return this.companyStatus === "suspended";
});

module.exports = mongoose.model(models.COMPANY, companySchema);
