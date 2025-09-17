import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import { handleDelete } from '../../../utils/api/deleteHelper';
import { getToken, getUserInfo, setItem } from '../../../utils/localStorageHelper';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
import axios from 'axios';
import config from '../../../utils/helpers/helper';
import { notify } from '../../../utils/notifications/ToastNotification';
import { CONSTANT } from '../../../utils/constant';
import Spinner from '../../Spinner/Spinner';
import CardView from './components/CardView';
import { io } from 'socket.io-client';
import Title from '../Title';

const { API_URL, SOCKET_URL } = config;

const Template = ({ title }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [template, setTemplate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({
    id: false,
    name: true,
    description: true,
    isSignature: true,
    emailTemplate: false,
    filename: false,
    company: true,
    fields: false,
    actions: true,
  });
  const [isCardView, setIsCardView] = useState(true);
  const [sId, setSId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (hasPermission('change_status_template')) {
      setColumnVisibility((prevState) => ({
        ...prevState,
        isActive: true,
      }));
    } else {
      setColumnVisibility((prevState) => {
        const { isActive, ...rest } = prevState;
        return rest;
      });
    }
  }, []);

  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo?.role === 'admin') setIsCardView(false);
  }, []);

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

        socket.emit('get-all-templates', storedUser.id);

        fallbackTimer = setTimeout(() => {
          console.warn("⚠️ Socket response timeout. Falling back to API...");
          fetchTemplates();
        }, 3000);
      }
    });

    socket.on('all-templates', (data) => {
      clearTimeout(fallbackTimer);
      setTemplate(data.templates);
      setLoading(false);
    });

    return () => {
      socket.off('all-templates');
      socket.disconnect();
    };
  }, []);

  const fetchToken = useCallback(() => {
    const token = getToken();
    if (!token) setErrors({ general: CONSTANT.AUTH.AUTH_REQUIRED });
    return token;
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.post(`${API_URL}/templates`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setTemplate(response.data.data || []);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchToken]);

  const toggleIsActive = useCallback(async (templateId, currentStatus) => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.patch(`${API_URL}/templates/${templateId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        notify(response.data.message, response.data.status);
        fetchTemplates();
      }
    } catch (error) {
      handleError(error);
    }
  }, [fetchTemplates, fetchToken]);

  const sendTemplate = (id) => {
    setItem('send_template_id', id);
    navigate('/send-document-template');
  };

  const handleEdit = (id) => {
    setEdit(id)
    navigate('/edit-template');
  };

  const deleteTemplate = async (id) => {
    handleDelete(`${API_URL}/templates`, id, fetchTemplates);
  };

  const toggleView = () => setIsCardView((prev) => !prev);

  const handleColumnVisibilityChange = (column) => {
    setColumnVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const userInfo = getUserInfo();
  const userRole = userInfo?.role;
  const columns = [
    {
      name: 'Id',
      selector: row => row.id,
      sortable: true,
      visible: columnVisibility.id,
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      visible: columnVisibility.name,
    },
    {
      name: 'Description',
      selector: row => row.description ? <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{row.description}</div> : '-',
      sortable: true,
      visible: columnVisibility.description,
    },
    {
      name: 'Signature Required',
      selector: row => (row.isSignature ? '✅' : '❌'),
      sortable: true,
      visible: columnVisibility.isSignature,
    },
    {
      name: 'Email Template',
      selector: row => row.emailTemplate ? <div style={{ maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-word' }}>{row.emailTemplate.template_name}</div> : 'No Template',
      sortable: true,
      visible: columnVisibility.emailTemplate,
    },
    {
      name: 'File Name',
      selector: row => (row.filename ? row.filename : '-'),
      sortable: true,
      width: '230px',
      visible: columnVisibility.filename,
    },
    {
      name: 'Company',
      selector: row => row.companyId ? row.companyId.name : 'By Admin',
      sortable: true,
      visible: columnVisibility.company,
    },
    {
      name: 'Active',
      selector: row => (
        <>
          {(!hasPermission('change_status_template') || userInfo.role !== 'admin') && userInfo.companyId !== row.companyId?.id ? (
            <span className="text-danger">Unauthorized</span>
          ) : (
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={row.isActive}
                onChange={() => toggleIsActive(row._id, row.isActive)}
              />
            </div>
          )}
        </>
      ),
      sortable: true,
      width: '120px',
      visible: hasPermission('change_status_template') && columnVisibility.isActive,
    },
    {
      name: 'Fields',
      selector: row => (row.fields ? <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(row.fields)}</div> : 'No'),
      sortable: true,
      width: '550px',
      visible: columnVisibility.fields,
    },
  ];

  const setEdit = (id) => setItem('edit_template_id', id);

  if (hasPermission('update_templates') || hasPermission('delete_templates') || hasPermission('send_templates')) {
    const actionButtonsCount = [
      hasPermission('update_templates'),
      hasPermission('send_templates'),
      hasPermission('delete_templates'),
    ].filter(Boolean).length;

    const dynamicWidth = actionButtonsCount === 1 ? 180 : actionButtonsCount * 80;

    columns.push({
      name: 'Actions',
      cell: (row) => {

        const canEditOrDelete = userInfo.companyId !== row.companyId?.id;

        return (
          <>
            {/* Edit */}
            {hasPermission('update_templates') && userRole === 'admin' && (
              <Link to="/edit-template" onClick={() => setEdit(row._id)} className="btn btn-primary btn-sm mx-1">Edit</Link>
            )}

            {hasPermission('update_templates') && !canEditOrDelete && userRole !== 'admin' && (
              <Link to="/edit-template" onClick={() => setEdit(row._id)} className="btn btn-primary btn-sm mx-1">
                Edit
              </Link>
            )}


            {/* Send */}
            {hasPermission('send_templates') && (
              <button className="btn btn-secondary btn-sm mx-1" onClick={() => sendTemplate(row._id)}>Send</button>
            )}


            {/* Delete */}
            {hasPermission('delete_templates') && !canEditOrDelete && userRole !== 'admin' && (
              <button className="btn btn-danger btn-sm mx-1">
                Delete
              </button>
            )}

            {hasPermission('delete_templates') && userRole === 'admin' && (
              <button
                onClick={() => deleteTemplate(row._id)}
                className="btn btn-danger btn-sm mx-1"
                disabled={deleteLoading[row._id]}
              >
                {deleteLoading[row._id] ? <Spinner /> : 'Delete'}
              </button>
            )}

          </>
        );
      },
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
            <h4 className="mb-sm-0 font-size-18">Templates</h4>
            {hasPermission('create_templates') && (
              <Link to="/add-template" className="btn btn-success">Add Template</Link>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">

              {template.length > 0 && (
                <div className="row justify-content-between mb-3">
                  <div className="col-12 d-flex justify-content-between flex-row-reverse mt-2">
                    <div className="d-flex">
                      {!isCardView && (
                        <button
                          type="button"
                          className="btn shadow-none waves-effect waves-light dropdown-toggle"
                          data-bs-toggle="dropdown"
                        >
                          <i className="mdi mdi-chevron-left"></i> Columns
                        </button>
                      )}
                      {!isCardView && (
                        <div className="dropdown-menu">
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
                      )}
                    </div>

                    <div className="btn-group d-flex justify-content-end">
                      <button
                        className={`btn shadow-none ${!isCardView ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={toggleView}
                      >
                        <i className={`mdi ${!isCardView ? 'mdi-grid' : 'mdi-grid-off'}`}></i>
                      </button>
                      <button
                        className={`btn shadow-none ${isCardView ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={toggleView}
                      >
                        <i className={`mdi ${isCardView ? 'mdi-view-grid' : 'mdi-view-grid-outline'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {errors.general && <div className="alert alert-danger">{errors.general}</div>}

              {loading ? (
                <Spinner className="dark" />
              ) : (
                <>
                  {isCardView ? (
                    <div className="row">
                      {template.map((item) => (
                        <CardView
                          key={item.id}
                          item={item}
                          handleEdit={handleEdit}
                          handleDelete={handleDelete}
                          toggleIsActive={toggleIsActive}
                          sendTemplate={sendTemplate}
                          activeDropdown={activeDropdown}
                          setActiveDropdown={setActiveDropdown}
                        />
                      ))}
                    </div>
                  ) : (
                    <DataTable
                      columns={columns.filter((column) => column.visible)}
                      data={template}
                      pagination
                      highlightOnHover
                      responsive
                      fixedHeader
                      defaultSortField="name"
                      defaultSortAsc={false}
                      noDataComponent={CONSTANT.TEMPLATE.NO_TEMPLATE_FOUND}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Template;
