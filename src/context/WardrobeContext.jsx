import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  setDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const WardrobeContext = createContext();

export const useWardrobe = () => useContext(WardrobeContext);

const defaultCategories = ['Calças', 'Saias', 'Vestidos', 'Tops', 'Malhas', 'Acessórios'];

export const WardrobeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);

  // Subscrever Peças
  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      return;
    }
    const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  // Subscrever Outfits
  useEffect(() => {
    if (!currentUser) {
      setOutfits([]);
      return;
    }
    const q = query(collection(db, 'outfits'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const outfitsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOutfits(outfitsData.sort((a, b) => b.createdAt - a.createdAt));
    });
    return unsubscribe;
  }, [currentUser]);

  // Subscrever Categorias
  useEffect(() => {
    if (!currentUser) {
      setCategories(defaultCategories);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'user_categories', currentUser.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        setCategories(docSnap.data().list);
      } else {
        setCategories(defaultCategories);
      }
    });
    return unsubscribe;
  }, [currentUser]);

  const addCategory = async (category) => {
    if (!currentUser || !category || categories.includes(category)) return;
    const newList = [...categories, category];
    await setDoc(doc(db, 'user_categories', currentUser.uid), { list: newList }, { merge: true });
  };

  const addItem = async (item) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'items'), {
      ...item,
      userId: currentUser.uid,
      createdAt: Date.now()
    });
  };

  const removeItem = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'items', id));
    
    // Remover a peça dos outfits que a contêm
    outfits.forEach(async (outfit) => {
      if (outfit.itemIds.includes(id)) {
        const newItemIds = outfit.itemIds.filter(itemId => itemId !== id);
        await updateDoc(doc(db, 'outfits', outfit.id), { itemIds: newItemIds });
      }
    });
  };

  const updateItem = async (id, updatedData) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'items', id), updatedData);
  };

  const addOutfit = async (outfit) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'outfits'), {
      ...outfit,
      userId: currentUser.uid,
      createdAt: Date.now()
    });
  };

  const removeOutfit = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'outfits', id));
  };

  const updateOutfit = async (id, updatedData) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'outfits', id), updatedData);
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
      loading,
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
