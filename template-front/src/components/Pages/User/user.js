import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaTrash, FaKey } from "react-icons/fa";
import { getToken, getUserInfo, setItem } from "../../../utils/localStorageHelper";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../utils/helpers/helper";
import { hasPermission } from "../../../utils/helpers/permissionCheck";
import { CONSTANT } from "../../../utils/constant";
import Spinner from "../../Spinner/Spinner";
import { io } from "socket.io-client";
import { handleDelete } from "../../../utils/api/deleteHelper";
import Title from "../Title";

const { API_URL, SOCKET_URL } = config;

const User = ({ title }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const fetchUsers = async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const userInfo = getUserInfo();

      if (!userInfo) {
        console.error("No user info found in localStorage");
        return;
      }

      const companyId = userInfo.companyId;

      let apiUrl = `${API_URL}/user`;

      if (companyId) {
        apiUrl = `${API_URL}/user?companyId=${companyId}`;
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let socket = io(SOCKET_URL);
    let fallbackTimer;

    socket.on('connect', () => {
      const storedUser = getUserInfo();

      if (storedUser?.id) {
        socket.emit('user-connected', storedUser.id);
        socket.emit('get-all-employee', { userId: storedUser.id, companyId: storedUser?.companyId });

        fallbackTimer = setTimeout(() => {
          console.warn("⚠️ Socket response timeout. Falling back to API...");
          fetchUsers();
        }, 1000);
      }
    });

    socket.on('all-employee', (data) => {
      clearTimeout(fallbackTimer);
      setData(data.users);
      setLoading(false);
    });

    return () => {
      socket.off('all-employee');
      socket.disconnect();
    };
  }, []);

  const handleDeleteUser = (id) => {
    handleDelete(`${API_URL}/user`, id, fetchUsers);
  };

  const handleUserPermissions = (row) => {
    setItem("manage_permissions_data", { id: row._id, cat: "u" });
    navigate(`/manage-permissions`);
  };
  
  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Company",
      selector: (row) => (row.companyId ? row.companyId.name : "Own Company"),
      sortable: true,
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
    },
  ];

  if (hasPermission('delete_users') || hasPermission('manage_permissions')) {
    const actionButtonsCount = [
      hasPermission('manage_permissions'),
      hasPermission('delete_users'),
    ].filter(Boolean).length;

    const dynamicWidth = actionButtonsCount * 80;

    columns.push({
      name: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {hasPermission('manage_permissions') && (
            <button className="btn btn-info btn-sm" onClick={() => handleUserPermissions(row)}>
              <FaKey />
            </button>
          )}
          {hasPermission('delete_users') && (
            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(row._id)}>
              <FaTrash />
            </button>
          )}
        </div>
      ),
      width: `${dynamicWidth}px`,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    });
  }

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Employee</h4>
            {hasPermission("create_users") && (
              <Link to="/add-user" className="btn btn-success">
                Add User
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
              )}
              {loading ? (
                <Spinner className="dark" />
              ) : (
                <DataTable
                  columns={columns}
                  data={data}
                  pagination
                  highlightOnHover
                  responsive
                  fixedHeader
                  defaultSortFieldId={0}
                  defaultSortAsc={false}
                  noDataComponent={CONSTANT.USER.NO_EMPLOYEE_FOUND}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default User;
