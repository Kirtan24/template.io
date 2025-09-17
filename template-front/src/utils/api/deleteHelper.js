import Swal from 'sweetalert2';
import axios from 'axios';
import { getToken } from '../localStorageHelper';
import { notify } from '../notifications/ToastNotification';

/**
 * Function to handle deletion using SweetAlert2 and Axios
 * @param {string} url - URL for the delete request
 * @param {string} id - ID of the item to delete
 * @param {Function} callback - A callback to execute after successful deletion
 */
export const handleDelete = (url, id, callback) => {
  const token = getToken();

  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Unauthorized',
      text: 'You are not logged in. Please log in again.',
    });
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${url}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const { status, message } = response.data;

          notify(message, status); 

          if (status === 'success') {
            callback();
          }
        })
        .catch((error) => {
          const errorMsg = error.response?.data?.message || 'An error occurred';
          notify(`Error: ${errorMsg}`, 'error');
        });
    }
  });
};
