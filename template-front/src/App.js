import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Layout from "./components/Layout/Layout";
import Spinner from "./components/Spinner/Spinner";
import { getToken } from "./utils/localStorageHelper";
import { routeComponents, routePermissions } from "./utils/routeConfig";

import {
  NotFound,
  Home,
  ToastNotification,
  SignaturePadComponent,
} from "./components/Pages";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(!!getToken());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner />
      </div>
    );
  }

  const SignRoute = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    return <SignaturePadComponent title="Signature" token={token} />;
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login title="Login" setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route path="/subscription" element={<Register title='Register'/>} />
        <Route path="/sign" element={<SignRoute />} />
        <Route path="/forgot-password" element={<ForgotPassword title='Forgot Password'/>} />
        <Route path="/reset-password" element={<ResetPassword title='Reset Password'/>} />

        {Object.entries(routePermissions).map(([path, permissions]) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute requiredPermissions={permissions}>
                <Layout>
                  {routeComponents[path] || (
                    <NotFound title="404 Page Not Found" />
                  )}
                </Layout>
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="*" element={<NotFound title="404 Page Not Found" />} />
      </Routes>
      <ToastNotification />
    </>
  );
};

export default App;


// App.js - Optimized Version 2

// import React, { useEffect, useState } from 'react';
// import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import ProtectedRoute from './components/Auth/ProtectedRoute';
// import Login from './components/Auth/Login';
// import Register from './components/Auth/Register';
// import Layout from './components/Layout/Layout';
// import Spinner from './components/Spinner/Spinner';

// import {
//   Dashboard, Inbox, EmailTemplate, Credentials, NotFound, AddEmailTemplate, EditEmailTemplate,
//   AddCredential, EditCredential, User, AddUser, UserPermissions, Company, ViewEmployee, ViewCompany, Template,
//   AddTemplate, Profile, EditTemplate, Permission, Home, SendTemplate, PDFPreviewPage, Send, Requests,
//   ToastNotification, Settings, SignaturePadComponent, ExcelMapper, Plans, EditPlan
// } from './components/Pages';

// import { getToken } from './utils/localStorageHelper';

// const routePermissions = {
//   "/dashboard": [],
//   "/settings": ["only_admin"],
//   "/plans": ["only_admin"],
//   "/plans/edit-plan/:id": ["only_admin"],
//   "/profile": [],
  
//   "/companies": ["view_companies"],
//   "/company-employees/:id": ["view_company_employee"],
//   "/company-profile/:id": ["view_company"],
//   "/pending-request": ["only_admin"],
  
//   "/user": ["view_users"],
//   "/user/add-user": ["create_users"],
  
//   "/permission": ["only_admin"],
//   "/permissions/:id/:cat": ["manage_permissions"],
  
//   "/inbox": ["view_inbox"],
  
//   "/credentials": ["view_credentials"],
//   "/credentials/add-credential": ["create_credentials"],
//   "/credentials/edit-credential/:id": ["update_credentials"],
  
//   "/email-template": ["view_emailtemplate"],
//   "/add-email-template": ["create_emailtemplate"],
//   "/edit-email-template": ["update_emailtemplate"],
//   "/email-template/send/:id": ["send_emailtemplate"],
  
//   "/template": ["view_templates"],
//   "/excel-upload": [],
//   "/add-template": ["create_templates"],
//   "/edit-template": ["update_templates"],
//   "/send-document-template": ["send_templates"],
//   "/pdf-preview": ["send_templates"],
//   "/send": ["send_templates"],
// };

// const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setIsAuthenticated(!!getToken());
//     setLoading(false);
//   }, []);

//   if (loading) {
//     return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner /></div>;
//   }

//   const SignRoute = () => {
//     const location = useLocation();
//     const queryParams = new URLSearchParams(location.search);
//     const token = queryParams.get("token");
//     return <SignaturePadComponent title="Signature" token={token} />;
//   };

//   return (
//     <>
//       <Routes>
//         <Route path='/' element={<Home />} />
//         <Route path='/login' element={isAuthenticated ? <Navigate to='/dashboard' /> : <Login title='Login' setIsAuthenticated={setIsAuthenticated} />} />
//         <Route path='/subscription' element={<Register />} />
//         <Route path='/sign' element={<SignRoute />} />

