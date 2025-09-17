// import React, { useState, useEffect, useCallback } from 'react';
// import Swal from 'sweetalert2';
// import 'sweetalert2/dist/sweetalert2.min.css';

// let notificationQueue = [];
// let shownMessages = new Set();  // A Set to store messages that have been displayed

// const notify = (message, type) => {
  
//   console.log(notificationQueue, shownMessages);
//   if (!shownMessages.has(message)) {
//     notificationQueue.push({ message, type });
//     shownMessages.add(message); // Mark this message as shown
//   }
// };

// const Toast = Swal.mixin({
//   toast: true,
//   position: "top-end",
//   showConfirmButton: false,
//   showCloseButton: true,
//   closeButtonHtml: '&times;',
//   timer: 4000,
//   timerProgressBar: true,
//   didOpen: (toast) => {
//     toast.onmouseenter = Swal.stopTimer;
//     toast.onmouseleave = Swal.resumeTimer;
//   }
// });

// const ToastNotification = () => {
//   const [isProcessing, setIsProcessing] = useState(false);

//   useEffect(() => {
//     console.log('Updated notificationQueue:', notificationQueue);
//   }, [notificationQueue]);

//   const processQueue = useCallback(() => {
//     if (isProcessing || notificationQueue.length === 0) return;

//     setIsProcessing(true);
//     const { message, type } = notificationQueue.shift();
//     Toast.fire({
//       icon: type,
//       title: message,
//     }).then(() => {
//       setIsProcessing(false);
//       processQueue();
//     });
//     shownMessages.delete(message);
//     console.log("After noti:- ",notificationQueue, shownMessages);
//   }, [isProcessing]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       processQueue();
//     }, 500);

//     return () => clearInterval(interval);
//   }, [processQueue]);

//   return <></>;
// };

// export { ToastNotification, notify };
















// import React, { useState, useEffect, useCallback } from 'react';
// import Swal from 'sweetalert2';
// import 'sweetalert2/dist/sweetalert2.min.css';

// let notificationQueue = [];

// const notify = (message, type) => {
//   notificationQueue.push({ message, type });
// };

// const Toast = Swal.mixin({
//   toast: true,
//   position: "top-end",
//   showConfirmButton: false,
//   showCloseButton: true,
//   closeButtonHtml: '&times;',
//   timer: 4000,
//   timerProgressBar: true,
//   didOpen: (toast) => {
//     toast.onmouseenter = Swal.stopTimer;
//     toast.onmouseleave = Swal.resumeTimer;
//   }
// });

// const ToastNotification = () => {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const processQueue = useCallback(() => {
//     if (isProcessing || notificationQueue.length === 0) return;

//     setIsProcessing(true);
//     const { message, type } = notificationQueue.shift();
//     console.log(message, type)
//     Toast.fire({
//       icon: type,
//       title: message,
//     }).then(() => {
//       setIsProcessing(false);
//       processQueue();
//     });
//   }, [isProcessing]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       processQueue();
//     }, 500);

//     return () => clearInterval(interval);
//   }, [processQueue]);

//   return <></>;
// };

// export { ToastNotification, notify };


















import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

let notificationQueue = new Set();

const notify = (message, type) => {
  notificationQueue.add(JSON.stringify({ message, type }));
};

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showCloseButton: true,
  closeButtonHtml: '&times;',
  timer: 4000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

const ToastNotification = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processQueue = useCallback(() => {
    if (isProcessing || notificationQueue.size === 0) return;

    setIsProcessing(true);
    const notification = JSON.parse([...notificationQueue][0]);
    notificationQueue.delete(JSON.stringify(notification));

    Toast.fire({
      icon: notification.type,
      title: notification.message,
    }).then(() => {
      setIsProcessing(false);
      processQueue();
    });
  }, [isProcessing]);

  useEffect(() => {
    const interval = setInterval(() => {
      processQueue();
    }, 500);

    return () => clearInterval(interval);
  }, [processQueue]);

  return <></>;
};

export { ToastNotification, notify };
