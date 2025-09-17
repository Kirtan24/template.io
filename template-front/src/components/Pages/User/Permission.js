import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getUserInfo, getToken } from "../../../utils/localStorageHelper";
import { handleError } from "../../../utils/errorHandling/errorHandler";
import { notify } from "../../../utils/notifications/ToastNotification";
import config from "../../../utils/helpers/helper";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { CONSTANT } from "../../../utils/constant";
import Spinner from "../../Spinner/Spinner";
import io from "socket.io-client";
import Title from "../Title";

const { API_URL, SOCKET_URL } = config;

const Permission = ({ title }) => {
  const searchInputRef = useRef(null);
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [errors, setErrors] = useState({});
  const [newPermission, setNewPermission] = useState({
    name: "",
    display_name: "",
    category: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPermissionId, setEditingPermissionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sId, setSId] = useState('');

  useEffect(() => {
    setFilteredPermissions([...permissions]);
  }, [permissions]);

  const fetchPermissions = async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.post(`${API_URL}/permissions/all`, { operation: 'read' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermissions(response.data.permissions);
      setFilteredPermissions(response.data.permissions);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Socket
  useEffect(() => {
    let socket = io(SOCKET_URL);
    let fallbackTimer;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setSId(socket.id);

      const storedUser = getUserInfo();
      console.log("🟡 Retrieved userInfo:", storedUser);

      if (storedUser?.id) {
        socket.emit('user-connected', storedUser.id);

        socket.emit('get-all-permissions', storedUser.id);

        fallbackTimer = setTimeout(() => {
          console.warn("⚠️ Socket response timeout. Falling back to API...");
          fetchPermissions();
        }, 3000);
      }
    });

    socket.on('all-permissions', (data) => {
      clearTimeout(fallbackTimer);
      setPermissions(data.permissions);
      setFilteredPermissions(data.permissions);
      setLoading(false);
    });

    socket.on('permission-added', (data) => {
      console.log("🆕 New Permission Received:", data.permission);
      setPermissions((prevPermissions) => {
        const isDuplicate = prevPermissions.some(
          (perm) => perm._id === data.permission._id
        );

        if (!isDuplicate) {
          return [...prevPermissions, data.permission].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
          );
        }

        return prevPermissions;
      });

      if (data.socketId !== socket.id)
        notify(`New permission added: ${data.permission.name}`, "info");
    });

    socket.on('permission-edited', (data) => {
      console.log("✏️ Permission Updated:", data.updatedPermission);
      setPermissions((prev) =>
        prev.map((perm) =>
          perm._id === data.updatedPermission._id ? data.updatedPermission : perm
        )
      );

      if (data.socketId !== socket.id)
        notify(`Permission updated: ${data.updatedPermission.name}`, "info");
    });

    socket.on('permission-deleted', (data) => {
      console.log("❌ Permission Deleted:", data.deletedPermission);
      setPermissions((prev) =>
        prev.filter((perm) => perm._id !== data.deletedPermission)
      );

      if (data.socketId !== socket.id)
        notify("Permission deleted", "info");
    });

    return () => {
      socket.off('all-permissions');
      socket.off('permission-added');
      socket.off('permission-edited');
      socket.off('permission-deleted');
      socket.disconnect();
    };
  }, []);

  const handleAddPermission = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const token = fetchToken();
    if (!token) return;

    try {
      const response = await axios.post(`${API_URL}/permissions/all`, {
        ...newPermission,
        operation: 'create',
        socketId: sId,
      }, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (response.data.status === "success") {
        notify(response.data.message, response.data.status);
        setShowAddForm(false);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdatePermission = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const token = fetchToken();
    if (!token) return;

    try {
      const response = await axios.post(`${API_URL}/permissions/all`, { ...newPermission, socketId: sId, operation: 'update', id: editingPermissionId }, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.data.status === "success") {
        notify(response.data.message, response.data.status);

        setNewPermission({ name: "", display_name: "", category: "" });
        setEditingPermissionId(null);
        setShowAddForm(false);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (permissionId) => {
    const token = fetchToken();
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(`${API_URL}/permissions/all`, { operation: 'delete', socketId: sId, id: permissionId }, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            const { status, message } = response.data;
            notify(message, status);
          })
          .catch((error) => {
            const errorMsg = error.response?.data?.message || 'An error occurred';
            notify(`Error: ${errorMsg}`, 'error');
          });
      }
    });
  };

  const handleEdit = (permissionId) => {
    const permissionToEdit = permissions.find((perm) => perm._id === permissionId);
    setNewPermission({
      name: permissionToEdit.name,
      display_name: permissionToEdit.display_name,
      category: permissionToEdit.category,
    });
    setEditingPermissionId(permissionId);
    setShowAddForm(true);
  };

  const handleAddButton = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      setNewPermission({
        name: "",
        display_name: "",
        category: "",
      });
    }
  };

  const handleCancelButton = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      setNewPermission({
        name: "",
        display_name: "",
        category: "",
      });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredPermissions(permissions);
    } else {
      const filteredData = permissions.filter((permission) =>
        permission.name.toLowerCase().includes(query) ||
        permission.display_name.toLowerCase().includes(query) ||
        permission.category.toLowerCase().includes(query)
      );
      setFilteredPermissions(filteredData);
    }
  };

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const columns = [
    {
      name: 'Actions',
      center: true,
      selector: row => (
        <div className="d-flex">
          <button className="btn btn-info btn-sm" onClick={() => handleEdit(row._id)}>Edit</button>
          <button className="btn btn-danger btn-sm mx-2" onClick={() => handleDelete(row._id)}>Delete</button>
        </div>
      ),
      sortable: false,
      width: '150px',
    },
    {
      name: 'Name',
      center: true,
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Display Name',
      center: true,
      selector: row => row.display_name,
      sortable: true,
    },
    {
      name: 'Category',
      center: true,
      selector: row => row.category,
      sortable: true,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
    setNewPermission((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { name, display_name, category } = newPermission;
    let formErrors = {};
    if (!name) formErrors.name = "Name is required.";
    if (!display_name) formErrors.display_name = "Display Name is required.";
    if (!category) formErrors.category = "Category is required.";
    return formErrors;
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "/") {
        event.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <Title title={title} />
      {showAddForm && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row d-flex mb-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="Name"
                      value={newPermission.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && <div className="text-danger">{errors.name}</div>}
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      name="display_name"
                      placeholder="Display Name"
                      value={newPermission.display_name}
                      onChange={handleInputChange}
                    />
                    {errors.display_name && <div className="text-danger">{errors.display_name}</div>}
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      name="category"
                      placeholder="Category"
                      value={newPermission.category}
                      onChange={handleInputChange}
                    />
                    {errors.category && <div className="text-danger">{errors.category}</div>}
                  </div>
                </div>
                <button
                  className="btn btn-primary me-2"
                  onClick={editingPermissionId ? handleUpdatePermission : handleAddPermission}
                >
                  {editingPermissionId ? "Update Permission" : "Add Permission"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelButton}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row justify-content-between mb-3">
                <div className="col-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Permissions..."
                    value={searchQuery}
                    onChange={handleSearch}
                    ref={searchInputRef}
                  />
                </div>
                <div className="d-flex flex-row-reverse col-3">
                  <button className="btn btn-success" onClick={handleAddButton}>
                    {showAddForm ? "Cancel" : "Add Permission"}
                  </button>
                </div>
              </div>
              {errors.general && <div className="alert alert-danger">{errors.general}</div>}
              {loading ? (
                <Spinner className="dark" />
              ) : (
                <DataTable
                  key={permissions.length}
                  columns={columns}
                  data={filteredPermissions}
                  pagination
                  highlightOnHover
                  responsive
                  fixedHeader
                  noDataComponent={CONSTANT.PERMISSION.NO_PERMISSION_FOUND}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Permission;

// // import React, { useState, useEffect } from "react";
// // import axios from "axios";
// // import { getToken } from "../../../utils/localStorageHelper";
// // import { handleError } from "../../../utils/errorHandling/errorHandler";
// // import { notify } from "../../../utils/notifications/ToastNotification";
// // import config from "../../../utils/helpers/helper";
// // import DataTable from "react-data-table-component";
// // import Swal from "sweetalert2";
// // import { CONSTANT } from "../../../utils/constant";
// // import Spinner from "../Spinner/Spinner";

// // const { API_URL } = config;

// // const Permission = ({ title }) => {

// //   useEffect(() => {
// //   document.title = `${title} • ${CONSTANT.AUTH.APP_NAME}`;
// // }, [title]);

// //   const [permissions, setPermissions] = useState([]);
// //   const [filteredPermissions, setFilteredPermissions] = useState([]);
// //   const [errors, setErrors] = useState({});
// //   const [newPermission, setNewPermission] = useState({
// //     name: "",
// //     display_name: "",
// //     category: "",
// //   });
// //   const [showAddForm, setShowAddForm] = useState(false);
// //   const [editingPermissionId, setEditingPermissionId] = useState(null);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [loading, setLoading] = useState(true);

// //   const fetchToken = () => {
// //     const token = getToken();
// //     if (!token) {
// //       setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
// //     }
// //     return token;
// //   };

// //   const fetchPermissions = async () => {
// //     try {
// //       const token = fetchToken();
// //       if (!token) return;

// //       const response = await axios.post(`${API_URL}/permissions/all`, { operation: 'read' }, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       setPermissions(response.data.permissions);
// //       setFilteredPermissions(response.data.permissions);
// //     } catch (error) {
// //       handleError(error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchPermissions();
// //   }, []);

// //   const columns = [
// //     {
// //       name: 'Actions',
// //       center: true,
// //       selector: row => (
// //         <div className="d-flex">
// //           <button className="btn btn-info btn-sm" onClick={() => handleEdit(row._id)}>Edit</button>
// //           <button className="btn btn-danger btn-sm mx-2" onClick={() => handleDelete(row._id)}>Delete</button>
// //         </div>
// //       ),
// //       sortable: false,
// //       width: '150px',
// //     },
// //     {
// //       name: 'Name',
// //       center: true,
// //       selector: row => row.name,
// //       sortable: true,
// //     },
// //     {
// //       name: 'Display Name',
// //       center: true,
// //       selector: row => row.display_name,
// //       sortable: true,
// //     },
// //     {
// //       name: 'Category',
// //       center: true,
// //       selector: row => row.category,
// //       sortable: true,
// //     },
// //   ];

// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;
// //     if (errors[name]) {
// //       setErrors((prevErrors) => ({
// //         ...prevErrors,
// //         [name]: "",
// //       }));
// //     }
// //     setNewPermission((prevState) => ({
// //       ...prevState,
// //       [name]: value,
// //     }));
// //   };

// //   const validateForm = () => {
// //     const { name, display_name, category } = newPermission;
// //     let formErrors = {};
// //     if (!name) formErrors.name = "Name is required.";
// //     if (!display_name) formErrors.display_name = "Display Name is required.";
// //     if (!category) formErrors.category = "Category is required.";
// //     return formErrors;
// //   };

// //   const handleAddPermission = async () => {
// //     const validationErrors = validateForm();
// //     if (Object.keys(validationErrors).length > 0) {
// //       setErrors(validationErrors);
// //       return;
// //     }

// //     const token = fetchToken();
// //     if (!token) return;

// //     try {
// //       const response = await axios.post(`${API_URL}/permissions/all`, { ...newPermission, operation: 'create' }, {
// //         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
// //       });
// //       if (response.data.status === "success") {
// //         notify(response.data.message, response.data.status);
// //         setPermissions(response.data.permission);
// //         setFilteredPermissions(response.data.permission);  // // Update filtered permissions
// //         setNewPermission({ name: "", display_name: "", category: "" });
// //         setShowAddForm(false);
// //       }
// //     } catch (error) {
// //       handleError(error);
// //     }
// //   };

// //   const handleUpdatePermission = async () => {
// //     const validationErrors = validateForm();
// //     if (Object.keys(validationErrors).length > 0) {
// //       setErrors(validationErrors);
// //       return;
// //     }

// //     const token = fetchToken();
// //     if (!token) return;

// //     try {
// //       const response = await axios.post(`${API_URL}/permissions/all`, { ...newPermission, operation: 'update', id: editingPermissionId }, {
// //         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
// //       });
// //       if (response.data.status === "success") {
// //         notify(response.data.message, response.data.status);
// //         setPermissions(response.data.permission);
// //         setFilteredPermissions(response.data.permission);
// //         setNewPermission({ name: "", display_name: "", category: "" });
// //         setEditingPermissionId(null);
// //         setShowAddForm(false);
// //       }
// //     } catch (error) {
// //       handleError(error);
// //     }
// //   };

// //   const handleDelete = async (permissionId) => {
// //     const token = fetchToken();
// //     if (!token) return;

// //     Swal.fire({
// //       title: 'Are you sure?',
// //       text: "You won't be able to revert this!",
// //       icon: 'warning',
// //       showCancelButton: true,
// //       confirmButtonColor: '#3085d6',
// //       cancelButtonColor: '#d33',
// //       confirmButtonText: 'Yes, delete it!',
// //     }).then((result) => {
// //       if (result.isConfirmed) {
// //         axios
// //           .post(`${API_URL}/permissions/all`, { operation: 'delete', id: permissionId }, {
// //             headers: { Authorization: `Bearer ${token}` },
// //           })
// //           .then((response) => {
// //             const { status, message } = response.data;

// //             notify(message, status);

// //             if (status === 'success') {
// //               setPermissions(response.data.permission);
// //               setFilteredPermissions(response.data.permission);
// //             }
// //           })
// //           .catch((error) => {
// //             const errorMsg = error.response?.data?.message || 'An error occurred';
// //             notify(`Error: ${errorMsg}`, 'error');
// //           });
// //       }
// //     });
// //   };

// //   const handleEdit = (permissionId) => {
// //     const permissionToEdit = permissions.find((perm) => perm._id === permissionId);
// //     setNewPermission({
// //       name: permissionToEdit.name,
// //       display_name: permissionToEdit.display_name,
// //       category: permissionToEdit.category,
// //     });
// //     setEditingPermissionId(permissionId);
// //     setShowAddForm(true);
// //   };

// //   const handleAddButton = () => {
// //     setShowAddForm(!showAddForm);
// //     if (!showAddForm) {
// //       setNewPermission({
// //         name: "",
// //         display_name: "",
// //         category: "",
// //       });
// //     }
// //   };

// //   const handleCancelButton = () => {
// //     setShowAddForm(!showAddForm);
// //     if (!showAddForm) {
// //       setNewPermission({
// //         name: "",
// //         display_name: "",
// //         category: "",
// //       });
// //     }
// //   };

// //   const handleSearch = (e) => {
// //     const query = e.target.value.toLowerCase();
// //     setSearchQuery(query);

// //     if (query === "") {
// //       setFilteredPermissions(permissions);
// //     } else {
// //       const filteredData = permissions.filter((permission) =>
// //         permission.name.toLowerCase().includes(query) ||
// //         permission.display_name.toLowerCase().includes(query) ||
// //         permission.category.toLowerCase().includes(query)
// //       );
// //       setFilteredPermissions(filteredData);
// //     }
// //   };

// //   return (
// //     <>
// //       {showAddForm && (
// //         <div className="row mb-3">
// //           <div className="col-12">
// //             <div className="card">
// //               <div className="card-body">
// //                 <div className="row d-flex mb-3">
// //                   <div className="col-md-4">
// //                     <input
// //                       type="text"
// //                       className="form-control"
// //                       name="name"
// //                       placeholder="Name"
// //                       value={newPermission.name}
// //                       onChange={handleInputChange}
// //                     />
// //                     {errors.name && <div className="text-danger">{errors.name}</div>}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <input
// //                       type="text"
// //                       className="form-control"
// //                       name="display_name"
// //                       placeholder="Display Name"
// //                       value={newPermission.display_name}
// //                       onChange={handleInputChange}
// //                     />
// //                     {errors.display_name && <div className="text-danger">{errors.display_name}</div>}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <input
// //                       type="text"
// //                       className="form-control"
// //                       name="category"
// //                       placeholder="Category"
// //                       value={newPermission.category}
// //                       onChange={handleInputChange}
// //                     />
// //                     {errors.category && <div className="text-danger">{errors.category}</div>}
// //                   </div>
// //                 </div>
// //                 <button
// //                   className="btn btn-primary me-2"
// //                   onClick={editingPermissionId ? handleUpdatePermission : handleAddPermission}
// //                 >
// //                   {editingPermissionId ? "Update Permission" : "Add Permission"}
// //                 </button>
// //                 <button
// //                   className="btn btn-secondary"
// //                   onClick={handleCancelButton}
// //                 >
// //                   Close
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <div className="row">
// //         <div className="col-12">
// //           <div className="card">
// //             <div className="card-body">
// //               <div className="row justify-content-between mb-3">
// //                 <div className="col-3">
// //                   <input
// //                     type="text"
// //                     className="form-control"
// //                     placeholder="Search Permissions..."
// //                     value={searchQuery}
// //                     onChange={handleSearch}
// //                   />
// //                 </div>
// //                 <div className="d-flex flex-row-reverse col-3">
// //                   <button className="btn btn-success" onClick={handleAddButton}>
// //                     {showAddForm ? "Cancel" : "Add Permission"}
// //                   </button>
// //                 </div>
// //               </div>
// //               {errors.general && <div className="alert alert-danger">{errors.general}</div>}
// //               {loading ? (
// //                 <Spinner className="dark" />
// //               ) : (
// //                 <DataTable
// //                   columns={columns}
// //                   data={filteredPermissions}
// //                   pagination
// //                   highlightOnHover
// //                   responsive
// //                   fixedHeader
// //                   defaultSortField="name"
// //                   defaultSortAsc={false}
// //                   noDataComponent={CONSTANT.PERMISSION.NO_PERMISSION_FOUND}
// //                 />
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default Permission;
