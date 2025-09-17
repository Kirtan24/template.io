import React, { useEffect, useState } from 'react';
import { setToken, setUserInfo, setUserPermissions } from '../../utils/localStorageHelper';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../utils/helpers/helper';
import { CONSTANT } from '../../utils/constant';
import Spinner from '../Spinner/Spinner';
import Title from '../Pages/Title';

const { API_URL } = config;

const Login = ({ title, setIsAuthenticated }) => {

  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const validateFormData = () => {
    let isValid = true;

    if (!formData.email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: 'Please enter your email' }));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors((prevErrors) => ({ ...prevErrors, email: 'Please enter a valid email address' }));
      isValid = false;
    }

    if (!formData.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: 'Please enter your password' }));
      isValid = false;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      general: '',
    }));

    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateFormData()) return;

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        const data = response?.data;

        if (data.status === 'success') {
          setUserInfo(data.user, rememberMe);
          setToken(data.token, rememberMe);
          setUserPermissions(data.user.permissions, rememberMe);

          setLoading(false);
          setIsAuthenticated(true);

          const from = location.state?.from?.pathname || '/dashboard';
          console.log(from)
          navigate(from);
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            general: data.message || 'Login failed. Please try again.',
          }));
        }
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: 'Login failed. Please try again.',
        }));
      }
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        general:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    Object.keys(errors).forEach((key) => name === key && (errors[key] = ''));
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  return (
    <>
      <Title title={title} />
      <div className="account-pages my-51 pt-sm-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card overflow-hidden">
                <div className="bg-primary bg-soft">
                  <div className="row">
                    <div className="col-7">
                      <div className="text-primary p-4">
                        <h5 className="text-primary">Welcome Back !</h5>
                      </div>
                    </div>
                    <div className="col-5 align-self-end">
                      <img src="assets/images/profile-img.png" alt="" className="img-fluid" />
                    </div>
                  </div>
                </div>
                <div className="card-body pt-0">
                  <div className="auth-logo">
                    <a href="index.html" className="auth-logo-light">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img src="assets/images/logo-light.svg" alt="" className="rounded-circle" height="34" />
                        </span>
                      </div>
                    </a>
                    <a href="index.html" className="auth-logo-dark">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img src="assets/images/logo.svg" alt="" className="rounded-circle" height="34" />
                        </span>
                      </div>
                    </a>
                  </div>
                  <div className="p-2">
                    <form onSubmit={handleLogin} className="form-horizontal">
                      {errors.general && <div className="alert alert-danger ps-3">{errors.general}</div>}

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="text"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          placeholder="Enter email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-group auth-pass-inputgroup">
                          <input
                            type={passwordVisible ? 'text' : 'password'}
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                          <button
                            className="btn btn-light"
                            type="button"
                            id="password-addon"
                            onClick={togglePasswordVisibility}
                          >
                            <i className={`mdi ${passwordVisible ? 'mdi-eye-off' : 'mdi-eye-outline'}`}></i>
                          </button>
                          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="remember-check"
                          checked={rememberMe}
                          onChange={handleRememberMeChange}
                        />
                        <label className="form-check-label" htmlFor="remember-check">
                          Remember me
                        </label>
                      </div>

                      <div className="mt-3 d-grid">
                        <button className="btn btn-primary waves-effect waves-light d-flex align-items-center justify-content-center gap-2" type="submit" disabled={loading}>
                          {loading && <Spinner />}
                          Log In
                        </button>
                      </div>

                      <div className="mt-4 text-center">
                        <Link to='/forgot-password' className="text-muted"><i className="mdi mdi-lock me-1"></i> Forgot your password?</Link>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-center">
                <p>&copy; 2025 {CONSTANT.AUTH.APP_NAME} All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
