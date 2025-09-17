import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../../utils/helpers/helper';
import { handleError } from '../../utils/errorHandling/errorHandler';
import Title from '../Pages/Title';
import { CONSTANT } from '../../utils/constant';
import Spinner from '../Spinner/Spinner';

const { API_URL } = config;

const ResetPassword = ({ title }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const [tokenValid, setTokenValid] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ password: '', confirm: '' });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(prev => !prev);
  const toggleConfirmVisibility = () => setConfirmVisible(prev => !prev);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/validate-token`, { params: { token } });
        if (res.status === 200 && res.data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setStatus({ type: 'error', message: res.data.message});
        }
      } catch (err) {
        handleError(err);
        setTokenValid(false);
        setStatus({ type: 'error', message: err.response?.data?.message});
      }
    };

    if (token) verifyToken();
    else {
      setTokenValid(false);
      setStatus({ type: 'error', message: 'Token not found in URL' });
    }
  }, [token]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { password: '', confirm: '' };

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    if (!confirm) {
      newErrors.confirm = 'Confirm password is required';
      isValid = false;
    } else if (password && confirm !== password) {
      newErrors.confirm = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) setLoading(false);
    return isValid;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, { password, token });
      setStatus({ type: 'success', message: res.data.message });
    } catch (err) {
      handleError(err);
      setStatus({ type: 'error', message: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title title={title} />
      <div className="account-pages my-4 pt-sm-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card overflow-hidden">
                <div className="bg-primary bg-soft">
                  <div className="row">
                    <div className="col-7">
                      <div className="text-primary p-4">
                        <h5 className="text-primary">Set New Password</h5>
                        <p>Update your password securely</p>
                      </div>
                    </div>
                    <div className="col-5 align-self-end">
                      <img src="/assets/images/profile-img.png" alt="" className="img-fluid" />
                    </div>
                  </div>
                </div>
                <div className="card-body pt-0">
                  <div className="avatar-md profile-user-wid mb-4">
                    <span className="avatar-title rounded-circle bg-light">
                      <img src="/assets/images/logo.svg" alt="" className="rounded-circle" height="34" />
                    </span>
                  </div>

                  <div className="p-2">
                    {tokenValid ? (
                      status.type === 'success' ? (
                        <div className="alert alert-success text-center">
                          <div>
                            {status.message}
                            <Link to="/login" className="text-success fw-bold text-decoration-underline ms-2">Go to Login</Link>
                          </div>
                        </div>
                      ) : (
                        <form className="form-horizontal" onSubmit={handleReset}>
                          {/* Password */}
                          <div className="mb-3">
                            <label htmlFor="password" className="form-label">New Password</label>
                            <div className="input-group auth-pass-inputgroup">
                              <input
                                type={passwordVisible ? 'text' : 'password'}
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                id="password"
                                name="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <button
                                className="btn btn-light"
                                type="button"
                                onClick={togglePasswordVisibility}
                              >
                                <i className={`mdi ${passwordVisible ? 'mdi-eye-off' : 'mdi-eye-outline'}`}></i>
                              </button>
                              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>
                          </div>

                          {/* Confirm Password */}
                          <div className="mb-3">
                            <label htmlFor="confirm" className="form-label">Confirm Password</label>
                            <div className="input-group auth-pass-inputgroup">
                              <input
                                type={confirmVisible ? 'text' : 'password'}
                                className={`form-control ${errors.confirm ? 'is-invalid' : ''}`}
                                id="confirm"
                                name="confirm"
                                placeholder="Confirm new password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                              />
                              <button
                                className="btn btn-light"
                                type="button"
                                onClick={toggleConfirmVisibility}
                              >
                                <i className={`mdi ${confirmVisible ? 'mdi-eye-off' : 'mdi-eye-outline'}`}></i>
                              </button>
                              {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
                            </div>
                          </div>

                          <div className="d-flex justify-content-end">
                            <button
                              className="btn btn-primary w-md waves-effect waves-light d-flex align-items-center justify-content-end gap-2"
                              type="submit"
                              disabled={loading}
                            >
                              {loading && <Spinner />}
                              Reset Password
                            </button>
                          </div>
                        </form>
                      )
                    ) : (
                      <div className="alert alert-danger text-center">
                        {status.message}
                      </div>
                    )}

                  </div>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p>Remember It ? <Link to="/login" class="fw-medium text-primary"> Login</Link> </p>
                <p>&copy; 2025 {CONSTANT.AUTH.APP_NAME} All Rights Reserved.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
