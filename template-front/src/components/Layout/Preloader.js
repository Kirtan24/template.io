import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = ({ loading }) => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setHide(true);
      }, 600); // Matches the CSS transition time
      return () => clearTimeout(timer);
    } else {
      setHide(false); // Show again if loading becomes true
    }
  }, [loading]);

  return (
    <div className={`preloader ${!loading ? 'hidden' : ''}`}>
      <div className="pre-spinner"></div>
    </div>
  );
};

export default Preloader;
