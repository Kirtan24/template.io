import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../utils/helpers/helper";
import axios from "axios";
import { getToken, getUserInfo } from "../../../utils/localStorageHelper";
import { handleError } from "../../../utils/errorHandling/errorHandler";
import { notify } from "../../../utils/notifications/ToastNotification";
import { CONSTANT } from "../../../utils/constant";
import Spinner from "../../Spinner/Spinner";
import Title from "../Title";

const { API_URL } = config;

const AddUser = ({ title }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const fetchUserPermissions = async () => {
    const token = fetchToken();
    const compnayId = getUserInfo()?.companyId;

    if (!token || !compnayId) {
      setErrors({
        general: !token
          ? "Authentication required. Please log in."
          : "Company ID not found. Please log in again.",
      });
      return;
    }

    try {
      const userResponse = await axios.get(
        `${API_URL}/permissions/company/${compnayId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPermissions(userResponse.data.permissions);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach((key) => (newErrors[key] = ""));

    if (!name.trim()) {
      newErrors.name = "Name is required!";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required!";
      isValid = false;
      // } else if (!validateEmail(email)) {
      //   newErrors.email = "Please enter a valid email address!";
      //   isValid = false;
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = "At least one permission must be selected!";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) setLoading(false);
    return isValid;
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((perm) => perm !== permissionId)
        : [...prev, permissionId]
    );
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || "Others";
    if (!acc[category]) acc[category] = [];
    acc[category].push(permission);
    return acc;
  }, {});

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) return;

    try {
      const token = fetchToken();
      if (!token) return;

      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      selectedPermissions.forEach((perm) =>
        formData.append("permissions[]", perm)
      );

      const response = await axios.post(`${API_URL}/user`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setLoading(false);
      if (response.status === 201) {
        const { status, message } = response.data;
        notify(message, status);
        navigate("/user");
      }
    } catch (error) {
      setLoading(false);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail("");
    setName("");
    navigate("/user");
  };

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Add Employee</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSave}>
                {errors.general && (
                  <div className="text-danger mb-2">{errors.general}</div>
                )}
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="name" className="col-form-label">
                      Employee Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && (
                      <div className="text-danger">{errors.name}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="col-form-label">
                      Employee Email
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (
                      <div className="text-danger">{errors.email}</div>
                    )}
                  </div>
                </div>

                <div className="row my-4">
                  {Object.keys(groupedPermissions).map((category, index) => {
                    const categoryPermissions = groupedPermissions[category];
                    const allSelected = categoryPermissions.every((perm) =>
                      selectedPermissions.includes(perm._id)
                    );

                    const handleCheckAllChange = (e) => {
                      const checked = e.target.checked;
                      const categoryIds = categoryPermissions.map(
                        (perm) => perm._id
                      );

                      setSelectedPermissions((prev) =>
                        checked
                          ? [...new Set([...prev, ...categoryIds])]
                          : prev.filter((id) => !categoryIds.includes(id))
                      );
                    };

                    return (
                      <div key={category} className="col-12">
                        <div className="d-flex align-items-center mb-2">
                          <label className="mb-0 me-2">
                            {category} Permissions
                          </label>
                          <input
                            type="checkbox"
                            className="form-check-input mb-1"
                            id={`checkAll-${category}`}
                            checked={allSelected}
                            onChange={handleCheckAllChange}
                          />
                        </div>

                        <div className="row">
                          {categoryPermissions.map((permission) => (
                            <div className="col-md-4" key={permission._id}>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={permission._id}
                                  checked={selectedPermissions.includes(
                                    permission._id
                                  )}
                                  onChange={() =>
                                    handlePermissionChange(permission._id)
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={permission._id}
                                >
                                  {permission.display_name}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>

                        {index !==
                          Object.keys(groupedPermissions).length - 1 && (
                            <div className="dropdown-divider mt-3"></div>
                          )}
                      </div>
                    );
                  })}
                  {errors.permissions && (
                    <div className="text-danger mt-3">{errors.permissions}</div>
                  )}
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <button type="button" className="btn btn-secondary w-md mx-2" onClick={handleCancel} disabled={loading}>Cancel</button>
                  <button type="submit" className="btn btn-success d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                    {loading && <Spinner />}
                    Save User
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUser;