//         {Object.entries(routePermissions).map(([path, permissions]) => (
//           <Route
//             key={path}
//             path={path}
//             element={
//               <ProtectedRoute requiredPermissions={permissions}>
//                 <Layout>
//                   {path === '/dashboard' ? <Dashboard title='Dashboard' /> :
//                   path === '/profile' ? <Profile title='Profile' /> :
//                   path === '/settings' ? <Settings title='Settings' /> :
//                   path === '/plans' ? <Plans title='Plans' /> :
//                   path.startsWith('/plans/edit-plan') ? <EditPlan title='Edit Plan' /> :

//                   path === '/companies' ? <Company title='Companies' /> :
//                   path.startsWith('/company-employees') ? <ViewEmployee title='Company Employees' /> :
//                   path.startsWith('/company-profile') ? <ViewCompany title='Company Profile' /> :
//                   path === '/pending-request' ? <Requests title='Pending Request' /> :
                  
//                   path === '/user' ? <User title='Employees' /> :
//                   path === '/user/add-user' ? <AddUser title='Add Employee' /> :
                  
//                   path === '/permission' ? <Permission title='Admin Permission' /> :
//                   path.startsWith('/permissions') ? <UserPermissions title='Permissions' /> :
//                   path === '/inbox' ? <Inbox title='Inbox' /> :
                  
//                   path === '/credentials' ? <Credentials title='Credentials' /> :
//                   path === '/credentials/add-credential' ? <AddCredential title='Add Credential' /> :
//                   path.startsWith('/credentials/edit-credential') ? <EditCredential title='Edit Credential' /> :
                  
//                   path === '/email-template' ? <EmailTemplate title='Email Template' /> :
//                   path === '/add-email-template' ? <AddEmailTemplate title='Add Email Template' /> :
//                   path === '/edit-email-template' ? <EditEmailTemplate title='Edit Email Template' /> :
                  
//                   path === '/template' ? <Template title='Template' /> :
//                   path === '/excel-upload' ? <ExcelMapper title='Upload Excel' /> :
//                   path === '/add-template' ? <AddTemplate title='Add Template' /> :
//                   path === '/edit-template' ? <EditTemplate title='Edit Template' /> :
//                   path === '/send-document-template' ? <SendTemplate title='Send Template' /> :
//                   path === '/pdf-preview' ? <PDFPreviewPage title='PDF Preview Page' /> :
//                   path === '/send' ? <Send title='Send Template' /> :

//                   <NotFound title='404 Page Not Found' />}
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />
//         ))}

//         <Route path='*' element={<NotFound title='404 Page Not Found' />} />
//       </Routes>
//       <ToastNotification />
//     </>
//   );
// };

// export default App;

// // App.js Version 1 (Original Version)

// // import React, { useEffect, useState } from 'react';
// // import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// // import ProtectedRoute from './components/Auth/ProtectedRoute';
// // import Login from './components/Auth/Login';
// // import Register from './components/Auth/Register';
// // import Layout from './components/Layout/Layout';
// // import Spinner from './components/Spinner/Spinner';

// // import {
// //   Dashboard, Inbox, EmailTemplate, Credentials, NotFound, AddEmailTemplate, EditEmailTemplate,
// //   AddCredential, EditCredential, User, UserPermissions, Company, ViewEmployee, ViewCompany, Template,
// //   AddTemplate, Profile, EditTemplate, Permission, Home, SendTemplate, PDFPreviewPage, TestNoti, Send, Requests,
// //   ToastNotification, Settings, SignaturePadComponent
// // } from './components/Pages';

// // import { getToken } from './utils/localStorageHelper';

// // const App = () => {
// //   const [isAuthenticated, setIsAuthenticated] = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const location = useLocation();

// //   const validateToken = () => {
// //     const token = getToken();

// //     if (token) {
// //       setIsAuthenticated(true);
// //     } else {
// //       setIsAuthenticated(false);
// //     }

// //     setLoading(false);
// //   };


// //   useEffect(() => {
// //     validateToken();
// //   }, []);

// //   if (loading) {
// //     return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner /></div>;
// //   }

// //   const SignRoute = () => {
// //     const location = useLocation();
// //     const queryParams = new URLSearchParams(location.search);
// //     const token = queryParams.get("token"); // Extract token from URL

// //     return <SignaturePadComponent title="Sign" token={token} />;
// //   };

