import React from 'react';
import { Shirt, Image as ImageIcon } from 'lucide-react';
import './BottomNav.css';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bottom-nav-container">
      <nav className="bottom-nav glass">
        <button 
          className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Shirt size={24} />
          <span>Guarda-Roupa</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'outfits' ? 'active' : ''}`}
          onClick={() => setActiveTab('outfits')}
        >
          <ImageIcon size={24} />
          <span>Outfits</span>
        </button>
      </nav>
    </div>
  );
};
