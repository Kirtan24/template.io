const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const { models } = require('../constants/index');

const userSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['admin', 'company', 'employee'],
      required: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: models.PERMISSION,
      },
    ],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: models.COMPANY,
      required: function () {
        return this.role === 'employee' || this.role === 'company';
      },
    },
    lastLogin: {
      type: Date,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

userSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

userSchema.virtual('isCompany').get(function () {
  return this.role === 'company';
});

userSchema.virtual('isEmployee').get(function () {
  return this.role === 'employee';
});

userSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: ['find', 'findOne', 'count', 'countDocuments', 'aggregate'],
});

module.exports = mongoose.model(models.USER, userSchema);
