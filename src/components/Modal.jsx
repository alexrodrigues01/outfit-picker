import React from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleOverlayClick}>
      <div className="modal-container glass">
        <div className="modal-header">
          <h2 className="text-gradient">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};
