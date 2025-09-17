import React, { useCallback } from 'react';

const Dropdown = ({ itemId, activeDropdown, setActiveDropdown, handleEdit, handleDelete }) => {
  const toggleDropdown = useCallback((e) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === itemId ? null : itemId));
  }, [itemId, setActiveDropdown]);

  const handleEditClick = (e) => {
    e.stopPropagation();
    handleEdit(itemId);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    handleDelete(itemId);
  };

  return (
    <div className="position-absolute top-0 end-0 p-2">
      <button className="btn btn-sm fs-4" onClick={toggleDropdown}>
        <i className="bx bx-dots-vertical-rounded"></i>
      </button>

      {activeDropdown === itemId && (
        <div className="dropdown-menu show" style={{ position: 'absolute', top: '30px', right: '0', zIndex: 10 }}>
          <button className="dropdown-item" onClick={handleEditClick}>Edit</button>
          <button className="dropdown-item text-danger" onClick={handleDeleteClick}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
