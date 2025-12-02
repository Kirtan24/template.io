import CryptoJS from 'crypto-js';
import config from './helpers/helper';

const { SECRET_KEY } = config;

// Warn if SECRET_KEY is not set (only in development)
if (process.env.NODE_ENV === 'development' && !SECRET_KEY) {
  console.warn('⚠️ REACT_APP_SECRET_KEY is not set in your .env file. Data will be stored without encryption.');
}

// ----- Encryption Helpers -----

const encrypt = (data) => {
  try {
    if (!SECRET_KEY) {
      // Fallback: store without encryption if SECRET_KEY is missing
      return JSON.stringify(data);
    }
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error('Error encrypting data:', error);
    // Fallback: store without encryption on error
    return JSON.stringify(data);
  }
};

const decrypt = (ciphertext) => {
  try {
    if (!ciphertext) {
      return null;
    }
    
    if (!SECRET_KEY) {
      // Try to parse as plain JSON if SECRET_KEY is missing
      return JSON.parse(ciphertext);
    }
    
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      // If decryption returns empty, try parsing as plain JSON (fallback for unencrypted data)
      return JSON.parse(ciphertext);
    }
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting data:', error);
    // Try to parse as plain JSON if decryption fails
    try {
      return JSON.parse(ciphertext);
    } catch (parseError) {
      console.error('Failed to parse data as JSON:', parseError);
      return null;
    }
  }
};

// ----- Utility Functions -----

const setLocalStorageJSON = (key, value, rememberMe) => {
  try {
    const encryptedValue = encrypt(value);
    
    if (!encryptedValue) {
      throw new Error(`Failed to encrypt value for ${key}`);
    }
    
    localStorage.setItem(key, encryptedValue);
    
    // Verify the value was set immediately
    const verifyValue = localStorage.getItem(key);
    if (!verifyValue) {
      const error = new Error(`Failed to save ${key} to localStorage. Check browser storage settings.`);
      console.error(error.message);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    throw error; // Re-throw so caller can handle it
  }
};

const getLocalStorageJSON = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? decrypt(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage`, error);
    return null;
  }
};


// ----- Public API -----

export const setItem = (key, value, rememberMe = false) => {
  setLocalStorageJSON(key, value, rememberMe);
};

export const getItem = (key) => {
  return getLocalStorageJSON(key);
};

export const setToken = (token, rememberMe = false) => {
  setLocalStorageJSON('token', { token }, rememberMe);
};

export const getToken = () => {
  const data = getLocalStorageJSON('token');
  return data?.token || null;
};

export const isTokenAvailable = () => !!getToken();

export const setUserInfo = (user, rememberMe = false) => {
  setItem('userInfo', user, rememberMe);
};

export const getUserInfo = () => {
  return getItem('userInfo');
};

export const setUserPermissions = (permissions, rememberMe = false) => {
  setItem('permissions_list', permissions, rememberMe);
};

export const getUserPermissions = () => {
  return getItem('permissions_list') || [];
};

export const clearUserData = () => {
  try {
    removeItem('token');
    removeItem('userInfo');
    removeItem('permissions_list');
  } catch (error) {
    console.error('Error clearing user data from localStorage', error);
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage`, error);
  }
};




// Old Working Code (for reference only, not to be used in production)

// import Cookies from 'js-cookie';

// // Utility function to handle setting values
// const setValue = (key, value, useCookies) => {
//   try {
//     const data = typeof value === 'string' ? value : JSON.stringify(value);

//     const storageMethod = useCookies ? Cookies : localStorage;
//     const options = useCookies ? { expires: 5 / 86400 } : undefined;  // Cookies expire after 5 seconds

//     if (useCookies) {
//       storageMethod.set(key, data, options);
//     } else {
//       storageMethod.setItem(key, data);
//     }
//   } catch (error) {
//     console.error(`Error setting ${key} in ${useCookies ? 'cookies' : 'localStorage'}`, error);
//   }
// };

