import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../../utils/helpers/helper';
import { getItem, getToken } from '../../../utils/localStorageHelper';
import { CONSTANT } from '../../../utils/constant';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import { notify } from '../../../utils/notifications/ToastNotification';
import { FaTrash } from 'react-icons/fa';
import Spinner from '../../Spinner/Spinner';
import Title from '../Title';

const { API_URL } = config;

const EditPlan = ({ title }) => {
  const id = getItem('edit_plan_id');
  const navigate = useNavigate();
  
  const [entityName, setEntityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [permissions, setPermissions] = useState([]);
  const [plan, setPlan] = useState({
    features: []
  });

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const fetchAllPermissions = async () => {
    const token = fetchToken();
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermissions(response.data.permissions);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/plans/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const fetchedPlan = response.data;
        setPlan({
          ...plan,
          ...fetchedPlan,
          duration: fetchedPlan.period,
        });
        setEntityName(fetchedPlan.name);
      }
    } catch (error) {
      navigate('/plans');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
    fetchAllPermissions();
  }, [id]);

  const handleInputChange = (e) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleFeatureChange = (index, key, value) => {
    const updatedFeatures = [...plan.features];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [key]: key === 'included' ? value : value,
    };
    setPlan({ ...plan, features: updatedFeatures });
  };

  const addFeature = () => {
    setPlan({ ...plan, features: [...plan.features, { text: '', included: false }] });
  };

  const removeFeature = (index) => {
    const newFeatures = [...plan.features];
    newFeatures.splice(index, 1);
    setPlan({ ...plan, features: newFeatures });
  };

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();

    try {
      const token = fetchToken();
      if (!token) return;

      const formData = new FormData();

      // Append each field manually
      formData.append('planId', id);
      formData.append('name', plan.name);
      formData.append('price', plan.price);
      formData.append('duration', plan.duration);
      formData.append('activeDashboard', plan.activeDashboard);
      formData.append('buttonText', plan.buttonText);
      formData.append('description', plan.description);
      formData.append('popular', plan.popular);

      if (plan.features) {
        formData.append('features', JSON.stringify(plan.features));
      }

      // If permissions is an array
      if (Array.isArray(plan.permissions)) {
        formData.append('permissions', JSON.stringify(plan.permissions));
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(`${API_URL}/plans`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setLoading(false)
        notify(response.data.message, response.data.status);
        navigate('/plans');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false)
    }
  };

  const handlePermissionChange = (permissionId) => {
    setPlan((prevPlan) => {
      const hasPermission = prevPlan.permissions.includes(permissionId);
      const updatedPermissions = hasPermission
        ? prevPlan.permissions.filter((perm) => perm !== permissionId)
        : [...prevPlan.permissions, permissionId];

      return {
        ...prevPlan,
        permissions: updatedPermissions,
      };
    });
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || "Others";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  const handleCancel = () => {
    navigate('/plans');
  };

  return (
    <>
      <Title title={title} />
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">{entityName} - Edit Plan</h4>
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-body">

                <div className="basic-details">
                  <div className="row g-3 mb-3">

                    {/* Plan Name and Price with Duration */}
                    <div className="col-md-6">
                      <label className="form-label">Plan Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={plan.name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Price</label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="text"
                          className="form-control"
                          name="price"
                          value={plan.price}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Duration</label>
                      <select
                        className="form-select"
                        name="duration"
                        value={plan.duration}
                        onChange={handleInputChange}
                      >
                        <option value="per_month">Per Month</option>
                        <option value="per_year">Per Year</option>
                      </select>
                    </div>

                    {/* Dashboard and Button Text */}
                    <div className="col-md-6">
                      <label className="form-label">Active Dashboard</label>
                      <input
                        type="number"
                        className="form-control"
                        name="activeDashboard"
                        value={plan.activeDashboard}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Button Text</label>
                      <input
                        type="text"
                        className="form-control"
                        name="buttonText"
                        value={plan.buttonText}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Description full width */}
                    <div className="col-md-10">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        name="description"
                        value={plan.description}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Popular Toggle */}
                    <div className="col-md-2 mt-4">
                      <label className="form-label d-block">Popular</label>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="popularSwitch"
                        switch="info"
                        checked={plan.popular}
                        onChange={(e) => setPlan({ ...plan, popular: e.target.checked })}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="popularSwitch"
                        data-on-label="Yes"
                        data-off-label="No"
                      ></label>
                    </div>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="features mb-4">
                  <div className="d-flex justify-content-between align-items-center my-3">
                    <h5 className="mb-0">Features</h5>
                    <button type="button" className="btn btn-success" onClick={addFeature}>
                      Add Feature
                    </button>
                  </div>

                  {plan.features.map((feature, index) => (
                    <div className="row g-2 align-items-center mb-3" key={index}>

                      {/* Feature Text Input - takes most of the width */}
                      <div className="col-12 col-md-7">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Feature Text"
                          value={feature.text}
                          onChange={(e) => handleFeatureChange(index, 'text', e.target.value)}
                        />
                      </div>

                      {/* Included Checkbox */}
                      <div className="col-6 col-md-2 text-md-center d-flex justify-content-center align-items-center">
                        <div className="form-check m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={feature.included}
                            onChange={(e) => handleFeatureChange(index, 'included', e.target.checked)}
                            id={`featureIncluded${index}`}
                          />
                          <label
                            className="form-check-label ms-2 d-none d-md-inline"
                            htmlFor={`featureIncluded${index}`}
                          >
                            Included
                          </label>
                        </div>
                      </div>

                      {/* Trash/Delete Button */}
                      <div className="col-6 col-md-3 d-flex justify-content-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger w-75"
                          onClick={() => removeFeature(index)}
                        >
                          <FaTrash />
                          <span className="ms-1 d-none d-sm-inline">Remove</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                <div className="dropdown-divider"></div>

                <div className="permissions mb-4">
                  <div className="d-flex justify-content-between align-items-center my-3">
                    <h5 className="mb-0">Permissions</h5>
                  </div>

                  {Object.keys(groupedPermissions).map((category, index) => (
                    <div key={category} className="col-12">
                      <p className='font-weight-bold'>{category} Permissions</p>
                      <div className="row my-3">
                        {groupedPermissions[category].map((permission) => (
                          <div className="col-md-4" key={permission._id}>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={permission._id}
                                checked={plan.permissions.includes(permission._id)}
                                onChange={() => handlePermissionChange(permission._id)}
                              />
                              <label className="form-check-label" htmlFor={permission._id}>
                                {permission.display_name}
                              </label>

                            </div>
                          </div>
                        ))}
                      </div>
                      {index !== Object.keys(groupedPermissions).length - 1 && <div className="dropdown-divider"></div>}
                    </div>
                  ))}

                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button type="button" className="btn btn-secondary me-2" disabled={loading} onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                    {loading && <Spinner />}
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default EditPlan;
