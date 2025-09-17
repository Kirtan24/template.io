const permissionModel = require('../models/permission.model');
const userModel = require('../models/user.model');
const planModel = require('../models/plan.model');
const companyModel = require('../models/company.model');
const { emitToUser } = require('../utils/socketHelpers');

const CRUDPermission = async (req, res) => {
  const { operation, id, name, display_name, category, socketId } = req.body;

  try {
    switch (operation) {
      case 'read': {
        if (id) {
          const permission = await permissionModel.findById(id);
          if (!permission) {
            return res.status(404).json({ status: 'error', message: "Permission not found." });
          }
          return res.status(200).json({ permission });
        }

        const permissions = await permissionModel.find().sort({ createdAt: -1 });
        return res.status(200).json({ permissions });
      }

      case 'create': {
        const existingPermission = await permissionModel.findOne({ name });
        if (existingPermission) {
          return res.status(400).json({ status: 'warning', message: "Permission already exists." });
        }

        const newPermission = new permissionModel({ name, display_name, category });
        await newPermission.save();

        const allPermissions = await permissionModel.find();
        const allPermissionIds = allPermissions.map((perm) => perm._id);

        await userModel.updateMany(
          { role: 'admin' },
          { $set: { permissions: allPermissionIds } }
        );

        const adminUsers = await userModel.find({ role: 'admin' });
        adminUsers.forEach((user) => {
          console.log(`🔵 Emitting "permission-added" to admin: ${user._id}`);
          emitToUser(user._id.toString(), 'permission-added', { permission: newPermission, socketId });
        });

        return res.status(201).json({
          status: 'success',
          message: "Permission created successfully and assigned to all admins.",
          permissions: allPermissions,
        });
      }

      case 'update': {
        if (!id) {
          return res.status(400).json({ status: 'info', message: "ID is required for update." });
        }

        const permission = await permissionModel.findById(id);
        if (!permission) {
          return res.status(404).json({ status: 'error', message: "Permission not found." });
        }

        permission.name = name || permission.name;
        permission.display_name = display_name || permission.display_name;
        permission.category = category || permission.category;

        await permission.save();

        // Emit socket event after updating the permission
        const adminUsers = await userModel.find({ role: 'admin' });
        adminUsers.forEach(user => {
          console.log(user._id, "permission-edited")
          emitToUser(user._id.toString(), 'permission-edited', { updatedPermission: permission, socketId });
        });

        const permissions = await permissionModel.find();
        return res.status(200).json({ status: 'success', message: "Permission updated successfully.", permission: permissions });
      }

      case 'delete': {
        if (!id) {
          return res.status(400).json({ status: 'error', message: "ID is required for deletion." });
        }

        const permission = await permissionModel.findById(id);
        if (!permission) {
          return res.status(404).json({ status: 'error', message: "Permission not found." });
        }

        await permissionModel.deleteOne({ _id: id });

        const adminUsers = await userModel.find({ role: 'admin' });
        adminUsers.forEach(user => {
          console.log(user._id, "permission-deleted");
          emitToUser(user._id.toString(), 'permission-deleted', { deletedPermission: id, socketId });
        });

        const permissions = await permissionModel.find();
        return res.status(200).json({ status: 'success', message: "Permission deleted successfully.", permissions });
      }

      default: {
        return res.status(400).json({ status: 'error', message: "Invalid operation type." });
      }
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ status: 'error', message: "An error occurred during the operation.", error });
  }
};

const getAllPermissions = async (req, res) => {
  try {
    const permissions = await permissionModel.find({ deleted: { $ne: true } }).select('-__v');
    if (permissions.length !== 0) {
      return res.json({
        permissions: permissions
      });
    }
    return res.status(404).json({
      status: 'error',
      message: 'No active permissions found'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while fetching permissions'
    });
  }
};

const getCompanyPermissions = async (req, res) => {
  const companyId = req.params.id;

  try {
    const company = await companyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found',
      });
    }

    const plan = await planModel.findById(company.plan);

    return res.json({
      status: 'success',
      permissions: company.permissions,
      planPermissions: plan.permissions,
      user: company,
    });

  } catch (error) {
    console.error('Error fetching company permissions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching company permissions',
    });
  }
};

const getCompanyPermissionsForUser = async (companyId) => {
  try {
    const company = await companyModel.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const permissions = await permissionModel.find({
      _id: { $in: company.permissions },
      deleted: { $ne: true }
    });

    return permissions;
  } catch (error) {
    throw error;
  }
};

const getUserPermissions = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    if (user.role === "admin") {
      const permissions = await permissionModel.find({ deleted: { $ne: true } }).select('-__v');
      return res.json({
        status: 'success',
        message: 'Permissions Fetched Successfully',
        userPermissions: user.permissions,
        compnayPermissions: permissions,
        user,
      });
    }
    const cmpPer = await getCompanyPermissionsForUser(user.companyId);
    return res.json({
      status: 'success',
      message: 'Permissions Fetched Successfully',
      userPermissions: user.permissions,
      compnayPermissions: cmpPer,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching user permissions',
    });
  }
};

const arraysAreEqual = (arr1, arr2) => {
  const set1 = new Set(arr1.map(id => id.toString()));
  const set2 = new Set(arr2.map(id => id.toString()));

  if (set1.size !== set2.size) return false;

  for (const id of set1) {
    if (!set2.has(id)) return false;
  }
  return true;
};

const updatePermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({
      status: 'error',
      message: 'Permissions should be an array of permission IDs.'
    });
  }

  try {
    const user = await userModel.findById(id);
    if (user) {

      if (arraysAreEqual(user.permissions, permissions)) {
        return res.status(200).json({
          status: 'success',
          message: 'Permissions Updated.'
        });
      }

      const validPermissions = await permissionModel.find({ '_id': { $in: permissions } });
      const invalidPermissions = permissions.filter(permissionId => !validPermissions.some(perm => perm._id.toString() === permissionId));

      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'One or more permissions are invalid.',
          invalidPermissions: invalidPermissions
        });
      }

      user.permissions = permissions;
      await user.save();

      return res.status(200).json({
        status: 'success',
        message: 'User permissions updated successfully'
      });
    } else {

      const company = await companyModel.findById(id);
      if (company) {

        if (arraysAreEqual(company.permissions, permissions)) {
          return res.status(200).json({
            status: 'success',
            message: 'Permissions Updated.'
          });
        }

        const validPermissions = await permissionModel.find({ '_id': { $in: permissions } });
        const invalidPermissions = permissions.filter(permissionId => !validPermissions.some(perm => perm._id.toString() === permissionId));

        if (invalidPermissions.length > 0) {
          return res.status(400).json({
            status: 'error',
            message: 'One or more permissions are invalid.',
            invalidPermissions: invalidPermissions
          });
        }

        company.permissions = permissions;
        await company.save();
        return res.json({
          status: 'success',
          message: 'Company permissions updated successfully'
        });
      } else {
        return res.status(404).json({
          status: 'error',
          message: 'User or company not found'
        });
      }
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error updating permissions. Please try again later.'
    });
  }
};

const getPermissionsById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const permissions = await permissionModel.find({
      _id: { $in: user.permissions },
      deleted: { $ne: true },
    });

    return res.json({
      status: 'success',
      message: 'Permissions fetched successfully',
      permissions: permissions || [],
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching permissions',
    });
  }
};

module.exports = {
  getAllPermissions,
  getCompanyPermissions,
  getUserPermissions,
  updatePermissions,
  getPermissionsById,
  CRUDPermission,
};
