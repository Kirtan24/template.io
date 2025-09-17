import React from 'react';
import './Spinner.css';

const Spinner = ({ className = '' }) => {
  const bars = Array.from({ length: 12 }, (_, index) => (
    <div key={index} className={`bar${index + 1}`}></div>
  ));

  return (
    <>
      <div className="text-center btn-load">
        <div className={`spinner ${className}`}>{bars}</div>
      </div>
    </>
  )
};

export default Spinner;
