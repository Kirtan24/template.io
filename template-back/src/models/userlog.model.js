const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const { models } = require('../constants/index');

const userLogSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: models.USER, 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    token: { 
      type: String, 
      required: true 
    },
    loginTime: { 
      type: Date, 
      default: Date.now 
    },
    logoutTime: { 
      type: Date, 
      default: null 
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

userLogSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: ['find', 'findOne', 'count', 'countDocuments', 'aggregate'],
});

module.exports = mongoose.model(models.USER_LOG, userLogSchema);
