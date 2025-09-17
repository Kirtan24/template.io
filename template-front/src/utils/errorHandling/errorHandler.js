import { notify } from '../notifications/ToastNotification';

/**
 * Error handling function to process the error object
 * and display a relevant notification.
 * 
 * @param {Object} error - The error object returned by Axios or other request methods.
 */
export const handleError = (error) => {
  let errorMessage = 'An unexpected error occurred. Please try again later.';
  let errorStatus = 'error'; // Default status for unknown errors

  if (error.response && error.response.data.message && error.response.data.status) {
    errorMessage = error.response.data.message;
    errorStatus = error.response.data.status;
  } else if (error.response) {
    // The API returned an error response
    const status = error.response.status; // HTTP status code
    const data = error.response.data; // Custom status and message from the backend

    // Check if the backend response has a custom message and status
    if (data && data.message) {
      errorMessage = data.message; // Custom message from the backend
    }

    // Additional handling for specific HTTP status codes, if needed
    if (status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (status === 400) {
      errorMessage = 'Bad request. Please check the input values.';
    } else if (status === 401) {
      errorMessage = 'Unauthorized access. Please log in.';
    } else if (status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
  } else if (error.request) {
    console.log(error)
    // No response from server, network error
    errorMessage = 'Network error. Please check your connection.';
  } else {
    // Error in setting up the request
    errorMessage = 'An error occurred while setting up the request.';
  }

  // Show the error message using the notify function
  console.log(error)
  notify(errorMessage, errorStatus);
};
