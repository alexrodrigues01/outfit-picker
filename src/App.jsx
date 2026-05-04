import React, { useState } from 'react';
import { WardrobeProvider } from './context/WardrobeContext';
import { Layout } from './components/Layout';
import { Inventory } from './pages/Inventory';
import { Outfits } from './pages/Outfits';

function App() {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <WardrobeProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'inventory' ? <Inventory /> : <Outfits />}
      </Layout>
    </WardrobeProvider>
  );
}

export default App;
