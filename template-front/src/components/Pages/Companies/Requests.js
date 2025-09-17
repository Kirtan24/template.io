import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../../utils/helpers/helper";
import { getToken } from "../../../utils/localStorageHelper";
import { handleError } from "../../../utils/errorHandling/errorHandler";
import { notify } from "../../../utils/notifications/ToastNotification";
import Title from "../Title";
import Spinner from "../../Spinner/Spinner";
import { CONSTANT } from "../../../utils/constant";
import DataTable from "react-data-table-component";

const { API_URL } = config;

const Requests = ({ title }) => {
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    email: true,
    contactNumber: true,
    address: false,
    plan: true,
    companyStatus: true,
    createdAt: false,
    updatedAt: false,
    actions: true,
  });

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      handleError("Authentication Required", "error");
    }
    return token;
  };

  const fetchPendingCompanies = async () => {
    try {
      const token = fetchToken();
      if (!token) return;
      const response = await axios.get(`${API_URL}/companies/count`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error("Error fetching pending companies:", error);
      handleError("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (companyId) => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.patch(`${API_URL}/companies/approve/${companyId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        notify(response.data.message, response.data.status);
        fetchPendingCompanies();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleReject = async (companyId) => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.patch(`${API_URL}/companies/reject/${companyId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        notify(response.data.message, response.data.status);
        fetchPendingCompanies();
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const handleColumnVisibilityChange = (column) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  function formatDate(date) {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      omit: !columnVisibility.name,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      omit: !columnVisibility.email,
    },
    {
      name: "Contact Number",
      selector: (row) => row.contactNumber,
      sortable: true,
      omit: !columnVisibility.contactNumber,
    },
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
      omit: !columnVisibility.address,
    },
    {
      name: "Plan",
      selector: (row) => row.plan.name,
      sortable: true,
      omit: !columnVisibility.plan,
    },
    {
      name: "Status",
      selector: (row) => row.companyStatus,
      sortable: true,
      omit: !columnVisibility.companyStatus,
    },
    {
      name: "Created At",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
      omit: !columnVisibility.createdAt,
    },
    {
      name: "Last Updated",
      selector: (row) =>
        row.updatedAt ? formatDate(row.updatedAt) : "No updates",
      sortable: true,
      omit: !columnVisibility.updatedAt,
    },    
    {
      name: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-success btn-sm"
            onClick={() => handleApprove(row._id)}
          >
            Approve
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleReject(row._id)}
          >
            Reject
          </button>
        </div>
      ),
      omit: !columnVisibility.actions,
    },
  ];

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Pending Requests</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {companies.length > 0 && (
                <div className="row justify-content-between mb-3">
                  <div className="col-12 d-flex justify-content-end mt-2">
                    <div className="dropdown">
                      <button
                        type="button"
                        className="btn shadow-none waves-effect waves-light dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="mdi mdi-chevron-left"></i> Columns
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        {Object.keys(columnVisibility).map((column) => (
                          <div className="dropdown-item" key={column}>
                            <div className="form-check">
                              <input
                                id={`column-visibility-${column}`}
                                type="checkbox"
                                className="form-check-input"
                                checked={columnVisibility[column]}
                                onChange={() =>
                                  handleColumnVisibilityChange(column)
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`column-visibility-${column}`}
                              >
                                {column
                                  .replace(/([A-Z])/g, " $1")
                                  .toUpperCase()}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
              )}

              {loading ? (
                <div className="text-center btn-load">
                  <Spinner className="dark" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={companies}
                  pagination
                  highlightOnHover
                  responsive
                  fixedHeader
                  defaultSortField="name"
                  defaultSortAsc={false}
                  noDataComponent={CONSTANT.COMPANIES.NO_PENDING_REQUEST}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Requests;
