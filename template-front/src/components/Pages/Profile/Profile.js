import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import { getToken } from '../../../utils/localStorageHelper';
import config from '../../../utils/helpers/helper';
import { notify } from '../../../utils/notifications/ToastNotification';
import { CONSTANT } from '../../../utils/constant';
import Spinner from '../../Spinner/Spinner';
import Title from '../Title';

const { API_URL } = config;

const Profile = ({ title }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState({});
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordVisible, setPasswordVisible] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field],
    });
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        setErrors({ general: CONSTANT.AUTH.AUTH_REQUIRED });
        return;
      }

      const response = await axios.post(`${API_URL}/user/profile`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setUser(response.data.user);
        setEditUser(response.data.user);
      }
    } catch (error) {
      handleError(error);
      setErrors({ general: 'Error loading profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const validateUserForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach((key) => (newErrors[key] = ''));

    if (editMode) {
      if (!editUser.name) {
        newErrors.name = 'Name is required!';
        isValid = false;
      }

      if (!editUser.email) {
        newErrors.email = 'Email is required!';
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(editUser.email)) {
        newErrors.email = 'Invalid email format!';
        isValid = false;
      }

      if (!editUser.phone) {
        newErrors.phone = 'Phone number is required!';
        isValid = false;
      } else if (!/^\d{10}$/.test(editUser.phone)) {
        newErrors.phone = 'Invalid phone number!';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const updateUserProfile = async () => {

    if (!validateUserForm()) {
      console.log(errors)
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setErrors({ general: CONSTANT.AUTH.AUTH_REQUIRED });
        return;
      }

      const response = await axios.post(`${API_URL}/user/update-profile`, editUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setUser(response.data.user);
        setEditMode(false);
        notify(response.data.message, response.data.status);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const validatePasswordForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach((key) => (newErrors[key] = ''));

    if (!passwords.oldPassword) {
      newErrors.oldPassword = 'Old Password is required!';
      isValid = false;
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = 'New Password is required!';
      isValid = false;
    } else {
      const passwordStrengthPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordStrengthPattern.test(passwords.newPassword)) {
        newErrors.newPassword =
          'Password must be at least 8 characters long, include one letter, one number, and one special character!';
        isValid = false;
      }
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required!';
      isValid = false;
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'New passwords do not match!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const updatePassword = async () => {

    if (!validatePasswordForm()) {
      console.log(errors)
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrors({ passwordError: 'New passwords do not match!' });
      return;
    }

    try {
      const token = getToken();
      const response = await axios.post(`${API_URL}/user/update-password`, passwords, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        notify(response.data.message, response.data.status);
      }
    } catch (error) {
      handleError(error);
    }
  };

  if (errors.general) return <div className="alert alert-danger">{errors.general}</div>;

  const handleCancel = () => {
    setErrors({})
    setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Profile</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">

              <h4>Personal Details</h4>

              {errors.general && <div className="alert alert-danger">{errors.general}</div>}

              {loading ? (<Spinner className='dark' />) : <form className='my-4'>

                <div className="mb-3 row">
                  <label htmlFor="name" className="col-md-2 col-form-label">Name</label>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={editMode ? editUser.name : user.name}
                      onChange={editMode ? handleEditChange : undefined}
                      disabled={!editMode}
                    />
                    {errors.name && <div className="text-danger">{errors.name}</div>}
                  </div>
                </div>

                <div className="mb-3 row">
                  <label htmlFor="email" className="col-md-2 col-form-label">Email</label>
                  <div className="col-md-10">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={editMode ? editUser.email : user.email}
                      onChange={editMode ? handleEditChange : undefined}
                      disabled={!editMode}
                    />
                    {errors.email && <div className="text-danger">{errors.email}</div>}
                  </div>
                </div>

                <div className="mb-3 row">
                  <label htmlFor="phone" className="col-md-2 col-form-label">Phone</label>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={editMode ? editUser.phone : user.phone}
                      onChange={editMode ? handleEditChange : undefined}
                      disabled={!editMode}
                    />
                    {errors.phone && <div className="text-danger">{errors.phone}</div>}
                  </div>
                </div>

                <div className="mb-3 row">
                  <label htmlFor="role" className="col-md-2 col-form-label">Role</label>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      id="role"
                      name="role"
                      value={user.role}
                      disabled
                    />
                  </div>
                </div>

                {user.companyId && (
                  <div className="mb-3 row">
                    <label htmlFor="company" className="col-md-2 col-form-label">Company</label>
                    <div className="col-md-10">
                      <input
                        type="text"
                        className="form-control"
                        id="company"
                        name="company"
                        value={user.companyId.name}
                        disabled
                      />
                    </div>
                  </div>
                )}

                <div className="mb-3 row">
                  <label htmlFor="lastLogin" className="col-md-2 col-form-label">Last Login</label>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      id="lastLogin"
                      name="lastLogin"
                      value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      disabled
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-10 offset-md-2">
                    {!editMode ? (
                      <button
                        type="button"
                        className="btn btn-primary w-md"
                        onClick={() => {
                          setErrors({})
                          setEditMode(true)
                        }}
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-success w-md"
                          onClick={updateUserProfile}
                        >
                          Update Profile
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary w-md mx-2"
                          onClick={() => {
                            setErrors({})
                            setEditUser(user)
                            setEditMode(false)
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>}

              <div className="dropdown-divider my-5 mb-4"></div>

              <h4>Update Password</h4>

              {errors.passwordError && (
                <div className="alert alert-danger">{errors.passwordError}</div>
              )}

              {loading ? (<Spinner className='dark' />) : <form className="mb-4">
                <div className="row my-4">
                  <div className="col-md-4 mb-1">
                    <label className="form-label">Old Password</label>
                    <div className="input-group auth-pass-inputgroup">
                      <input
                        type={passwordVisible.oldPassword ? 'text' : 'password'}
                        className="form-control"
                        name="oldPassword"
                        value={passwords.oldPassword}
                        onChange={handlePasswordChange}
                      />
                      <button
                        className="btn btn-light"
                        type="button"
                        onClick={() => togglePasswordVisibility('oldPassword')}
                      >
                        <i
                          className={`mdi ${passwordVisible.oldPassword ? 'mdi-eye-off' : 'mdi-eye-outline'}`}
                        ></i>
                      </button>
                    </div>
                    {errors.oldPassword && (
                      <div className="text-danger">{errors.oldPassword}</div>
                    )}
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">New Password</label>
                    <div className="input-group auth-pass-inputgroup">
                      <input
                        type={passwordVisible.newPassword ? 'text' : 'password'}
                        className="form-control"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                      />
                      <button
                        className="btn btn-light"
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                      >
                        <i
                          className={`mdi ${passwordVisible.newPassword ? 'mdi-eye-off' : 'mdi-eye-outline'}`}
                        ></i>
                      </button>
                    </div>
                    {errors.newPassword && (
                      <div className="text-danger">{errors.newPassword}</div>
                    )}
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-group auth-pass-inputgroup">
                      <input
                        type={passwordVisible.confirmPassword ? 'text' : 'password'}
                        className="form-control"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                      <button
                        className="btn btn-light"
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                      >
                        <i
                          className={`mdi ${passwordVisible.confirmPassword ? 'mdi-eye-off' : 'mdi-eye-outline'}`}
                        ></i>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="text-danger">{errors.confirmPassword}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-success w-md"
                      onClick={updatePassword}
                    >
                      Update Password
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary w-md mx-2"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
