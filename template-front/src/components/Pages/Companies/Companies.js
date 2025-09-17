import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../utils/helpers/helper";
import { hasPermission } from "../../../utils/helpers/permissionCheck";
import { getToken, getUserInfo, setItem } from "../../../utils/localStorageHelper";
import { CONSTANT } from "../../../utils/constant";
import Spinner from "../../Spinner/Spinner";
import { handleDelete } from "../../../utils/api/deleteHelper";
import { io } from "socket.io-client";
import Title from "../Title";

const { API_URL, SOCKET_URL } = config;

const Companies = ({ title }) => {
  const [data, setData] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
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

  const fetchCompanies = async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    let fallbackTimer;

    socket.on('connect', () => {
      const storedUser = getUserInfo();

      if (storedUser?.id) {
        socket.emit('user-connected', storedUser.id);
        socket.emit('get-all-companies', storedUser.id);

        fallbackTimer = setTimeout(() => {
          console.warn('⚠️ Company socket timeout. Falling back to API...');
          fetchCompanies();
        }, 3000);
      }
    });

    socket.on('all-companies', (data) => {
      clearTimeout(fallbackTimer);
      setData(data.companies);
      setLoading(false);
    });

    return () => {
      socket.off('all-companies');
      socket.disconnect();
    };
  }, []);

  const handleViewCompany = (row) => {
    setItem("company_profile_data", row._id);
    navigate("/company-profile");
  };

  const handleViewCompanyEmployee = (row) => {
    setItem("company_employee_data", row._id);
    navigate("/company-employees");
  };

  const handleViewPermissions = (row) => {
    setItem("manage_permissions_data", { id: row._id, cat: "cmp" });
    navigate("/manage-permissions");
  };

  const handleDeleteCompany = (row) => {
    handleDelete(`${API_URL}/companies`, row._id, fetchCompanies);
  };

  const handleCloseModal = () => {
    setShowPermissionsModal(false);
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
      name: "Plan",
      selector: (row) => row.plan.name,
      sortable: true,
    },
    {
      name: "Company Status",
      selector: (row) => row.companyStatus,
      sortable: true,
    },
  ];

  if (hasPermission('view_company') || hasPermission('view_company_employee')) {
    const actionButtonsCount = [
      hasPermission('view_company'),
      hasPermission('view_company_employee'),
    ].filter(Boolean).length;

    const dynamicWidth = actionButtonsCount === 1 ? 180 : actionButtonsCount * 80;

    columns.push({
      name: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", padding: "10px" }}>
          {hasPermission("view_company") && (
            <button className="btn btn-info bg-gradient btn-sm" onClick={() => handleViewCompany(row)} style={{ marginBottom: "5px" }}>
              <FaEye /> View Company
            </button>
          )}
          <button className="btn btn-primary bg-gradient btn-sm" onClick={() => handleViewPermissions(row)} style={{ marginBottom: "5px" }}>
            <FaEye /> Permissions
          </button>
          {hasPermission("view_company_employee") && (
            <button className="btn btn-secondary bg-gradient btn-sm" onClick={() => handleViewCompanyEmployee(row)}>
              <FaEye /> View Employee
            </button>
          )}
          <button className="btn btn-danger bg-gradient btn-sm" onClick={() => handleDeleteCompany(row)} style={{ marginBottom: "5px" }}>
            <FaEye /> Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: `${dynamicWidth}px`,
    })
  }

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Companies</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {errors.general && <div className="alert alert-danger">{errors.general}</div>}
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
                  noDataComponent={CONSTANT.COMPANIES.NO_COMPANIES_FOUND}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showPermissionsModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h2>Permissions for {selectedCompany?.name}</h2>
            <ul>
              {permissions.map((permission, index) => (
                <li key={index}>{permission}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Companies;
