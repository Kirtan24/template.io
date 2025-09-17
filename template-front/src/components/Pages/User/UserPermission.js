import React, { useState, useEffect, use } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { getItem, getToken } from "../../../utils/localStorageHelper";
import { handleError } from "../../../utils/errorHandling/errorHandler";
import { notify } from "../../../utils/notifications/ToastNotification";
import config from "../../../utils/helpers/helper";
import { CONSTANT } from "../../../utils/constant";
import Title from "../Title";

const { API_URL } = config;

const UserPermissions = ({ title }) => {
  const { id, cat } = getItem('manage_permissions_data');
  const [permissions, setPermissions] = useState([]);
  const [planPermissions, setPlanPermissions] = useState([]);
  const [companyPermissions, setCompanyPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [errors, setErrors] = useState({});
  const [entityName, setEntityName] = useState('');
  const navigate = useNavigate();

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

  const fetchCompanyPermissions = async () => {
    const token = fetchToken();
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/permissions/company/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanyPermissions(response.data.permissions);
      setPlanPermissions(response.data.planPermissions);
      setEntityName(response.data.user.name);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const fetchUserPermissions = async () => {
    const token = getToken();

    if (!token) {
      setErrors({ ...errors, general: "Authentication required. Please log in." });
      return;
    }

    const userId = id;

    try {
      const userResponse = await axios.get(`${API_URL}/permissions/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermissions(userResponse.data.compnayPermissions);
      setUserPermissions(userResponse.data.userPermissions);

      setEntityName(userResponse.data.user.name);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (!cat || !id) {
      console.log(cat, id)
      notify("Something went wrong", "error");
      setErrors({ general: "Invalid URL parameters" });
      navigate(-1);
    }

    if (cat === "cmp") {
      fetchCompanyPermissions();
      fetchAllPermissions();
    } else if (cat === "u") {
      fetchUserPermissions();
    }
  }, [cat, id]);

  const handlePermissionChange = (permissionId) => {
    if (cat === "cmp") {
      setCompanyPermissions((prevPermissions) =>
        prevPermissions.includes(permissionId)
          ? prevPermissions.filter((perm) => perm !== permissionId)
          : [...prevPermissions, permissionId]
      );
    } else if (cat === "u") {
      setUserPermissions((prevPermissions) =>
        prevPermissions.includes(permissionId)
          ? prevPermissions.filter((perm) => perm !== permissionId)
          : [...prevPermissions, permissionId]
      );
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || "Others";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  const handleSavePermissions = async () => {
    const token = fetchToken();
    if (!token) return;

    try {
      let per;
      if (cat === "cmp") {
        per = companyPermissions;
      } else if (cat === "u") {
        per = userPermissions;
      }
      const response = await axios.put(`${API_URL}/permissions/${id}`, { permissions: per, type: cat },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        const { status, message } = response.data;
        notify(message, status);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <Title title={title} />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>{entityName} - {cat === "cmp" ? "Company" : "User"} Permissions</h3>
      </div>

      {errors.general && <div className="alert alert-danger">{errors.general}</div>}

      <div className="card">
        <div className="card-body">
          {Object.keys(groupedPermissions).map((category, index) => (
            <div key={category} className="col-12">
              <h5>{category} Permissions</h5>
              <div className="row my-3">
                {groupedPermissions[category].map((permission) => (
                  <div className="col-md-4" key={permission._id}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={permission._id}
                        checked={
                          cat === "cmp"
                            ? companyPermissions.includes(permission._id)
                            : userPermissions.includes(permission._id)
                        }
                        onChange={() => handlePermissionChange(permission._id)}
                        disabled={cat === "cmp" && !planPermissions.includes(permission._id)}
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

        <div className="card-footer bg-white">
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-secondary w-md mx-2"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button className="btn btn-success" onClick={handleSavePermissions}>
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPermissions;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { getToken } from "../../../utils/localStorageHelper";
// import { handleError } from "../../../utils/errorHandling/errorHandler";
// import { notify } from "../../../utils/notifications/ToastNotification";
// import config from "../../../utils/helpers/helper";

// const { API_URL } = config;

// const UserPermissions = () => {
//   const [permissions, setPermissions] = useState([]); // All available permissions
//   const [userPermissions, setUserPermissions] = useState([]); // User's permissions (IDs)
//   const { id } = useParams();
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchPermissions = async () => {
//       const token = getToken();
//       if (!token) {
//         setErrors({ ...errors, general: "Authentication required. Please log in." });
//         return;
//       }
//       try {
//         const response = await axios.get(`${API_URL}/permissions`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log(response.data.permissions);
//         setPermissions(response.data.permissions);
//       } catch (error) {
//         handleError(error);
//       }
//     };

//     const fetchUserPermissions = async () => {
//       const token = getToken();
//       if (!token) {
//         setErrors({ ...errors, general: "Authentication required. Please log in." });
//         return;
//       }
//       try {
//         const response = await axios.get(`${API_URL}/permissions/user/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const pp = response.data.permissions.map(perm => perm._id);
//         console.log(pp)
//         setUserPermissions(pp);
//       } catch (error) {
//         handleError(error);
//       }
//     };

//     fetchPermissions();
//     fetchUserPermissions();

//     console.log(permissions)
//     console.log(userPermissions)
//   }, [id]);

//   const handlePermissionChange = (permissionId) => {
//     setUserPermissions((prevPermissions) =>
//       prevPermissions.includes(permissionId)
//         ? prevPermissions.filter((perm) => perm !== permissionId)
//         : [...prevPermissions, permissionId]
//     );
//   };

//   const groupedPermissions = permissions.reduce((acc, permission) => {
//     const category = permission.category || "Others";
//     if (!acc[category]) {
//       acc[category] = [];
//     }
//     acc[category].push(permission);
//     return acc;
//   }, {});

//   const handleSavePermissions = async () => {
//     const token = getToken();
//     if (!token) {
//       setErrors({ ...errors, general: "Authentication required. Please log in." });
//       return;
//     }
//     try {
//       const response = await axios.put(
//         `${API_URL}/permissions/${id}`,
//         { permissions: userPermissions }, // Send the permission IDs
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       if (response.data.status === "success") {
//         const { status, message } = response.data;
//         notify(message, status);
//       }
//     } catch (error) {
//       handleError(error);
//     }
//   };

//   return (
//     <div>
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h3>User Permissions</h3>
//       </div>

//       {errors.general && <div className="alert alert-danger">{errors.general}</div>}

//       <div className="card">
//         <div className="card-body">
//           {Object.keys(groupedPermissions).map((category, index) => (
//             <div key={category} className="col-12 mb-4">
//               <h5>{category} Permissions</h5>
//               <div className="row">
//                 {groupedPermissions[category].map((permission) => (
//                   <div className="col-md-4" key={permission._id}>
//                     <div className="form-check">
//                       <input
//                         className="form-check-input"
//                         type="checkbox"
//                         id={permission._id}
//                         checked={userPermissions.includes(permission._id)}
//                         onChange={() => handlePermissionChange(permission._id)} // Use ID here
//                       />
//                       <label className="form-check-label" htmlFor={permission._id}>
//                         {permission.display_name} {/* Display permission name */}
//                       </label>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               {index !== Object.keys(groupedPermissions).length - 1 && <hr />} {/* Don't add <hr> after last category */}
//             </div>
//           ))}
//         </div>


//         <div className="card-footer bg-white">
//           <div className="my-3">
//             <button className="btn btn-success" onClick={handleSavePermissions}>
//               Save Permissions
//             </button>
//             <button
//               className="btn btn-secondary w-md mx-2"
//               onClick={() => navigate(-1)} // Go back to the previous page
//             >
//               Back
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserPermissions;