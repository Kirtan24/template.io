const planModel = require('../models/plan.model');

const getAllPlans = async (req, res) => {
  try {
    const plans = await planModel.find();

    if (plans.length !== 0) {
      return res.json(plans);
    }

    return res.status(404).json({
      status: 'error',
      message: 'No plans found',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while fetching plans',
      error: error,
    });
  }
};

const getPlanById = async (req, res) => {
  const planId = req.params.id;
  if (!planId) {
    return res.status(400).json({ status: "error", message: "Plan id is required" });
  }
  try {
    const plan = await planModel.findById(planId);

    if (!plan) {
      return res.status(404).json({ status: 'error', message: 'Plan not found' });
    }

    return res.json(plan);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Server Error while fetching plan by ID' });
  }
};

const updatePlan = async (req, res) => {
  // console.log(req.body)
  const { planId } = req.body;

  if (!planId) {
    return res.status(400).json({
      status: 'error',
      message: 'Plan ID is required',
    });
  }

  try {
    const plan = await planModel.findById(planId);

    if (!plan) {
      return res.status(404).json({
        status: 'error',
        message: 'Plan not found',
      });
    }
    const { name, description, price, duration, buttonText, popular, activeDashboard, features, permissions } = req.body;

    // Assign all incoming fields directly (FormData sends everything as strings, so convert accordingly)
    plan.name = name;
    plan.description = description;
    plan.price = parseFloat(price);

    let formattedDuration = '';

    switch (duration) {
      case 'per_month':
        formattedDuration = 'per month';
        break;
      case 'per_year':
        formattedDuration = 'per year';
        break;
      default:
        formattedDuration = duration; 
    }

    plan.period = formattedDuration;

    plan.buttonText = buttonText;
    plan.popular = popular === 'true';
    plan.activeDashboard = activeDashboard;

    // Features (JSON string in FormData)
    plan.features = JSON.parse(features);
    plan.permissions = JSON.parse(permissions);

    console.log(plan)
    await plan.save();

    return res.status(200).json({
      status: 'success',
      message: 'Plan updated successfully',
      data: plan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while updating plan',
      error: error.message,
    });
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  updatePlan,
};
