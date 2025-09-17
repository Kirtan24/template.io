import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import config from '../../../utils/helpers/helper';
import { handleDelete } from '../../../utils/api/deleteHelper';
import { getToken, getUserInfo } from '../../../utils/localStorageHelper';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
import { CONSTANT } from '../../../utils/constant';
import Spinner from '../../Spinner/Spinner';
import { io } from 'socket.io-client';
import Title from '../Title';

const { API_URL, SOCKET_URL } = config;

const Inbox = ({ title }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({
    scheduledTime: true,
    senderEmail: true,
    recipientEmail: true,
    subject: false,
    body: false,
    emailTemplateId: false,
    documentTemplateId: false,
    documentLink: false,
    sentTimestamp: false,
    signedTimestamp: false,
    companyId: false,
    isSigned: false,
    isForSign: false,
    signingUserId: false,
    oneTimeToken: false,
    status: true,
    actions: true,
  });

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const fetchEmails = async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/inbox`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setEmails(response.data.mails);
        setLoading(false);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    let fallbackTimer;

    socket.on('connect', () => {
      const storedUser = getUserInfo();

      if (storedUser?.id) {
        socket.emit('user-connected', storedUser.id);
        socket.emit('get-all-inbox', storedUser.id);

        fallbackTimer = setTimeout(() => {
          console.warn('⚠️ Inbox socket timeout. Falling back to API...');
          fetchEmails();
        }, 3000);
      }
    });

    socket.on('all-inbox', (data) => {
      clearTimeout(fallbackTimer);
      setEmails(data.mails);
      setLoading(false);
    });

    return () => {
      socket.off('all-inbox');
      socket.disconnect();
    };
  }, []);


  const deleteEmail = async (id) => {
    handleDelete(`${API_URL}/inbox`, id, fetchEmails);
  };

  const handleColumnVisibilityChange = (column) => {
    setColumnVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const columns = [
    {
      name: 'Scheduled Time',
      selector: (row) => row.scheduledTime ? formatDate(row.scheduledTime) : 'N/A',
      sortable: true,
      visible: columnVisibility.scheduledTime
    },
    {
      name: 'Sender Email',
      selector: (row) => row.senderEmail || 'N/A',
      sortable: true,
      visible: columnVisibility.senderEmail
    },
    {
      name: 'Recipient Email',
      selector: (row) => row.recipientEmail || 'N/A',
      sortable: true,
      visible: columnVisibility.recipientEmail
    },
    {
      name: 'Subject',
      selector: (row) => row.subject || 'N/A',
      sortable: true,
      visible: columnVisibility.subject
    },
    {
      name: 'Body',
      selector: row => (row.body ? <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(row.body)}</div> : '-'),
      sortable: true,
      visible: columnVisibility.body
    },
    {
      name: 'Email Template',
      selector: (row) => row.emailTemplateId?.template_name || 'N/A',
      sortable: true,
      visible: columnVisibility.emailTemplateId
    },
    {
      name: 'Document Template',
      selector: (row) => row.documentTemplateId?.name || 'N/A',
      sortable: true,
      visible: columnVisibility.documentTemplateId
    },
    {
      name: 'Document Link',
      selector: (row) => row.documentLink || 'N/A',
      sortable: true,
      visible: columnVisibility.documentLink
    },
    {
      name: 'Sent Timestamp',
      selector: (row) => row.sentTimestamp ? formatDate(row.sentTimestamp) : 'N/A',
      sortable: true,
      visible: columnVisibility.sentTimestamp
    },
    {
      name: 'Signed Timestamp',
      selector: (row) => row.signedTimestamp ? formatDate(row.signedTimestamp) : 'N/A',
      sortable: true,
      visible: columnVisibility.signedTimestamp
    },
    {
      name: 'Company',
      selector: (row) => row.companyId?.name || 'By Admin',
      sortable: true,
      visible: columnVisibility.companyId
    },
    {
      name: 'Is Signed',
      selector: (row) => row.isSigned ? 'Yes' : 'No',
      sortable: true,
      visible: columnVisibility.isSigned
    },
    {
      name: 'Is For Sign',
      selector: (row) => row.isForSign ? 'Yes' : 'No',
      sortable: true,
      visible: columnVisibility.isForSign
    },
    {
      name: 'Signing User',
      selector: (row) => row.signingUserId?.name || 'N/A',
      sortable: true,
      visible: columnVisibility.signingUserId
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      visible: columnVisibility.status,
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <span className={
            row.status === 'failed' ? 'text-danger' :
              row.status === 'pending' ? 'text-warning' : 'text-success'
          }>
            {row.status}
          </span>
        </div>
      )
    },
    {
      name: 'One Time Token',
      selector: (row) => row.oneTimeToken || 'N/A',
      sortable: true,
      visible: columnVisibility.oneTimeToken
    }
  ];

  if (hasPermission('update_inbox') || hasPermission('delete_inbox')) {
    const actionButtonsCount = [
      hasPermission('update_inbox'),
      hasPermission('delete_inbox'),
    ].filter(Boolean).length;

    const dynamicWidth = actionButtonsCount === 1 ? 150 : actionButtonsCount * 80;

    columns.push({
      name: 'Actions',
      cell: (row) => (
        <>
          {hasPermission('update_inbox') && (
            <Link to={`/inbox/view/${row._id}`} className="btn btn-primary btn-sm mx-1">View</Link>
          )}
          {hasPermission('delete_inbox') && (
            <button onClick={() => deleteEmail(row._id)} className="btn btn-danger btn-sm mx-1">Delete</button>
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
            <h4 className="mb-sm-0 font-size-18">Inbox</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">

              {emails.length > 0 && (
                <div className="row justify-content-between mb-3">
                  <div className="col-12 d-flex justify-content-end mt-2">
                    <div className="dropdown">
                      <button
                        type="button"
                        className="btn shadow-none waves-effect waves-light dropdown-toggle"
                        data-bs-toggle="dropdown" aria-expanded="false">
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
                  data={emails}
                  pagination
                  highlightOnHover
                  responsive
                  fixedHeader
                  defaultSortField="sent_timestamp"
                  defaultSortAsc={false}
                  noDataComponent={CONSTANT.INBOX.NO_INBOX_FOUND}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Inbox;
