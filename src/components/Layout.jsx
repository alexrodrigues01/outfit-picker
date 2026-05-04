import React from 'react';
import { BottomNav } from './BottomNav';

export const Layout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="layout">
      <main className="main-content animate-fade-in">
        {children}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
