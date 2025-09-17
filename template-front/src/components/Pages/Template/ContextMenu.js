// ContextMenu.js
import React from 'react';

function ContextMenu({ visible, x, y, onEdit, onDelete, onClose }) {
  if (!visible) return null;

  const menuStyle = {
    position: 'fixed',
    top: y,
    left: x,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    zIndex: 9999,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    width: '120px',
    overflow: 'hidden',
  };

  const menuItemStyle = {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
  };

  return (
    <div style={menuStyle} onClick={onClose}>
      <div style={menuItemStyle} onClick={onEdit}>Edit</div>
      <div style={menuItemStyle} onClick={onDelete}>Delete</div>
    </div>
  );
}



export default ContextMenu;
