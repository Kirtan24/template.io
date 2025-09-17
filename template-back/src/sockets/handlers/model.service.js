const permissionModel = require('../../models/permission.model');
const templateModel = require('../../models/template.model');
const inboxModel = require('../../models/inbox.model');
const emailtemplateModel = require('../../models/emailTemplate.model');
const companyModel = require('../../models/company.model');
const userModel = require('../../models/user.model');
const planModel = require('../../models/plan.model');

const getPermissionsService = async () => {
  const permissions = await permissionModel.find({ deleted: { $ne: true } }).select('-__v');
  return permissions;
};



const getAllEmailTemplatesService = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw new Error('User not found.');

  const companyId = user.companyId;
  const userRole = user.role;

  let query = { deleted: { $ne: true } };

  if (userRole === 'admin') {
    query = { deleted: { $ne: true } };
  } else if (userRole === 'company' || userRole === 'employee') {
    query = {
      $or: [
        { companyId: null },
        { companyId: companyId },
      ],
      deleted: { $ne: true },
    };
  } else {
    throw new Error('Unauthorized user role.');
  }

  const emailTemplates = await emailtemplateModel.find(query)
    .populate('companyId')
    .select('-__v');

  return emailTemplates;
};

const getAllCompaniesService = async () => {
  const companies = await companyModel.find()
    .populate('permissions')
    .populate('plan', 'name')
    .sort({ createdAt: -1 });

  return companies;
};

const getAllInboxService = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User id not found.');
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const companyId = user.companyId;
    const userRole = user.role;

    let query = {};
    if (userRole === 'admin') {
      query = {};
    } else if (userRole === 'company' || userRole === 'employee') {
      query = { companyId: companyId };
    } else {
      throw new Error('Unauthorized user role.');
    }

    const mails = await inboxModel.find(query)
      .select('senderEmail recipientEmail subject body emailTemplateId documentTemplateId documentLink sentTimestamp companyId isSigned isForSign status scheduledTime signedTimestamp signingUserId oneTimeToken')
      .populate('documentTemplateId', 'name')
      .populate('emailTemplateId', 'template_name')
      .populate('signingUserId', 'name')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });

    return mails || [];
  } catch (error) {
    throw new Error('Failed to fetch inbox.');
  }
};

const getAllUserService = async (data) => {
  if (!data.userId) {
    throw new Error('User not authenticated');
  }

  const user = await userModel.findById(data.userId).populate('companyId', 'name');

  if (!user) {
    throw new Error('User not found');
  }

  let users;

  if (user.role === 'admin') {
    users = data.companyId
      ? await userModel.find({ companyId: data.companyId }).populate('companyId', 'name').sort({ role: 1 })
      : await userModel.find().populate('companyId', 'name').sort({ role: 1 });
  } else {
    users = await userModel.find({ companyId: user.companyId }).populate('companyId', 'name').sort({ role: 1 });
  }
  console.log(users)
  return users;
};

const getTotalCompanies = async () => {
  return await companyModel.countDocuments({ companyStatus: 'active' });
};

const getTotalUsers = async ({ userId, companyId }) => {
  const user = await userModel.findById(userId);
  if (user.role === 'admin') {
    return await userModel.countDocuments({ role: { $ne: 'admin' } });
  } else {
    return await userModel.countDocuments({ companyId });
  }
};

const getTotalTemplates = async () => {
  return await templateModel.countDocuments({
    $or: [{ companyId: null }, { companyId: { $ne: null, $exists: true } }],
  });
};

const getTemplatesCreatedByCompany = async ({ companyId }) => {
  return await templateModel.countDocuments({ companyId });
};

const getTotalActiveDashboards = async ({ companyId }) => {
  const company = await companyModel.findById(companyId, { activeDashboard: 1 });
  return company?.activeDashboard || 0;
};





module.exports = {
  getPermissionsService,
  getAllEmailTemplatesService,
  getAllInboxService,
  getAllCompaniesService,
  getAllUserService,
  getTotalCompanies,
  getTotalUsers,
  getTotalTemplates,
  getTemplatesCreatedByCompany,
  getTotalActiveDashboards,
};
