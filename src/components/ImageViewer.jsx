import React from 'react';
import { X } from 'lucide-react';
import './ImageViewer.css';

export const ImageViewer = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="image-viewer-overlay animate-fade-in" onClick={onClose}>
      <div className="image-viewer-popup glass" onClick={(e) => e.stopPropagation()}>
        <button className="image-viewer-close" onClick={onClose}>
          <X size={24} />
        </button>
        <img 
          src={imageUrl} 
          alt="Enlarged view" 
          className="image-viewer-img" 
        />
      </div>
    </div>
  );
};
