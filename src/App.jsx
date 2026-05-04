import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WardrobeProvider } from './context/WardrobeContext';
import { Layout } from './components/Layout';
import { Inventory } from './pages/Inventory';
import { Outfits } from './pages/Outfits';
import { Auth } from './pages/Auth';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <WardrobeProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'inventory' ? <Inventory /> : <Outfits />}
      </Layout>
    </WardrobeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
