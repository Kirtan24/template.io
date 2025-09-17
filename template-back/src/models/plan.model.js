const mongoose = require('mongoose');
const { models } = require('../constants');

const featureSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  included: {
    type: Boolean,
    required: true,
  },
});

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: [featureSchema],
  buttonText: {
    type: String,
    required: true,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: models.PERMISSION,
    required: true,
  }],
});

const Plan = mongoose.model(models.PLAN, planSchema);

module.exports = Plan;
