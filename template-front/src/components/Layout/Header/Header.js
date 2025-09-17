import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogoSmall from '../../../utils/logo/LogoSmall';
import LogoLarge from '../../../utils/logo/LogoLarge';
import config from '../../../utils/helpers/helper';
import axios from 'axios';
import { CONSTANT } from '../../../utils/constant';
import { getToken, clearUserData, getUserInfo } from '../../../utils/localStorageHelper';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
import { notify } from '../../../utils/notifications/ToastNotification';
import { io } from 'socket.io-client';
import SearchBar from './SearchBar';
import './Header.css'

const { API_URL, SOCKET_URL } = config;

const Header = ({ isIconOnly, toggleSidebar }) => {
  const [userName, setUserName] = useState('');
  const [count, setInactiveCompaniesCount] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const navigate = useNavigate();
  
  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      handleError(CONSTANT.AUTH.AUTH_REQUIRED, 'error');
    }
    return token;
  };

  const getCurrentDate = () => {
    const now = new Date();

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return now.toLocaleString('en-US', options).replace(/,([^,]*)$/, '$1');
  };

  useEffect(() => {
    setCurrentDateTime(getCurrentDate());

    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDate());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchInactiveCompanies = async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/companies/count`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setInactiveCompaniesCount(response.data.count);
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Error fetching inactive companies count:', error);
      handleError(error);
    }
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    const user = getUserInfo();
    let fallbackTimer;

    socket.on('connect', () => {
      if (user?.id) {
        socket.emit('user-connected', user.id);
        socket.emit('inactive-companies-updated', user.id);

        fallbackTimer = setTimeout(() => {
          console.warn('⚠️ No socket update. Falling back to API...');
          fetchInactiveCompanies();
        }, 5000);
      }
    });

    socket.on("bulk-processing", (data) => {
      if (data.status === "success") {
        console.log("✅ Job Done:", data.message, data.result);
        notify(data.message, data.status);
      } else if (data.status === "failure") {
        console.error("❌ Job Failed:", data.message);
        notify(data.message, data.status);
      }
    });

    socket.on('inactive-companies', (data) => {
      clearTimeout(fallbackTimer);
      setInactiveCompaniesCount(data.count);
      setCompanies(data.companies);
    });

    return () => {
      socket.off('inactive-companies-updated');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo?.name) {
      setUserName(userInfo.name);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = fetchToken();
      if (!token) return;

      const user = getUserInfo();
      if (!user?.id) {
        console.error('User data is missing or invalid');
        return;
      }

      const response = await axios.post(`${API_URL}/auth/logout`, { user }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data.status === 'success') {
        clearUserData();
        navigate('/login');
        window.location.reload();
      } else {
        notify(response.data.message, response.data.status);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div id="page-topbar" className={isIconOnly ? 'icon-only' : ''}>
      <header className={`navbar-header ${isIconOnly ? 'icon-only' : ''}`}>
        <div className="d-flex">
          <div className={`navbar-brand-box ${isIconOnly ? 'c-m' : ''}`}>
            <Link to="/dashboard" className="logo">
              <span className="logo-sm">
                <LogoSmall />
              </span>
              <span className="logo-lg">
                <LogoLarge dark={false} />
              </span>
            </Link>
          </div>

          <button
            type="button"
            className="btn btn-sm px-3 font-size-16 header-item waves-effect btn-toggle-sidebar"
            onClick={toggleSidebar}
            id="vertical-menu-btn"
          >
            <i className="fa fa-fw fa-bars"></i>
          </button>

          <SearchBar />

          <div className="current-date-time mx-3 d-flex justify-content-center align-items-center">
            {currentDateTime}
          </div>
        </div>

        <div className="d-flex">
          {hasPermission('only_admin') && (
            <div className="dropdown d-inline-block">
              <button
                type="button"
                className="btn header-item noti-icon waves-effect"
                id="page-header-notifications-dropdown"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className={`bx bx-bell ${count > 0 ? 'bx-tada' : ''}`}></i>
                <span className="badge bg-danger rounded-pill">{count > 0 ? count : ''}</span>
              </button>
              <div
                className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 shadow-lg"
                aria-labelledby="page-header-notifications-dropdown"
              >
                <div className="p-3 border-bottom">
                  <h5 className="m-0">Notifications</h5>
                </div>
                <div data-simplebar style={{ maxHeight: '230px' }}>

                  {companies.map(company => (
                    <Link key={company._id} className="text-reset notification-item py-2 px-3 d-block border-bottom">
                      <div>
                        <h6 className="mt-0 mb-1 text-dark">{company.name}</h6>
                        <div className="font-size-12 text-muted">
                          <p className="mb-1">Status: {company.companyStatus}</p>
                          <p className="mb-0">
                            <i className="mdi mdi-clock-outline"></i>
                            <span>{company.lastUpdated ? new Date(company.lastUpdated).toLocaleString() : ' No updates'}</span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="p-3 text-center border-top">
                  <Link to="/pending-request" className="text-primary fw-bold" style={{ textDecoration: 'underline' }}>
                    View All
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="dropdown d-inline-block">
            <button
              type="button"
              className="btn header-item waves-effect"
              id="page-header-user-dropdown"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <img className="rounded-circle header-profile-user me-1" src="assets/images/users/avatar-1.jpg" alt="" />
              <span className="d-none d-xl-inline-block mx-1">{userName}</span>
              <i className="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
            </button>
            <div className="dropdown-menu dropdown-menu-end">
              <Link className="dropdown-item" to="/profile">
                <i className="bx bx-user font-size-16 align-middle me-1"></i> Profile
              </Link>
              {hasPermission('only_admin') && (
                <Link className="dropdown-item" to="/settings">
                  <i className="bx bx-cog font-size-16 align-middle me-1"></i> Settings
                </Link>
              )}
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger border-0 bg-transparent w-100 text-start"
                onClick={handleLogout}
              >
                <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;