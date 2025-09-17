const bcrypt = require('bcrypt');
const companyModel = require('../models/company.model');
const userModel = require('../models/user.model');
const templateModel = require('../models/template.model');
const { sendEmail } = require('./company.controller');

const getAllUser = async (req, res) => {
  try {
    const companyIdFromQuery = req.query.companyId;
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await userModel.findById(loggedInUser.id).populate('companyId', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let users;

    if (user.role === 'admin') {
      users = companyIdFromQuery
        ? await userModel.find({ companyId: companyIdFromQuery }).populate('companyId', 'name').sort({ role: 1 })
        : await userModel.find().populate('companyId', 'name').sort({ role: 1 });
    } else {
      users = await userModel.find({ companyId: user.companyId }).populate('companyId', 'name').sort({ role: 1 });
    }

    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createUser = async (req, res) => {
  const { name, email } = req.body;
  const permissions = req.body['permissions[]'] || req.body.permissions;

  if (!name || !email || !permissions || permissions.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Name, email, and at least one permission are required',
    });
  }
  try {
    const user = await userModel.findById(req.user.id);
    const companyId = user?.companyId || (user.role === 'admin' ? null : undefined);

    if (companyId === undefined) {
      return res.status(404).json({
        status: 'error',
        message: 'User or company not found',
      });
    }

    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists',
      });
    }

    const defaultPassword = '12345678';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: 'employee',
      permissions,
      companyId,
    });

    await newUser.save();
    console.log(newUser);

    const subject = 'Welcome to the Team!';
    const message = `Hi ${name},\n\nYour account has been created successfully.\n\nLogin Email: ${email}\nPassword: ${defaultPassword}\n\nPlease log in and change your password as soon as possible.\n\nThanks,\nTeam`;

    console.log('Sending Email...')
    await sendEmail(user.email, email, subject, message);

    return res.status(201).json({
      status: 'success',
      message: 'User created and email sent successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while creating user',
    });
  }
};

const deleteUser = async (req, res) => {
  const userIdToDelete = req.params.id;

  try {
    const user = await userModel.findById(req.user.id);
    if (!user || (user.role !== 'company' && !user.companyId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to delete user',
      });
    }

    const userToDelete = await userModel.findById(userIdToDelete);
    if (!userToDelete) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Optional: prevent deletion of admins or self-deletion
    if (userToDelete.role === 'company') {
      return res.status(403).json({
        status: 'error',
        message: 'You don\'t have permission to delete this user',
      });
    }

    const company = await companyModel.findById(user.companyId);

    if (!company) {
      return res.status(400).json({
        status: 'error',
        message: 'Company not found',
      });
    }

    if (company.activeDashboard > 0) {
      company.activeDashboard -= 1;
    }

    company.lastLoggedInUser = company.lastLoggedInUser.filter(
      (id) => id.toString() !== userToDelete._id.toString()
    );

    await company.save();

    await userModel.findByIdAndDelete(userIdToDelete);

    const subject = 'Account Deletion Notice';
    const message = `Hi ${userToDelete.name},\n\nYour account with the email (${userToDelete.email}) has been deleted by the admin.\n\nIf you believe this was a mistake, please contact your administrator.\n\nThanks,\nTeam`;

    console.log('Sending Email...');
    await sendEmail(user.email, userToDelete.email, subject, message);

    return res.status(200).json({
      status: 'success',
      message: 'User deleted and notification email sent',
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while deleting user',
    });
  }
};


const userProfile = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await userModel.findById(loggedInUser.id).populate('companyId', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { name, phone, companyId } = req.body;

    if (!loggedInUser) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await userModel.findById(loggedInUser.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.companyId = companyId || user.companyId;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!loggedInUser) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await userModel.findById(loggedInUser.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error updating password',
      error: error.message,
    });
  }
};

const dashboardState = async (req, res) => {
  try {

    const userId = req.user.id;
    const user = await userModel.findById(userId).populate('companyId'); // Assuming companyId is populated

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const { role, companyId } = user;

    let data = {};

    if (role === 'admin') {
      // Admin statistics
      const totalCompanies = await companyModel.countDocuments({ companyStatus: 'active' });
      const totalUsers = await userModel.countDocuments({ role: { $ne: 'admin' } });
      const totalTemplates = await templateModel.countDocuments({
        $or: [{ companyId: null }, { companyId: { $ne: null, $exists: true } }],
      });
      const templatesCreatedByCompany = await templateModel.countDocuments({
        companyId: { $ne: null, $exists: true },
      });

      data = {
        totalCompanies,
        totalUsers,
        totalTemplates,
        templatesCreatedByCompany,
      };
    } else if (role === 'user' || companyId) {
      const totalUsers = await userModel.countDocuments({ companyId: companyId });
      const templatesCreatedByCompany = await templateModel.countDocuments({ companyId: companyId });

      const company = await companyModel.findOne({ _id: companyId }, { activeDashboard: 1 });
      const totalActiveDashboards = company ? company.activeDashboard : 0;

      data = {
        totalUsers,
        templatesCreatedByCompany,
        totalActiveDashboards,
      };
    } else {
      return res.status(400).json({ status: 'error', message: 'Invalid user or company' });
    }

    res.json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('❗ Error in dashboardState function:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics',
    });
  }
};

module.exports = {
  getAllUser,
  deleteUser,
  createUser,
  userProfile,
  updateProfile,
  updatePassword,
  dashboardState,
};
