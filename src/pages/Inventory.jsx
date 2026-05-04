import React, { useState, useRef } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { GlassCard } from '../components/GlassCard';
import { Modal } from '../components/Modal';
import { ImageViewer } from '../components/ImageViewer';
import { compressImage } from '../utils/imageCompressor';
import { Plus, Trash2, Upload, Image as ImageIcon, Pencil } from 'lucide-react';
import './Pages.css';

export const Inventory = () => {
  const { categories, getItemsByCategory, addItem, removeItem, addCategory, updateItem } = useWardrobe();
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [image, setImage] = useState(null);
  
  const fileInputRef = useRef(null);

  const items = getItemsByCategory(activeCategory);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 800, 800, 0.7);
        setImage(compressedBase64);
      } catch (err) {
        console.error("Erro ao comprimir imagem:", err);
      }
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!name || !image) return;
    
    if (editingItemId) {
      updateItem(editingItemId, { name, category, image });
    } else {
      addItem({ name, category, image });
    }
    setIsModalOpen(false);
    
    // Reset form
    setEditingItemId(null);
    setName('');
    setCategory(categories[0]);
    setImage(null);
  };

  const openAddModal = () => {
    setEditingItemId(null);
    setName('');
    setCategory(categories[0]);
    setImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItemId(item.id);
    setName(item.name);
    setCategory(item.category);
    setImage(item.image);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-gradient">Guarda-Roupa</h1>
        <button className="glass-button primary" onClick={openAddModal}>
          <Plus size={20} />
          <span>Adicionar</span>
        </button>
      </div>

      <div className="categories-scroll glass">
        <button 
          className={`category-pill ${activeCategory === 'Todas' ? 'active' : ''}`}
          onClick={() => setActiveCategory('Todas')}
        >
          Todas
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
        <button 
          className="category-pill"
          onClick={() => setIsCategoryModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', borderStyle: 'dashed', borderColor: 'var(--accent-pink-light)' }}
        >
          <Plus size={14} /> Nova
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <ImageIcon size={48} className="empty-icon" />
          <p>Ainda não tens peças nesta categoria.</p>
        </div>
      ) : (
        <div className="items-grid">
          {items.map(item => (
            <GlassCard 
              key={item.id} 
              className="item-card"
              onClick={() => setViewImage(item.image)}
            >
              <div className="item-image-container">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="card-actions">
                  <button 
                    className="action-button edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    className="action-button delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="item-info">
                <h3>{item.name}</h3>
                <span className="item-category">{item.category}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingItemId ? "Editar Peça" : "Nova Peça de Roupa"}
      >
        <form onSubmit={handleAddItem} className="add-form">
          <div 
            className="image-upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <Upload size={32} />
                <span>Carregar Foto</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group">
            <label>Nome da Peça</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Ex: T-shirt Branca Básica"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <select 
              className="glass-input glass-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button 
              type="button" 
              className="glass-button w-full"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="glass-button primary w-full"
              disabled={!name || !image}
            >
              {editingItemId ? "Atualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Nova Categoria"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setActiveCategory(newCategoryName.trim());
            if (categories.length === 0) setCategory(newCategoryName.trim()); // Update selected category in main modal if it was empty
            setIsCategoryModalOpen(false);
            setNewCategoryName('');
          }
        }} className="add-form">
          <div className="form-group">
            <label>Nome da Categoria</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Ex: Casacos de Inverno"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
          </div>
          <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button 
              type="button" 
              className="glass-button w-full"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="glass-button primary w-full" disabled={!newCategoryName.trim()}>
              Adicionar
            </button>
          </div>
        </form>
      </Modal>

      <ImageViewer 
        isOpen={!!viewImage} 
        imageUrl={viewImage} 
        onClose={() => setViewImage(null)} 
      />
    </div>
  );
};
