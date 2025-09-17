import { getUserPermissions } from '../localStorageHelper';

export const hasPermission = (permission, userRoles) => {
  const userPermissions = userRoles?.length ? userRoles : getUserPermissions() || [];

  if (Array.isArray(permission)) {
    return permission.some(p => userPermissions.includes(p));
  }

  return userPermissions.includes(permission);
};
