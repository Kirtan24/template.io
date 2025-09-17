import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import config from '../../../utils/helpers/helper';
import { handleDelete } from '../../../utils/api/deleteHelper';
import { getToken, getUserInfo, setItem } from '../../../utils/localStorageHelper';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
import { CONSTANT } from '../../../utils/constant';
import Spinner from '../../Spinner/Spinner';
import { io } from 'socket.io-client';
import Title from '../Title';

const { API_URL, SOCKET_URL } = config;

const EmailTemplate = ({ title }) => {
  const [emailTemplates, setEmailTemplates] = useState([]);
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

  const fetchEmailTemplates = async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/email-template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setEmailTemplates(response.data.emailTemplates);
      }
    } catch (error) {
      handleError(error);
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
        socket.emit('get-all-email-templates', storedUser.id);

        fallbackTimer = setTimeout(() => {
          console.warn('⚠️ Email template socket timeout. Falling back to API...');
          fetchEmailTemplates();
        }, 3000);
      }
    });

    socket.on('all-email-templates', (data) => {
      clearTimeout(fallbackTimer);
      setEmailTemplates(data.emailTemplates);
      setLoading(false);
    });

    return () => {
      socket.off('all-email-templates');
      socket.disconnect();
    };
  }, []);


  const deleteEmailTemplate = async (id) => {
    handleDelete(`${API_URL}/email-template`, id, fetchEmailTemplates);
  };

  const columns = [
    {
      name: 'Template Name',
      selector: (row) => row.template_name,
      sortable: true,
    },
    {
      name: 'Compnay',
      selector: (row) => row.companyId?.name ? row.companyId?.name : 'By Admin',
      sortable: true,
    },
    {
      name: 'Body',
      sortable: true,
      cell: (row) => <div style={{ maxHeight: '100px', overflowY: 'auto', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{row.body || 'N/A'}</div>,
    },
  ];

  const setEdit = (id) => setItem('edit_email_template_id', id);

  if (hasPermission('update_emailtemplate') || hasPermission('delete_emailtemplate') || hasPermission('send_templates')) {
    const actionButtonsCount = [
      hasPermission('update_emailtemplate'),
      hasPermission('send_templates'),
      hasPermission('delete_emailtemplate'),
    ].filter(Boolean).length;

    const dynamicWidth = actionButtonsCount === 1 ? 180 : actionButtonsCount * 80;

    columns.push({
      name: 'Actions',
      cell: (row) => (
        <>
          {hasPermission('update_emailtemplate') && (
            <Link to={'/edit-email-template'} onClick={() => setEdit(row._id)} className="btn btn-primary btn-sm mx-1">
              Edit
            </Link>
          )}
          {hasPermission('send_emailtemplate') && (
            <button
              className="btn btn-secondary btn-sm mx-1"
              onClick={() => navigate(`/template/send/${row._id}`)}
            >
              Send
            </button>
          )}
          {hasPermission('delete_emailtemplate') && (
            <button
              onClick={() => deleteEmailTemplate(row.id)}
              className="btn btn-danger btn-sm mx-1"
            >
              <i className="bi bi-trash3"></i> Delete
            </button>
          )}
        </>
      ),
      width: `${dynamicWidth}px`,
    });
  }

  return (
    <>
    <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Email Templates</h4>
            {hasPermission('create_emailtemplate') && (
              <Link to="/add-email-template" className="btn btn-success">
                Add Email Template
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
                <DataTable
                  columns={columns}
                  data={emailTemplates}
                  pagination
                  highlightOnHover
                  responsive
                  fixedHeader
                  defaultSortField="template_name"
                  defaultSortAsc={false}
                  noDataComponent={CONSTANT.EMAIL_TEMPLATE.NO_EMAIL_TEMPLATE_FOUND}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailTemplate;
