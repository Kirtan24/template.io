import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';
import Footer from './Footer/Footer';
import Spinner from '../Spinner/Spinner';
import './Layout.css';

const Layout = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isIconOnly, setIsIconOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 992;
      setIsMobile(mobile);

      if (mobile) {
        setIsIconOnly(false);
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      document.body.classList.remove('sidebar-enable');
    }
  }, [location.pathname, isMobile]);

  // Toggle sidebar
  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
      document.body.classList.toggle('sidebar-enable');
    } else {
      setIsIconOnly(!isIconOnly);
    }
  };

  // Handle clicking outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isSidebarOpen &&
        !event.target.closest('.vertical-menu') &&
        !event.target.closest('#vertical-menu-btn')) {
        setIsSidebarOpen(false);
        document.body.classList.remove('sidebar-enable');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  return (
    <>
      {/* {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white" style={{ zIndex: 9999 }}>
          <Spinner className="dark" />
        </div>
      )} */}
      <div id="layout-wrapper" className={isIconOnly ? 'icon-only' : ''}>
        <Header
          isIconOnly={isIconOnly}
          toggleSidebar={toggleSidebar}
        />
        <Sidebar
          isOpen={isSidebarOpen}
        />
        <div className="main-content">
          <div className="page-content">
            <div className="container-fluid">
              {children}
            </div>
          </div>
        </div>
        <Footer
          isIconOnly={isIconOnly}
        />
      </div>
    </>
  );
};

export default Layout;
