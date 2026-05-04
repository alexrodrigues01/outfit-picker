import React from 'react';
import './GlassCard.css';

export const GlassCard = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`glass-card ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
