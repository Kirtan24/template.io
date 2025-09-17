const Credential = require('../models/credential.model');
const { validationResult } = require('express-validator');

const getAllCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find({ deleted: { $ne: true } }).select('-__v');
    if (credentials.length !== 0) {
      return res.json(credentials);
    }
    return res.status(404).json({
      status: 'error',
      message: 'No active credentials found'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while fetching credentials'
    });
  }
};

const getDeletedCredentials = async (req, res) => {
  try {
    const deletedCredentials = await Credential.find({
      deleted: true,
      deletedAt: { $exists: true, $ne: null }, 
    }).select('-__v');

    if (deletedCredentials.length !== 0) {
      return res.json({
        status: 'success',
        message: 'Deleted credentials fetched successfully',
        data: deletedCredentials
      });
    }

    return res.status(404).json({
      status: 'error',
      message: 'No deleted credentials found'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while fetching deleted credentials'
    });
  }
};

const getCredentialById = async (req, res) => {
  const credentialId = req.params.id;
  try {
    const credential = await Credential.findById(credentialId);
    if (credential) {
      return res.json(credential);
    }
    return res.status(404).json({
      status: 'error',
      message: 'Credential not found'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while fetching credential by ID'
    });
  }
};

const addCredential = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: errors.array()
    });
  }

  const { name, provider, host, port, username, password } = req.body;

  try {
    const newCredential = new Credential({
      name,
      provider,
      host,
      port,
      username,
      password,
    });

    await newCredential.save();
    return res.status(201).json({
      status: 'success',
      message: 'Credential Added Successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while adding credential'
    });
  }
};

const updateCredential = async (req, res) => {
  const credentialId = req.params.id;
  const updates = req.body;

  try {
    let credential = await Credential.findById(credentialId);

    if (!credential) {
      return res.status(404).json({
        status: 'error',
        message: 'Credential not found'
      });
    }

    Object.keys(updates).forEach((key) => {
      if (credential[key] !== undefined && updates[key] !== undefined) {
        credential[key] = updates[key];
      }
    });

    await credential.save();

    return res.json({
      status: 'success',
      message: 'Credential Updated Successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while updating credential'
    });
  }
};

const deleteCredential = async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({
        status: 'error',
        message: 'Credential not found'
      });
    }

    credential.deleted = true;
    credential.deletedAt = new Date();
    await credential.save();

    return res.json({
      status: 'success',
      message: 'Credential Deleted Successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while deleting credential'
    });
  }
};

const restoreCredential = async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({
        status: 'error',
        message: 'Credential not found'
      });
    }

    credential.deleted = false;
    credential.deletedAt = null;
    await credential.save();

    return res.json({
      status: 'success',
      message: 'Credential restored successfully',
      data: credential
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error while restoring credential'
    });
  }
};

module.exports = {
  getAllCredentials,
  getDeletedCredentials,
  getCredentialById,
  addCredential,
  updateCredential,
  deleteCredential,
  restoreCredential,
};
