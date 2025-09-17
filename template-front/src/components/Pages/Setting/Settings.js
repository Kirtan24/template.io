import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { notify } from '../../../utils/notifications/ToastNotification';
import { getToken, getUserInfo } from '../../../utils/localStorageHelper';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import config from '../../../utils/helpers/helper';
import Title from '../Title';
const { API_URL } = config;

const Settings = ({ title }) => {
  const [permissions, setPermissions] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [backupFileName, setBackupFileName] = useState('front-backup');

  useEffect(() => {
    fetchModels();
  }, []);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
  }, []);

  const fetchModels = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/util/models`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === 'success') {
        setModels(response.data.models);
        setSelectedModels(response.data.models);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleCheckboxChange = (model) => {
    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((m) => m !== model)
        : [...prev, model]
    );
  };

  const handleDatabaseBackup = async () => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_URL}/util/backup`,
        { models: selectedModels, fileName: backupFileName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        notify(response.data.message, 'success');
      }
    } catch (error) {
      handleError(error);
      notify('Error during backup', 'error');
    }
  };

  const handleDatabaseRestore = async () => {
    try {
      const token = getToken();
      const response = await axios.post(`${API_URL}/util/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === 'success') {
        notify(response.data.message, 'success');
      }
    } catch (error) {
      handleError(error);
      notify('Error during restore', 'error');
    }
  };

  const handleUpdatePermissions = async () => {
    const userId = userInfo ? userInfo.id : null;
    if (!userId) {
      notify("User not found in localStorage", "error");
      return;
    }

    try {
      const token = getToken();

      const response = await axios.get(`${API_URL}/permissions/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === 'success') {
        const permissionNames = response.data.permissions.map(permission => permission.display_name);
        const permissionNames1 = response.data.permissions.map(permission => permission.name);

        localStorage.setItem('permissions_list', JSON.stringify(permissionNames1));

        setPermissions(permissionNames);
        notify(response.data.message, response.data.status);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Settings</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5>Test Notification</h5>
              <button className="btn btn-primary" onClick={() => notify("Test Toast Fired!", "success")}>
                Trigger Notification
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5>Update Permissions</h5>
              <button className="btn btn-warning" onClick={handleUpdatePermissions}>
                Update Permissions
              </button>
              <ul className="mt-2">
                {permissions.length > 0 ? (
                  permissions.map((perm, index) => (
                    <>
                      <li key={index}>{perm}
                      </li>
                    </>
                  ))
                ) : (
                  <li>No permissions found.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h5>Database Backup</h5>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Backup File Name"
                  value={backupFileName}
                  onChange={(e) => setBackupFileName(e.target.value)}
                />
                <h6>Select Models to Backup:</h6>
                {models.map((model) => (
                  <div key={model} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={model}
                      checked={selectedModels.includes(model)}
                      onChange={() => handleCheckboxChange(model)}
                    />
                    <label className="form-check-label" htmlFor={model}>{model}</label>
                  </div>
                ))}
                <button className="btn btn-success mt-3" onClick={handleDatabaseBackup}>
                  Backup Database
                </button>
              </div>
              <div className="col-md-6">
                <h5>Database Restore</h5>
                <button className="btn btn-info" onClick={handleDatabaseRestore}>
                  Restore Database
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;