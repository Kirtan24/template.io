import axios from 'axios';
import config from '../../../utils/helpers/helper';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notify } from '../../../utils/notifications/ToastNotification';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import { getToken } from '../../../utils/localStorageHelper';
import { CONSTANT } from '../../../utils/constant';

const { API_URL } = config;

const EditCredential = ({ title }) => {

  useEffect(() => {
  document.title = `${title} • ${CONSTANT.AUTH.APP_NAME}`;
}, [title]);
  
  const { id } = useParams();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
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
    general: ''
  });

  useEffect(() => {
    const fetchCredential = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`${API_URL}/credentials/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setCredentials(response.data);
        }
      } catch (error) {
        handleError(error);
      }
    };

    fetchCredential();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach((key) => (newErrors[key] = ''));

    if (!credentials.name) {
      newErrors.name = 'Name is required!';
      isValid = false;
    }

    if (!credentials.provider) {
      newErrors.provider = 'Provider is required!';
      isValid = false;
    }

    if (!credentials.host) {
      newErrors.host = 'Host is required!';
      isValid = false;
    }

    if (!credentials.port) {
      newErrors.port = 'Port is required!';
      isValid = false;
    } else if (isNaN(credentials.port)) {
      newErrors.port = 'Port must be a number!';
      isValid = false;
    }

    if (!credentials.username) {
      newErrors.username = 'Username is required!';
      isValid = false;
    }

    if (!credentials.password) {
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

      const response = await axios.put(`${API_URL}/credentials/${id}`, credentials, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const { status, message } = response.data;
        notify(message, status);
        navigate('/credentials');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleCancel = () => {
    navigate('/credentials');
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
          <h4 className="mb-sm-0 font-size-18">Edit Credential</h4>
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
                    value={credentials.name}
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
                    value={credentials.provider}
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
                    value={credentials.host}
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
                    value={credentials.port}
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
                    value={credentials.username}
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
                      value={credentials.password}
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
                      View
                    </button>
                  </div>
                  {errors.password && <div className="text-danger">{errors.password}</div>}
                </div>
              </div>

              <div className="mt-3">
                <button type="submit" className="btn btn-success w-md">Update Credential</button>
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

export default EditCredential;
