import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import config from '../../../utils/helpers/helper';
import { handleDelete } from '../../../utils/api/deleteHelper';
import { getToken, setItem } from '../../../utils/localStorageHelper';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
import { CONSTANT } from '../../../utils/constant';
import Spinner from '../../Spinner/Spinner';
import Title from '../Title';

const { API_URL } = config;

const Plans = ({ title }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    price: true,
    period: true,
    features: false,
    actions: true,
    popular: true,
    description: true,
    activeDashboard: true,
  });

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const fetchPlans = async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setPlans(response.data || []);
        setLoading(false);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleColumnVisibilityChange = (column) => {
    setColumnVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const columns = [
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      visible: columnVisibility.name,
    },
    {
      name: 'Price',
      selector: (row) => row.price,
      sortable: true,
      visible: columnVisibility.price,
    },
    {
      name: 'Period',
      selector: (row) => row.period,
      sortable: true,
      visible: columnVisibility.period,
    },
    {
      name: 'Popular',
      selector: (row) => row.popular,
      sortable: true,
      visible: columnVisibility.populare,
    },
    {
      name: 'Description',
      selector: (row) => row.description,
      sortable: true,
      visible: columnVisibility.description,
    },
    {
      name: 'Active Dashboard',
      selector: (row) => row.activeDashboard === -1 ? "Infinity" : row.activeDashboard,
      sortable: true,
      visible: columnVisibility.activeDashboard,
    },
    {
      name: 'Features',
      selector: (row) =>
        row.features?.length > 0
          ? row.features.map((feature, idx) => (
            <div key={idx}>
              {feature.included ? '✔️' : '❌'} {feature.text}
            </div>
          ))
          : 'N/A',
      visible: columnVisibility.features,
    },
  ];

  const setEdit = (id) => setItem('edit_plan_id', id);

  if (hasPermission('only_admin')) {
    const actionButtonsCount = [
      hasPermission('only_admin'),
    ].filter(Boolean).length;

    const dynamicWidth = actionButtonsCount * 130;

    columns.push({
      name: 'Actions',
      cell: (row) => (
        <>
          {hasPermission('only_admin') && (
            <Link to={`/edit-plan`} onClick={() => setEdit(row._id)} className="btn btn-primary btn-sm mx-1">Edit</Link>
          )}
        </>
      ),
      width: `${dynamicWidth}px`,
      visible: columnVisibility.actions,
    });
  }

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Plans</h4>
            {hasPermission('create_plans') && (
              <Link to="/plans/create" className="btn btn-success">Add Plan</Link>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">

              {plans.length > 0 && (
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
                                onChange={() => handleColumnVisibilityChange(column)}
                              />
                              <label className="form-check-label" htmlFor={`column-visibility-${column}`}>
                                {column.replace(/([A-Z])/g, ' $1').toUpperCase()}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.general && <div className="alert alert-danger">{errors.general}</div>}

              {loading ? (
                <Spinner className="dark" />
              ) : (
                <DataTable
                  columns={columns.filter((col) => col.visible)}
                  data={plans}
                  pagination
                  highlightOnHover
                  responsive
                  fixedHeader
                  defaultSortField="name"
                  defaultSortAsc={true}
                  noDataComponent="No Plans Found"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Plans;
