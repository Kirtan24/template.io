import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserProfileCard from './UserProfileCard';
import { notify } from '../../../utils/notifications/ToastNotification';
import { getToken, getUserInfo } from '../../../utils/localStorageHelper';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import config from '../../../utils/helpers/helper';
import Title from '../Title';
import Spinner from '../../Spinner/Spinner';
import { io } from 'socket.io-client';

const { API_URL, SOCKET_URL } = config;

const Dashboard = ({ title }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    totalTemplates: 0,
    totalTemplatesNotCreatedByCompany: 0,
    templatesCreatedByCompany: 0,
    totalEmployees: 0,
    totalActiveDashboards: 0,
    templatesCreatedByUserCompany: 0,
  });

  const [loadingStates, setLoadingStates] = useState({
    totalCompanies: false,
    totalUsers: false,
    totalTemplates: false,
    templatesCreatedByCompany: false,
    totalActiveDashboards: false,
  });

  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${API_URL}/user/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.data.status === 'success') {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getUserInfo();
    setRole(user?.role);
  }, []);

  const socketHandler = (socket, storedUser) => {
    const emitWithLoading = (event, data, loadingKey) => {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      socket.emit(event, data);
    };

    socket.on('connect', () => {
      setLoading(true);
      const isAdmin = hasPermission('only_admin');
      socket.emit('user-connected', storedUser.id);

      if (isAdmin) {
        emitWithLoading('get-total-companies', { userId: storedUser.id }, 'totalCompanies');
        emitWithLoading('get-total-templates', { userId: storedUser.id }, 'totalTemplates');
      }

      emitWithLoading('get-total-users', { userId: storedUser.id, companyId: storedUser.companyId || null }, 'totalUsers');
      emitWithLoading('get-templates-created-by-company', { userId: storedUser.id, companyId: storedUser.companyId || null }, 'templatesCreatedByCompany');

      if (!isAdmin) {
        emitWithLoading('get-total-active-dashboards', { userId: storedUser.id, companyId: storedUser.companyId || null }, 'totalActiveDashboards');
      }
    });

    const updateStats = (key, data) => {
      setDashboardStats(prev => ({ ...prev, [key]: data }));
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    };

    socket.on('total-companies', data => updateStats('totalCompanies', data));
    socket.on('total-users', data => updateStats('totalUsers', data));
    socket.on('total-templates', data => updateStats('totalTemplates', data));
    socket.on('templates-created-by-company', data => updateStats('templatesCreatedByCompany', data));
    socket.on('total-active-dashboards', data => updateStats('totalActiveDashboards', data));
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    const storedUser = getUserInfo();

    if (storedUser?.id) {
      socketHandler(socket, storedUser);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (Object.values(loadingStates).every(val => !val)) {
      setLoading(false);
    }
  }, [loadingStates]);

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Dashboard</h4>
          </div>
        </div>
      </div>

      {role !== 'user' && (
        <div className="row">
          <div className="col-xl-4">
            <UserProfileCard />
          </div>
          <div className="col-xl-8">
            <div className="row">
              {hasPermission('only_admin') && (
                <StatCard
                  label="Total Companies"
                  value={dashboardStats.totalCompanies}
                  isLoading={loadingStates.totalCompanies}
                  link="/companies"
                />
              )}

              <StatCard
                label="Total Employees"
                value={dashboardStats.totalUsers}
                isLoading={loadingStates.totalUsers}
                link="/user"
              />

              {hasPermission('only_admin') && (
                <StatCard
                  label="Total Templates"
                  value={dashboardStats.totalTemplates}
                  isLoading={loadingStates.totalTemplates}
                  link="/template"
                />
              )}

              <StatCard
                label="Templates by the Companies"
                value={dashboardStats.templatesCreatedByCompany}
                isLoading={loadingStates.templatesCreatedByCompany}
                link="/template"
              />

              {!hasPermission('only_admin') && (
                <StatCard
                  label="Total Active Dashboards"
                  value={dashboardStats.totalActiveDashboards}
                  isLoading={loadingStates.totalActiveDashboards}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const StatCard = ({ label, value, isLoading, link }) => (
  <div className="col-md-6">
    <div className="card mini-stats-wid">
      <div className="card-body">
        <div className="media">
          <div className="media-body">
            <p className="text-muted fw-medium">{label}</p>
            <h4 className="mb-0 d-flex align-items-center">
              {!isLoading ? (
                value
              ) : (
                <Spinner className="dark" />
              )}
            </h4>
          </div>
          {link && (
            <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
              <Link to={link} className="avatar-title no-hover-effect">
                <i className="bx bx-right-arrow-alt" style={{ fontSize: '25px' }}></i>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;


// import React, { useEffect, useRef, useState } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import UserProfileCard from './UserProfileCard';
// import { notify } from '../../../utils/notifications/ToastNotification';
// import { getToken, getUserInfo } from '../../../utils/localStorageHelper';
// import { hasPermission } from '../../../utils/helpers/permissionCheck';
// import { handleError } from '../../../utils/errorHandling/errorHandler';
// import config from '../../../utils/helpers/helper';
// import Title from '../Title';
// import Spinner from '../../Spinner/Spinner';
// import { io } from 'socket.io-client';

// const { API_URL, SOCKET_URL } = config;

// const Dashboard = ({ title }) => {

//   const [dashboardStats, setDashboardStats] = useState({
//     totalCompanies: 0,
//     totalUsers: 0,
//     totalTemplates: 0,
//     totalTemplatesNotCreatedByCompany: 0,
//     templatesCreatedByCompany: 0,
//     totalEmployees: 0,
//     totalActiveDashboards: 0,
//     templatesCreatedByUserCompany: 0,
//   });
//   const [loadingStates, setLoadingStates] = useState({
//     totalCompanies: false,
//     totalUsers: false,
//     totalTemplates: false,
//     templatesCreatedByCompany: false,
//     totalActiveDashboards: false,
//   });


//   const [role, setRole] = useState('');
//   const [loading, setLoading] = useState(false);

//   const fetchDashboardStats = async () => {
//     try {
//       setLoading(true);
//       const token = getToken();
//       const response = await axios.get(`${API_URL}/auth/dashboard/stats`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (response.data.status === 'success') {
//         setDashboardStats(response.data.data);
//         setLoading(false);
//       }
//     } catch (error) {
//       handleError(error);
//     }
//     finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const user = getUserInfo();
//     setRole(user?.role);
//   }, []);

//   const fallbackTimerRef = useRef(null);
//   const fallbackCalledRef = useRef(false);

//   useEffect(() => {
//     const socket = io(SOCKET_URL);
//     const storedUser = getUserInfo();

//     const fallbackToApi = () => {
//       if (!fallbackCalledRef.current) {
//         fallbackCalledRef.current = true;
//         console.warn("⚠️ Some socket data missing. Falling back to API...");
//         fetchDashboardStats();
//       }
//     };

//     if (storedUser?.id) {
//       socket.on('connect', () => {
//         setLoading(true);
//         const isAdmin = hasPermission('only_admin');

//         socket.emit('user-connected', storedUser.id);

//         if (isAdmin) {
//           socket.emit('get-total-companies', { userId: storedUser.id });
//           setLoadingStates(prev => ({ ...prev, totalCompanies: true }));

//           socket.emit('get-total-templates', { userId: storedUser.id });
//           setLoadingStates(prev => ({ ...prev, totalTemplates: true }));
//         }

//         socket.emit('get-total-users', {
//           userId: storedUser.id,
//           companyId: storedUser.companyId || null,
//         });
//         setLoadingStates(prev => ({ ...prev, totalUsers: true }));

//         socket.emit('get-templates-created-by-company', {
//           userId: storedUser.id,
//           companyId: storedUser.companyId || null,
//         });
//         setLoadingStates(prev => ({ ...prev, templatesCreatedByCompany: true }));

//         if (!isAdmin) {
//           socket.emit('get-total-active-dashboards', {
//             userId: storedUser.id,
//             companyId: storedUser.companyId || null,
//           });
//           setLoadingStates(prev => ({ ...prev, totalActiveDashboards: true }));
//         }

//         fallbackTimerRef.current = setTimeout(fallbackToApi, 2000);
//       });

//       socket.on('total-companies', (data) => {
//         setDashboardStats(prev => ({ ...prev, totalCompanies: data }));
//         setLoadingStates(prev => ({ ...prev, totalCompanies: false }));
//       });

//       socket.on('total-users', (data) => {
//         setDashboardStats(prev => ({ ...prev, totalUsers: data }));
//         setLoadingStates(prev => ({ ...prev, totalUsers: false }));
//       });

//       socket.on('total-templates', (data) => {
//         setDashboardStats(prev => ({ ...prev, totalTemplates: data }));
//         setLoadingStates(prev => ({ ...prev, totalTemplates: false }));
//       });

//       socket.on('templates-created-by-company', (data) => {
//         setDashboardStats(prev => ({ ...prev, templatesCreatedByCompany: data }));
//         setLoadingStates(prev => ({ ...prev, templatesCreatedByCompany: false }));
//       });

//       socket.on('total-active-dashboards', (data) => {
//         setDashboardStats(prev => ({ ...prev, totalActiveDashboards: data }));
//         setLoadingStates(prev => ({ ...prev, totalActiveDashboards: false }));
//       });
//     }

//     return () => {
//       clearTimeout(fallbackTimerRef.current);
//       socket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     const allLoaded = Object.values(loadingStates).every(val => val === false);
//     if (allLoaded && !fallbackCalledRef.current) {
//       clearTimeout(fallbackTimerRef.current);
//     }
//   }, [loadingStates]);

//   return (
//     <>
//       <Title title={title} />
//       <div className="row">
//         <div className="col-12">
//           <div className="page-title-box d-sm-flex align-items-center justify-content-between">
//             <h4 className="mb-sm-0 font-size-18">Dashboard</h4>
//           </div>
//         </div>
//       </div>

//       {role !== 'user' && (
//         <div className="row">
//           <div className="col-xl-4">
//             <UserProfileCard />
//           </div>
//           <div className="col-xl-8">
//             <div className="row">

//               {hasPermission('only_admin') && (
//                 <div className="col-md-6">
//                   <div className="card mini-stats-wid">
//                     <div className="card-body">
//                       <div className="media">
//                         <div className="media-body">
//                           <p className="text-muted fw-medium">Total Companies</p>
//                           <h4 className="mb-0 d-flex align-items-center">
//                             {!loadingStates.totalCompanies ? (
//                               dashboardStats.totalCompanies
//                             ) : (
//                               <>
//                                 <Spinner className="dark" />
//                               </>
//                             )}
//                           </h4>
//                         </div>

//                         <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
//                           <Link to="/companies" className="avatar-title no-hover-effect">
//                             <i className="bx bx-right-arrow-alt" style={{ fontSize: '25px' }}></i>
//                           </Link>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="col-md-6">
//                 <div className="card mini-stats-wid">
//                   <div className="card-body">
//                     <div className="media">
//                       <div className="media-body">
//                         <p className="text-muted fw-medium">Total Employees</p>
//                         <h4 className="mb-0 d-flex align-items-center">
//                           {!loadingStates.totalUsers ? (
//                             dashboardStats.totalUsers
//                           ) : (
//                             <>
//                               <Spinner className="dark" />
//                             </>
//                           )}
//                         </h4>
//                       </div>
//                       <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
//                         <Link to="/user" className="avatar-title no-hover-effect">
//                           <i className="bx bx-right-arrow-alt" style={{ fontSize: '25px' }}></i>
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {hasPermission('only_admin') && (
//                 <div className="col-md-6">
//                   <div className="card mini-stats-wid">
//                     <div className="card-body">
//                       <div className="media">
//                         <div className="media-body">
//                           <p className="text-muted fw-medium">Total Templates</p>
//                           <h4 className="mb-0 d-flex align-items-center">
//                             {!loadingStates.totalTemplates ? (
//                               dashboardStats.totalTemplates
//                             ) : (
//                               <>
//                                 <Spinner className="dark" />
//                               </>
//                             )}
//                           </h4>
//                         </div>
//                         <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
//                           <Link to="/template" className="avatar-title no-hover-effect">
//                             <i className="bx bx-right-arrow-alt" style={{ fontSize: '25px' }}></i>
//                           </Link>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="col-md-6">
//                 <div className="card mini-stats-wid">
//                   <div className="card-body">
//                     <div className="media">
//                       <div className="media-body">
//                         <p className="text-muted fw-medium">Templates by the Companies</p>
//                         <h4 className="mb-0 d-flex align-items-center">
//                           {!loadingStates.templatesCreatedByCompany ? (
//                             dashboardStats.templatesCreatedByCompany
//                           ) : (
//                             <>
//                               <Spinner className="dark" />
//                             </>
//                           )}
//                         </h4>
//                       </div>
//                       <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
//                         <Link to="/template" className="avatar-title no-hover-effect">
//                           <i className="bx bx-right-arrow-alt" style={{ fontSize: '25px' }}></i>
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {!hasPermission('only_admin') && (
//                 <div className="col-md-6">
//                   <div className="card mini-stats-wid">
//                     <div className="card-body">
//                       <div className="media">
//                         <div className="media-body">
//                           <p className="text-muted fw-medium">Total Active Dashboards</p>
//                           <h4 className="mb-0 d-flex align-items-center">
//                             {!loadingStates.totalActiveDashboards ? (
//                               dashboardStats.totalActiveDashboards
//                             ) : (
//                               <>
//                                 <Spinner className="dark" />
//                               </>
//                             )}
//                           </h4>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//             </div>
//           </div>
//         </div>
//       )}

//     </>
//   );
// };

// export default Dashboard;
