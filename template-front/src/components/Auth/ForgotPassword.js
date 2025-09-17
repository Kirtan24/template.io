import React, { useState } from 'react';
import axios from 'axios';
import config from '../../utils/helpers/helper';
import { handleError } from '../../utils/errorHandling/errorHandler';
import Title from '../Pages/Title';
import { CONSTANT } from '../../utils/constant';
import Spinner from '../Spinner/Spinner';
import { Link } from 'react-router-dom';

const { API_URL } = config;

const ForgotPassword = ({ title }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({ email: '' });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '' };

    if (!email) {
      newErrors.email = 'Email is required!';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address!';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) setLoading(false);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    if (!validateForm()) return;

    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      if (res.status === 200) {
        setStatus({ type: 'success', message: res.data.message });
        setLoading(false);
        setTimeout(() => {
          setStatus({ type: '', message: '' });
        }, 5000);
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title title={title} />
      <div className="account-pages my-5 pt-sm-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card overflow-hidden">
                <div className="bg-primary bg-soft">
                  <div className="row">
                    <div className="col-7">
                      <div className="text-primary p-4">
                        <h5 className="text-primary">Reset Password</h5>
                        <p>Re-Password with Skote.</p>
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
                    {status.message && (
                      <div className={`alert text-center alert-${status.type === 'success' ? 'success' : 'danger'}`}>
                        {status.message}
                      </div>
                    )}
                    <form className="form-horizontal" onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="useremail" className="form-label">Email</label>
                        <input
                          type="text"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="useremail"
                          placeholder="Enter email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>

                      <div className="d-flex justify-content-end">
                        <button className="btn btn-primary waves-effect waves-light d-flex align-items-center justify-content-end gap-2" type="submit" disabled={loading}>
                          {loading && <Spinner />}
                          Reset
                        </button>
                      </div>

                    </form>
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

export default ForgotPassword;
