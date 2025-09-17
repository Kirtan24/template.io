import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getUserPermissions } from '../../utils/localStorageHelper';

const ProtectedRoute = ({ children, requiredPermissions }) => {
  const location = useLocation();

  const token = getToken();
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  const userPermissions = getUserPermissions();

  const hasPermission = requiredPermissions.every((perm) =>
    userPermissions.includes(perm)
  );

  if (!hasPermission) {
    return <Navigate to="/dashboard" state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;