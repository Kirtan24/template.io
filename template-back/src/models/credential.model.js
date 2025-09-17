const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const { models } = require('../constants/index');

const credentialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    port: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    deleted: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

credentialSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: ['find', 'findOne', 'count', 'countDocuments', 'aggregate'],
});

module.exports = mongoose.model(models.CREDENTIALS, credentialSchema);
