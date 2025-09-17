import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import config from '../../../utils/helpers/helper';
import { handleDelete } from '../../../utils/api/deleteHelper';
import { getItem, getToken } from '../../../utils/localStorageHelper';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
import { CONSTANT } from '../../../utils/constant';
import Spinner from '../../Spinner/Spinner';
import Title from '../Title';

const { API_URL } = config;

const ViewEmployee = ({ title }) => {
  const navigate = useNavigate();
  const id = getItem('company_employee_data');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const fetchEmployees = async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/companies/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [id]);

  const deleteEmployee = async (id) => {
    handleDelete(`${API_URL}/employees`, id, fetchEmployees);
  };

  const columns = [
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: 'Role',
      selector: (row) => row.role,
      sortable: true,
    },
  ];

  if (hasPermission('update_employee') || hasPermission('delete_employee')) {
    const actionButtonsCount = [
      hasPermission('update_employee'),
      hasPermission('delete_employee'),
    ].filter(Boolean).length;

    const dynamicWidth = actionButtonsCount === 1 ? 180 : actionButtonsCount * 80;

    columns.push({
      name: 'Actions',
      cell: (row) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {hasPermission('update_employee') && (
            <Link to={`/employees/edit-employee/${row._id}`} className="btn btn-primary btn-sm mx-1">
              Edit
            </Link>
          )}
          {hasPermission('delete_employee') && (
            <button
              onClick={() => deleteEmployee(row._id)}
              className="btn btn-danger btn-sm mx-1"
            >
              <i className="bi bi-trash3"></i> Delete
            </button>
          )}
        </div>
      ),
      width: `${dynamicWidth}px`,
    });
  }

  const handleCancel = () => {
    navigate('/companies');
  };

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Employees</h4>
            {hasPermission('create_employee') && (
              <Link to={`/employees/add-employee/${id}`} className="btn btn-success">
                Add New Employee
              </Link>
            )}
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
                <>
                  <DataTable
                    columns={columns}
                    data={employees}
                    pagination
                    highlightOnHover
                    responsive
                    fixedHeader
                    defaultSortField="name"
                    defaultSortAsc={false}
                    noDataComponent={CONSTANT.USER.NO_EMPLOYEE_FOUND}
                  />
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      type="button"
                      className="btn btn-secondary w-md"
                      onClick={handleCancel}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewEmployee;
