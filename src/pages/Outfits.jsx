import React, { useState, useRef } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { GlassCard } from '../components/GlassCard';
import { Modal } from '../components/Modal';
import { ImageViewer } from '../components/ImageViewer';
import { compressImage } from '../utils/imageCompressor';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Upload, Filter, Sparkles, Pencil, LogOut } from 'lucide-react';
import './Pages.css';

export const Outfits = () => {
  const { outfits, items, addOutfit, removeOutfit, getOutfitsByItems, updateOutfit } = useWardrobe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutfitId, setEditingOutfitId] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const { logout } = useAuth();
  
  // Filter state
  const [filterMode, setFilterMode] = useState(false);
  const [selectedFilterItems, setSelectedFilterItems] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  
  const fileInputRef = useRef(null);

  const displayedOutfits = filterMode && selectedFilterItems.length > 0
    ? getOutfitsByItems(selectedFilterItems)
    : outfits;

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

  const handleAddOutfit = (e) => {
    e.preventDefault();
    if (!name || !image) return;
    
    if (editingOutfitId) {
      updateOutfit(editingOutfitId, { name, image, itemIds: selectedItems });
    } else {
      addOutfit({ name, image, itemIds: selectedItems });
    }
    setIsModalOpen(false);
    
    // Reset form
    setEditingOutfitId(null);
    setName('');
    setImage(null);
    setSelectedItems([]);
  };

  const openAddModal = () => {
    setEditingOutfitId(null);
    setName('');
    setImage(null);
    setSelectedItems([]);
    setIsModalOpen(true);
  };

  const openEditModal = (outfit) => {
    setEditingOutfitId(outfit.id);
    setName(outfit.name);
    setImage(outfit.image);
    setSelectedItems(outfit.itemIds);
    setIsModalOpen(true);
  };

  const toggleItemSelection = (id, list, setList) => {
    if (list.includes(id)) {
      setList(list.filter(itemId => itemId !== id));
    } else {
      setList([...list, id]);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-gradient">Outfits</h1>
        <div className="header-actions">
          <button 
            className={`glass-button ${filterMode ? 'active-filter' : ''}`}
            onClick={() => setFilterMode(!filterMode)}
            style={{ padding: '10px' }}
          >
            <Filter size={20} />
          </button>
          <button className="glass-button primary" onClick={openAddModal}>
            <Plus size={20} />
            <span>Criar</span>
          </button>
          <button 
            className="glass-button" 
            onClick={logout}
            title="Sair da Conta"
            style={{ padding: '10px' }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {filterMode && (
        <div className="filter-section glass animate-fade-in">
          <h3>Filtrar por Peças:</h3>
          <p className="text-sm">Seleciona peças para ver em que outfits são usadas.</p>
          <div className="filter-items-grid">
            {items.map(item => (
              <div 
                key={`filter-${item.id}`}
                className={`filter-item ${selectedFilterItems.includes(item.id) ? 'selected' : ''}`}
                onClick={() => toggleItemSelection(item.id, selectedFilterItems, setSelectedFilterItems)}
              >
                <img src={item.image} alt={item.name} />
              </div>
            ))}
          </div>
          {selectedFilterItems.length > 0 && (
            <button 
              className="clear-filter"
              onClick={() => setSelectedFilterItems([])}
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      {displayedOutfits.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={48} className="empty-icon" />
          <p>
            {filterMode 
              ? "Nenhum outfit encontrado com estas peças." 
              : "Ainda não tens outfits guardados."}
          </p>
        </div>
      ) : (
        <div className="items-grid">
          {displayedOutfits.map(outfit => (
            <GlassCard 
              key={outfit.id} 
              className="item-card outfit-card"
              onClick={() => setViewImage(outfit.image)}
            >
              <div className="item-image-container">
                <img src={outfit.image} alt={outfit.name} className="item-image" />
                <div className="card-actions">
                  <button 
                    className="action-button edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(outfit);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    className="action-button delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOutfit(outfit.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="item-info">
                <h3>{outfit.name}</h3>
                <div className="outfit-items-preview">
                  {outfit.itemIds.slice(0, 4).map(itemId => {
                    const item = items.find(i => i.id === itemId);
                    return item ? (
                      <img key={`preview-${itemId}`} src={item.image} alt="piece" className="mini-preview" />
                    ) : null;
                  })}
                  {outfit.itemIds.length > 4 && (
                    <div className="mini-preview more-count">
                      +{outfit.itemIds.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingOutfitId ? "Editar Outfit" : "Novo Outfit"}
      >
        <form onSubmit={handleAddOutfit} className="add-form">
          <div 
            className="image-upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <Upload size={32} />
                <span>Carregar Foto do Look</span>
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
            <label>Nome do Outfit</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Ex: Look Jantar Sexta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Peças Usadas ({selectedItems.length})</label>
            {items.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Adiciona peças no guarda-roupa primeiro.
              </p>
            ) : (
              <div className="select-items-grid">
                {items.map(item => (
                  <div 
                    key={`select-${item.id}`}
                    className={`filter-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                    onClick={() => toggleItemSelection(item.id, selectedItems, setSelectedItems)}
                  >
                    <img src={item.image} alt={item.name} />
                    {selectedItems.includes(item.id) && (
                      <div className="selected-overlay">
                        <div className="checkmark">✓</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
              {editingOutfitId ? "Atualizar" : "Guardar"}
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
