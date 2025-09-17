import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import config from '../../../utils/helpers/helper';
import { handleDelete } from '../../../utils/api/deleteHelper';
import { getToken } from '../../../utils/localStorageHelper';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
import { CONSTANT } from '../../../utils/constant';

const { API_URL } = config;

const Credentials = ({ title }) => {

  useEffect(() => {
  document.title = `${title} • ${CONSTANT.AUTH.APP_NAME}`;
}, [title]);
  
  const [credentials, setCredentials] = useState([]);

  const fetchCredentials = async () => {
    try {
      const token = getToken();
      
      const response = await axios.get(`${API_URL}/credentials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setCredentials(response.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const deleteCredential = async (id) => {
    handleDelete(`${API_URL}/credentials`, id, fetchCredentials);
  };

  const columns = [
    {
      name: 'Name',
      center: true,
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'Provider',
      center: true,
      selector: (row) => row.provider,
      sortable: true,
    },
    {
      name: 'Host',
      center: true,
      selector: (row) => row.host,
      sortable: true,
    },
    {
      name: 'Port',
      center: true,
      selector: (row) => row.port,
      sortable: true,
    },
    {
      name: 'Username',
      center: true,
      selector: (row) => row.username,
      sortable: true,
    },
  ];

  if (hasPermission('update_credentials') || hasPermission('delete_credentials')) {
    columns.push({
      name: 'Actions',
      center: true,
      cell: (row) => (
        <div>
          {hasPermission('update_credentials') && (
            <Link to={`/credentials/edit-credential/${row._id}`} className="btn btn-primary btn-sm mx-1">
              Edit
            </Link>
          )}
          {hasPermission('delete_credentials') && (
            <button
              onClick={() => deleteCredential(row._id)}
              className="btn btn-danger btn-sm mx-1"
            >
              <i className="bi bi-trash3"></i> Delete
            </button>
          )}
        </div>
      ),
      width: '250px',
    });
  }

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Credentials</h4>
            {hasPermission('create_credentials') && (
              <Link to="/credentials/add-credential" className="btn btn-success">Add New Credential</Link>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <DataTable
                columns={columns}
                data={credentials}
                pagination
                highlightOnHover
                responsive
                fixedHeader
                defaultSortField="name"
                defaultSortAsc={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Credentials;