// export const setItem = (key, value, useCookies = false) => {
//   setValue(key, value, useCookies);
// };

// export const getItem = (key, fromCookies = false) => {
//   try {
//     const storageMethod = fromCookies ? Cookies : localStorage;
//     const item = fromCookies ? storageMethod.get(key) : storageMethod.getItem(key);

//     if (item) {
//       return isJson(item) ? JSON.parse(item) : item;
//     }
//     return null;
//   } catch (error) {
//     console.error(`Error getting ${key} from ${fromCookies ? 'cookies' : 'localStorage'}`, error);
//     return null;
//   }
// };

// // Helper function to check if the value is valid JSON
// const isJson = (str) => {
//   try {
//     JSON.parse(str);
//     return true;
//   } catch {
//     return false;
//   }
// };

// export const setToken = (token, rememberMe = false) => {
//   try {
//     const storageMethod = rememberMe ? Cookies : localStorage;
//     const data = JSON.stringify({ token });
//     const options = rememberMe ? { expires: 365 } : undefined;

//     if (rememberMe) {
//       storageMethod.set('token', data, options);
//     } else {
//       storageMethod.setItem('token', data);
//     }
//   } catch (error) {
//     console.error('Error setting token', error);
//   }
// };

// export const getToken = () => {
//   try {
//     const cookieToken = Cookies.get('token');
//     if (cookieToken) {
//       return JSON.parse(cookieToken).token;
//     }

//     const tokenData = localStorage.getItem('token');
//     if (tokenData) {
//       return JSON.parse(tokenData).token;
//     }
//     return null;
//   } catch (error) {
//     console.error('Error getting token', error);
//     return null;
//   }
// };

// export const isTokenAvailable = () => !!getToken(); // Simplified check

// export const clearUserData = () => {
//   try {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userInfo');
//     localStorage.removeItem('permissions_list');
//     Cookies.remove('token');
//     Cookies.remove('userInfo');
//     Cookies.remove('permissions_list');
//   } catch (error) {
//     console.error('Error clearing user data from storage or cookies', error);
//   }
// };

// export const getUserPermissions = () => {
//   try {
//     // Check for permissions in cookies
//     const cookiePermissions = Cookies.get('permissions_list');
//     if (cookiePermissions) {
//       return JSON.parse(cookiePermissions);
//     }

//     // Check for permissions in localStorage
//     const localPermissions = localStorage.getItem('permissions_list');
//     if (localPermissions) {
//       return JSON.parse(localPermissions);
//     }

//     return [];
//   } catch (error) {
//     console.error('Error getting user permissions', error);
//     return [];
//   }
// };





// // // utils/localStorageHelper.js

// // export const setItem = (key, value) => {
// //   try {
// //     const data = typeof value === 'string' ? value : JSON.stringify(value);
// //     localStorage.setItem(key, data);
// //   } catch (error) {
// //     console.error('Error setting item in localStorage', error);
// //   }
// // };

// // export const getItem = (key) => {
// //   try {
// //     const item = localStorage.getItem(key);
// //     if (item && item !== 'undefined') {
// //       try {
// //         return JSON.parse(item);
// //       } catch {
// //         return item;
// //       }
// //     }
// //     return null;
// //   } catch (error) {
// //     console.error('Error getting item from localStorage', error);
// //     return null;
// //   }
// // };


// // export const setToken = (token) => {
// //   try {
// //     localStorage.setItem('token', JSON.stringify({ token }));
// //   } catch (error) {
// //     console.error('Error setting token', error);
// //   }
// // };

// // export const getToken = () => {
// //   try {
// //     const tokenData = localStorage.getItem('token');
// //     if (tokenData) {
// //       const { token } = JSON.parse(tokenData);
// //       return token;
// //     }
// //     return null;
// //   } catch (error) {
// //     console.error('Error getting token', error);
// //     return null;
// //   }
// // };

// // export const isTokenAvailable = () => {
// //   const token = getToken();
// //   return token ? true : false;
// // };
