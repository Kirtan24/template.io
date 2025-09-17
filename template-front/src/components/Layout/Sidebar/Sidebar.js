import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [activeMenu, setActiveMenu] = useState('');
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const path = location.pathname;
    setActiveMenu(path);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSubmenu = (menuId) => {
    setActiveMenu(activeMenu === menuId ? '' : menuId);
  };

  return (
    <div className={`vertical-menu ${isOpen ? 'sidebar-enable' : ''}`} ref={sidebarRef}>
      <div data-simplebar className="h-100">
        <div id="sidebar-menu">
          <ul className="list-unstyled" id="side-menu">

            <li className="menu-title">Overview</li>
            <li>
              <NavLink to="/dashboard" title="Dashboards" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                <i className="bx bx-home-circle"></i>
                <span>Dashboards</span>
              </NavLink>
            </li>

            {(hasPermission('view_companies') || hasPermission('view_users')) && (
              <>
                <li className="menu-title">Management</li>

                {hasPermission('view_companies') && (
                  <li>
                    <NavLink title="Companies" to="/companies" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                      <i className="bx bx-store-alt"></i>
                      <span>Companies</span>
                    </NavLink>
                  </li>
                )}

                {hasPermission('view_users') && (
                  <li>
                    <NavLink title="Employee" to="/user" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                      <i className="bx bx-user-circle"></i>
                      <span>Employee</span>
                    </NavLink>
                  </li>
                )}
              </>
            )}

            {(hasPermission('view_inbox') || hasPermission('view_scheduled')) && (
              <>
                <li className="menu-title">Email</li>

                {hasPermission('view_inbox') && (
                  <li>
                    <NavLink title="Inbox" to="/inbox" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                      <i className="mdi mdi-email-outline"></i>
                      <span>Inbox</span>
                    </NavLink>
                  </li>
                )}

                {hasPermission('view_scheduled') && (
                  <li>
                    <NavLink title="Scheduled" to="/scheduled" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                      <i className="dripicons-time-reverse"></i>
                      <span>Scheduled</span>
                    </NavLink>
                  </li>
                )}
              </>
            )}

            {(hasPermission('view_emailtemplate') || hasPermission('view_templates')) && (
              <>
                <li className="menu-title">Templates</li>

                {hasPermission('view_emailtemplate') && (
                  <li>
                    <NavLink title="Email Template" to="/email-template" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                      <i className="bx bx-plus-medical"></i>
                      <span>Email Template</span>
                    </NavLink>
                  </li>
                )}

                {hasPermission('view_templates') && (
                  <li>
                    <NavLink title="Template" to="/template" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                      <i className="bx bx-list-ul"></i>
                      <span>Template</span>
                    </NavLink>
                  </li>
                )}
              </>
            )}

            {hasPermission('view_credentials') && (
              <>
                <li className="menu-title">Utilities</li>

                <li>
                  <NavLink title="Credentials" to="/credentials" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                    <i className="bx bx-lock-alt"></i>
                    <span>Credentials</span>
                  </NavLink>
                </li>
              </>
            )}

            {hasPermission('only_admin') && (
              <>
                <li className="menu-title">Admin Panel</li>

                <li>
                  <NavLink title="Permission" to="/permission" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                    <i className="bx bx-key"></i>
                    <span>Permission</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink title="Plans" to="/plans" className={({ isActive }) => (isActive ? 'waves-effect active' : 'waves-effect')}>
                    <i className="bx bx-receipt"></i>
                    <span>Plans</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>

  );
};

export default Sidebar;