// //   const renderWithAuth = (element) => isAuthenticated ? element : <Navigate to='/login' state={{ from: location }} />;

// //   return (
// //     <>
// //       <Routes>
// //         <Route path='/' element={<Home />} />
// //         <Route path='/test-noti' element={<TestNoti />} />

// //         {/* Auth Routes */}
// //         <Route path='/login' element={isAuthenticated ? <Navigate to='/dashboard' /> : <Login title='Login' setIsAuthenticated={setIsAuthenticated} />} />
// //         <Route path='/subscription' title='Subscription' element={<Register />} />

// //         {/* Protected Routes */}
// //         <Route path='/dashboard' element={renderWithAuth(<Layout><Dashboard title='Dashboard' /></Layout>)} />
// //         <Route path='/settings' element={renderWithAuth(<Layout><Settings title='Setting' /></Layout>)} />
// //         <Route path='/profile' element={renderWithAuth(<Layout><Profile title='Profile' /></Layout>)} />

// //         {/* Company Routes */}
// //         <Route path='/companies' element={renderWithAuth(<Layout><Company title='Companies' /></Layout>)} />
// //         <Route path='/company-employees/:id' element={renderWithAuth(<Layout><ViewEmployee title='Company Employees' /></Layout>)} />
// //         <Route path='/company-profile/:id' element={renderWithAuth(<Layout><ViewCompany title='Company Profile' /></Layout>)} />
// //         <Route path='/pending-request' element={renderWithAuth(<Layout><Requests title='Pending Request' /></Layout>)} />

// //         {/* User and Permission Routes */}
// //         <Route path='/user' element={renderWithAuth(<Layout><User title='Employees' /></Layout>)} />
// //         <Route path='/permission' element={renderWithAuth(<Layout><Permission title='Admin Permission' /></Layout>)} />
// //         <Route path='/permissions/:id/:cat' element={renderWithAuth(<Layout><UserPermissions title='Permissions' /></Layout>)} />

// //         {/* Inbox and Scheduled Routes */}
// //         <Route path='/inbox' element={renderWithAuth(<Layout><Inbox title='Inbox' /></Layout>)} />

// //         {/* Credential Routes */}
// //         <Route path='/credentials' element={renderWithAuth(<Layout><Credentials title='Credentials' /></Layout>)} />
// //         <Route path='/credentials/add-credential' element={renderWithAuth(<Layout><AddCredential title='Add Credential' /></Layout>)} />
// //         <Route path='/credentials/edit-credential/:id' element={renderWithAuth(<Layout><EditCredential title='Edit Credential' /></Layout>)} />

// //         {/* Email Template Routes */}
// //         <Route path='/email-template' element={renderWithAuth(<Layout><EmailTemplate title='Email Template' /></Layout>)} />
// //         <Route path='/email-template/add-email-template' element={renderWithAuth(<Layout><AddEmailTemplate title='Add Email Template' /></Layout>)} />
// //         <Route path='/email-template/edit-email-template/:id' element={renderWithAuth(<Layout><EditEmailTemplate title='Edit Email Template' /></Layout>)} />

// //         {/* Template Routes */}
// //         <Route path="/sign" element={<SignRoute />} />
// //         {/* <Route path='/sign' element={renderWithAuth(<SignaturePadComponent title='Sign' />)} /> */}
// //         <Route path='/template' element={renderWithAuth(<Layout><Template title='Template' /></Layout>)} />
// //         <Route path='/template/add-template' element={renderWithAuth(<Layout><AddTemplate title='Add Template' /></Layout>)} />
// //         <Route path='/template/edit-template/:id' element={renderWithAuth(<Layout><EditTemplate title='Edit Template' /></Layout>)} />
// //         <Route path='/template/send-document-template/:templateId' element={renderWithAuth(<Layout><SendTemplate title='Send Template' /></Layout>)} />
// //         <Route path='/template/send/:inboxId' element={renderWithAuth(<Layout><Send title='Send Template' /></Layout>)} />
// //         <Route path='/template/pdf-preview/:inboxId' element={<Layout><PDFPreviewPage /></Layout>} />

// //         {/* Not Found */}
// //         <Route path='*' element={<NotFound title='404 Page Not Found' />} />
// //       </Routes>
// //       <ToastNotification />
// //     </>
// //   );
// // };

// // export default App;
