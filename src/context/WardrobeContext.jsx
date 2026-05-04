import React, { createContext, useContext, useState, useEffect } from 'react';

const WardrobeContext = createContext();

export const useWardrobe = () => useContext(WardrobeContext);

const defaultCategories = ['Calças', 'Saias', 'Vestidos', 'Tops', 'Malhas', 'Acessórios'];

export const WardrobeProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('wardrobe_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [outfits, setOutfits] = useState(() => {
    const saved = localStorage.getItem('wardrobe_outfits');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('wardrobe_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => {
    try {
      localStorage.setItem('wardrobe_items', JSON.stringify(items));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
        alert("⚠️ Espaço esgotado! Não tens mais espaço de armazenamento local disponível. Por favor, apaga peças antigas para adicionar novas.");
      }
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('wardrobe_outfits', JSON.stringify(outfits));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
        alert("⚠️ Espaço esgotado! Não tens mais espaço de armazenamento local disponível. Por favor, apaga outfits antigos para adicionar novos.");
      }
    }
  }, [outfits]);

  useEffect(() => {
    try {
      localStorage.setItem('wardrobe_categories', JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  const addCategory = (category) => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const addItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter(item => item.id !== id));
    // Also remove from outfits that use this item
    setOutfits((prev) => prev.map(outfit => ({
      ...outfit,
      itemIds: outfit.itemIds.filter(itemId => itemId !== id)
    })));
  };

  const updateItem = (id, updatedData) => {
    setItems((prev) => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
  };

  const addOutfit = (outfit) => {
    const newOutfit = {
      ...outfit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setOutfits((prev) => [newOutfit, ...prev]);
  };

  const removeOutfit = (id) => {
    setOutfits((prev) => prev.filter(outfit => outfit.id !== id));
  };

  const updateOutfit = (id, updatedData) => {
    setOutfits((prev) => prev.map(outfit => outfit.id === id ? { ...outfit, ...updatedData } : outfit));
  };

  const getItemsByCategory = (category) => {
    if (!category || category === 'Todas') return items;
    return items.filter(item => item.category === category);
  };

  const getOutfitsByItems = (selectedItemIds) => {
    if (!selectedItemIds || selectedItemIds.length === 0) return outfits;
    return outfits.filter(outfit => 
      selectedItemIds.every(id => outfit.itemIds.includes(id))
    );
  };

  return (
    <WardrobeContext.Provider value={{
      items,
      outfits,
      categories,
      addCategory,
      addItem,
      updateItem,
      removeItem,
      addOutfit,
      updateOutfit,
      removeOutfit,
      getItemsByCategory,
      getOutfitsByItems
    }}>
      {children}
    </WardrobeContext.Provider>
  );
};
