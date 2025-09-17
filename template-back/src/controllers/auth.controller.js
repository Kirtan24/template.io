const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const companyModel = require('../models/company.model');
const User = require('../models/user.model');
const userModel = require('../models/user.model');
const permissionModel = require('../models/permission.model');
const planModel = require('../models/plan.model');
const templateModel = require('../models/template.model');
const { emitToAdmins } = require('../utils/socketHelpers');
const { inactiveCompany } = require('../sockets/handlers/company.handler.js');
const { sendEmail } = require('./company.controller.js');

const FRONT_URL = process.env.FRONT_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).send({
        status: 'error',
        message: 'Account with this email not found.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({
        status: 'error',
        message: "Password didn't match, Please try again.",
      });
    }

    if (user.role !== 'admin') {

      const company = await companyModel.findById(user.companyId).populate('plan', 'name');;

      if (!company) {
        return res.status(400).send({
          status: 'error',
          message: 'Company not found.',
        });
      }

      let maxLogins = 0;
      console.log(company.plan.name)
      switch (company.plan.name) {
        case 'Basic':
          maxLogins = 1;
          break;
        case 'Professional':
          maxLogins = 3;
          break;
        case 'Enterprise':
          maxLogins = Infinity;
          break;
        default:
          return res.status(400).send({
            status: 'error',
            message: 'Invalid company plan.',
          });
      }

      if (!company.lastLoggedInUser.includes(user._id)) {
        if (company.activeDashboard >= maxLogins) {
          return res.status(400).send({
            status: 'error',
            message: 'The maximum number of users for this plan is already logged in.',
          });
        }

        company.lastLoggedInUser.push(user._id);
        company.activeDashboard += 1;
        company.lastUpdated = new Date();
      }

      await company.save();
    }

    const permissions = await permissionModel.find({
      '_id': { $in: user.permissions }
    }).select('name');

    const permissionNames = permissions.map(permission => permission.name);

    const token = jwt.sign(
      { id: user._id, permissions: permissionNames, companyId: user.companyId },
      process.env.JWT_SECRET
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
      permissions: permissionNames,
    };

    return res.status(200).send({
      status: 'success',
      message: 'Login successful.',
      user: userData,
      token
    });
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Server error.',
      error
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, contactNumber, address, plan } = req.body;

    const companyExists = await companyModel.findOne({ email });
    if (companyExists) {
      return res.status(400).json({
        status: 'error',
        message: 'This email is already in use',
      });
    }

    const planDetails = await planModel.findById(plan);
    if (!planDetails) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid plan selected',
      });
    }

    const activeDashboardCount = planDetails.activeDashboard;

    const newCompany = new companyModel({
      name,
      email,
      contactNumber,
      address,
      plan: planDetails.id,
      permissions: planDetails.permissions,
      companyStatus: 'inactive',
      activeDashboard: activeDashboardCount,
    });

    await newCompany.save();

    const admins = await userModel.find({ role: 'admin' });
    const adminIds = admins.map(admin => admin._id.toString());

    const companies = await inactiveCompany();

    emitToAdmins(adminIds, 'inactive-companies', companies);

    res.status(200).json({
      status: 'success',
      message: 'Company registered successfully. Awaiting admin approval.',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error registering company',
      error: err.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (user.role !== 'admin') {
      const company = await companyModel.findById(user.companyId);
      if (!company) {
        return res.status(400).json({ message: 'Company not found' });
      }

      if (company.activeDashboard > 0) {
        company.activeDashboard -= 1;
        company.lastLoggedInUser = company.lastLoggedInUser.filter(id => id.toString() !== user._id.toString());
        await company.save();
      }
    }
    console.log('Logout successful');
    return res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Error during logout',
      error: err
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: 'User with this email does not exist' });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();

    const resetURL = `${FRONT_URL}/reset-password?token=${resetToken}`;

    console.log("📧 Email Sending...");
    const emailSent = await sendEmail(
      ADMIN_EMAIL,
      email,
      'Password Reset Link',
      `<p>You requested to reset your password.</p>
       <p>Click <a href="${resetURL}">here</a> to reset it. 
       This link is valid for 30 minutes and can be used only once.</p>`
    );

    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending email' });
    }

    return res.status(200).json({ message: 'Password reset link sent to email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    console.log("✅ Password Updated.");
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const validateToken = async (req, res) => {
  const { token } = req.query;
  
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
    }

    res.status(200).json({ valid: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: 'Server Error' });
  }
};


module.exports = {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  validateToken
};
