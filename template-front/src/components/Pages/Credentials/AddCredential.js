import axios from 'axios';
import React, { useEffect, useState } from 'react';
import config from '../../../utils/helpers/helper';
import { useNavigate } from 'react-router-dom';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import { notify } from '../../../utils/notifications/ToastNotification';
import { getToken } from '../../../utils/localStorageHelper';
import { CONSTANT } from '../../../utils/constant';

const { API_URL } = config;

const AddCredential = ({ title }) => {

  useEffect(() => {
  document.title = `${title} • ${CONSTANT.AUTH.APP_NAME}`;
}, [title]);
  
  const navigate = useNavigate();

  const [newCredential, setNewCredential] = useState({
    name: '',
    provider: '',
    host: '',
    port: '',
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    provider: '',
    host: '',
    port: '',
    username: '',
    password: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach((key) => (newErrors[key] = ''));

    if (!newCredential.name) {
      newErrors.name = 'Name is required!';
      isValid = false;
    }

    if (!newCredential.provider) {
      newErrors.provider = 'Provider is required!';
      isValid = false;
    }

    if (!newCredential.host) {
      newErrors.host = 'Host is required!';
      isValid = false;
    }

    if (!newCredential.port) {
      newErrors.port = 'Port is required!';
      isValid = false;
    } else if (isNaN(newCredential.port)) {
      newErrors.port = 'Port must be a number!';
      isValid = false;
    }

    if (!newCredential.username) {
      newErrors.username = 'Username is required!';
      isValid = false;
    }

    if (!newCredential.password) {
      newErrors.password = 'Password is required!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
        return;
      }

      const response = await axios.post(`${API_URL}/credentials`, newCredential, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        const { status, message } = response.data;
        notify(message, status);
        navigate('/credentials');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCredential({ ...newCredential, [name]: value });
  };

  const handleCancel = () => {
    setNewCredential({
      name: '',
      provider: '',
      host: '',
      port: '',
      username: '',
      password: '',
    });
    navigate('/credentials');
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
          <h4 className="mb-sm-0 font-size-18">Add New Credential</h4>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <div className="card-body">
            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
            <form onSubmit={handleSave}>
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="name" className="col-form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={newCredential.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="text-danger">{errors.name}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="provider" className="col-form-label">Provider</label>
                  <select
                    className="form-select"
                    id="provider"
                    name="provider"
                    value={newCredential.provider}
                    onChange={handleChange}
                  >
                    <option value="">Select Provider</option>
                    <option value="Mailtrap">Mailtrap</option>
                    <option value="Gmail">Gmail</option>
                  </select>
                  {errors.provider && <div className="text-danger">{errors.provider}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="host" className="col-form-label">Host</label>
                  <input
                    type="text"
                    className="form-control"
                    id="host"
                    name="host"
                    value={newCredential.host}
                    onChange={handleChange}
                  />
                  {errors.host && <div className="text-danger">{errors.host}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="port" className="col-form-label">Port</label>
                  <input
                    type="text"
                    className="form-control"
                    id="port"
                    name="port"
                    value={newCredential.port}
                    onChange={handleChange}
                  />
                  {errors.port && <div className="text-danger">{errors.port}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="username" className="col-form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={newCredential.username}
                    onChange={handleChange}
                  />
                  {errors.username && <div className="text-danger">{errors.username}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="password" className="col-form-label">Password</label>
                  <div className="input-group">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={newCredential.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        const passwordField = document.getElementById('password');
                        passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
                      }}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                  {errors.password && <div className="text-danger">{errors.password}</div>}
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-success w-md">Save Credential</button>
                <button
                  type="button"
                  className="btn btn-secondary w-md mx-2"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCredential;
