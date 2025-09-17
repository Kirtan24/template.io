import React, { useEffect, useRef } from 'react';
import Dropdown from './DropDown';
import { getUserInfo } from '../../../../utils/localStorageHelper';
import { hasPermission } from '../../../../utils/helpers/permissionCheck';

const CardView = ({ item, handleEdit, handleDelete, toggleIsActive, sendTemplate, activeDropdown, setActiveDropdown }) => {
  const dropdownRef = useRef(null);
  const userInfo = getUserInfo();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveDropdown]);

  const truncateText = (text, limit = 35) => text?.length > limit ? text.slice(0, limit) + '...' : text;

  const handleCheckboxChange = () => toggleIsActive(item._id, item.isActive);

  return (
    <div className="col-12 col-lg-3 col-md-6 col-sm-6 mb-4">
      <div
        className="card shadow-sm border border-light rounded-lg"
        onClick={() => sendTemplate(item.id)}
        style={{
          cursor: 'pointer',
          width: '100%',
          height: '350px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {((userInfo?.role === 'admin') || item.companyId !== null) && (
          <Dropdown
            itemId={item.id}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            handleEdit={() => handleEdit(item.id)}
            handleDelete={() => handleDelete(item.id)}
          />
        )}

        <div className="d-flex justify-content-center align-items-center" style={{ height: '150px', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
          <img
            className="img-fluid"
            src="./download.png"
            alt="Template preview"
            style={{ height: '120px', objectFit: 'contain', maxWidth: '100%' }}
          />
        </div>

        <div className="card-body flex-grow-1 d-flex flex-column overflow-hidden">
          <h4
            className="card-title1 mt-0"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
            title={item.name}
          >
            {item.name}
          </h4>

          <p
            className="card-text"
            style={{ fontSize: '12px' }}
            title={item.description}
          >
            {truncateText(item.description, 35)}
          </p>

          <p>
            <strong>Company:</strong> {item.companyId?.name || 'By Admin'}
          </p>
        </div>

        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <label htmlFor={`checkbox-${item.id}`} className="form-check-label" style={{ cursor: 'pointer' }}>
            Active
          </label>
          <div className="form-check form-switch" style={{ cursor: 'pointer' }}>
            {(!hasPermission('change_status_template') || userInfo.role !== 'admin') && userInfo.companyId !== item.companyId?.id ? (
              <span className="text-danger">Unauthorized</span>
            ) : (
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`checkbox-${item.id}`}
                  checked={item.isActive}
                  onClick={(e) => e.stopPropagation()}
                  onChange={handleCheckboxChange}
                  style={{ width: '34px', height: '20px', borderRadius: '50px', cursor: 'pointer' }}
                  disabled={(!hasPermission('change_status_template') || userInfo.role !== 'admin') && userInfo.companyId !== item.companyId?.id}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CardView;
