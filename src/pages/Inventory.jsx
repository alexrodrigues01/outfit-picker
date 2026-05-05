import React, { useState, useRef, useMemo } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { GlassCard } from '../components/GlassCard';
import { Modal } from '../components/Modal';
import { ImageViewer } from '../components/ImageViewer';
import { compressImage } from '../utils/imageCompressor';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Upload, Image as ImageIcon, Pencil, LogOut, Palette } from 'lucide-react';
import './Pages.css';

const PRESET_COLORS = [
  { name: 'Preto', hex: '#1a1a1a' },
  { name: 'Branco', hex: '#f5f5f5' },
  { name: 'Cinzento', hex: '#9ca3af' },
  { name: 'Bege', hex: '#d4b896' },
  { name: 'Castanho', hex: '#8B4513' },
  { name: 'Azul Marinho', hex: '#1e3a5f' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Azul Claro', hex: '#93c5fd' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Verde Escuro', hex: '#15803d' },
  { name: 'Vermelho', hex: '#ef4444' },
  { name: 'Bordeaux', hex: '#722f37' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Rosa Claro', hex: '#f9a8d4' },
  { name: 'Lilás', hex: '#a78bfa' },
  { name: 'Laranja', hex: '#f97316' },
  { name: 'Amarelo', hex: '#eab308' },
  { name: 'Creme', hex: '#fffdd0' },
];

export const Inventory = () => {
  const { categories, items, getItemsByCategory, addItem, removeItem, addCategory, updateItem } = useWardrobe();
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  
  // Color filter state
  const [colorFilterMode, setColorFilterMode] = useState(false);
  const [selectedFilterColors, setSelectedFilterColors] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Tops');
  const [image, setImage] = useState(null);
  const [color, setColor] = useState('');
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#6366f1');
  
  const { logout } = useAuth();
  const fileInputRef = useRef(null);

  // Get unique colors from all items
  const availableColors = useMemo(() => {
    const colorSet = new Map();
    items.forEach(item => {
      if (item.color) {
        colorSet.set(item.color, true);
      }
    });
    return Array.from(colorSet.keys());
  }, [items]);

  // Filter items by category and color
  const filteredItems = useMemo(() => {
    let result = getItemsByCategory(activeCategory);
    if (colorFilterMode && selectedFilterColors.length > 0) {
      result = result.filter(item => item.color && selectedFilterColors.includes(item.color));
    }
    return result;
  }, [activeCategory, colorFilterMode, selectedFilterColors, getItemsByCategory]);

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
      updateItem(editingItemId, { name, category, image, color: color || null });
    } else {
      addItem({ name, category, image, color: color || null });
    }
    setIsModalOpen(false);
    
    // Reset form
    setEditingItemId(null);
    setName('');
    setCategory(categories[0]);
    setImage(null);
    setColor('');
    setShowCustomColorPicker(false);
  };

  const openAddModal = () => {
    setEditingItemId(null);
    setName('');
    setCategory(categories[0]);
    setImage(null);
    setColor('');
    setShowCustomColorPicker(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItemId(item.id);
    setName(item.name);
    setCategory(item.category);
    setImage(item.image);
    setColor(item.color || '');
    setShowCustomColorPicker(false);
    setIsModalOpen(true);
  };

  const toggleColorFilter = (hex) => {
    if (selectedFilterColors.includes(hex)) {
      setSelectedFilterColors(selectedFilterColors.filter(c => c !== hex));
    } else {
      setSelectedFilterColors([...selectedFilterColors, hex]);
    }
  };

  const getColorName = (hex) => {
    const preset = PRESET_COLORS.find(c => c.hex === hex);
    return preset ? preset.name : hex;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-gradient">O Meu Armário</h1>
        <div className="header-actions">
          <button 
            className={`glass-button ${colorFilterMode ? 'active-filter' : ''}`}
            onClick={() => setColorFilterMode(!colorFilterMode)}
            style={{ padding: '10px' }}
            title="Filtrar por cor"
          >
            <Palette size={20} />
          </button>
          <button className="glass-button primary" onClick={openAddModal}>
            <Plus size={20} />
            <span>Adicionar</span>
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

      {/* Color Filter */}
      {colorFilterMode && (
        <div className="filter-section glass animate-fade-in">
          <h3>Filtrar por Cor:</h3>
          <p className="text-sm">Seleciona cores para filtrar as peças.</p>
          <div className="color-filter-grid">
            {availableColors.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Adiciona cores às tuas peças para poderes filtrar.
              </p>
            ) : (
              availableColors.map(hex => (
                <button
                  key={`color-filter-${hex}`}
                  className={`color-filter-dot ${selectedFilterColors.includes(hex) ? 'selected' : ''}`}
                  style={{ '--dot-color': hex }}
                  onClick={() => toggleColorFilter(hex)}
                  title={getColorName(hex)}
                >
                  {selectedFilterColors.includes(hex) && <span className="color-check">✓</span>}
                </button>
              ))
            )}
          </div>
          {selectedFilterColors.length > 0 && (
            <button 
              className="clear-filter"
              onClick={() => setSelectedFilterColors([])}
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <ImageIcon size={48} className="empty-icon" />
          <p>
            {colorFilterMode && selectedFilterColors.length > 0
              ? "Nenhuma peça encontrada com estas cores."
              : "Ainda não tens peças nesta categoria."}
          </p>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map(item => (
            <GlassCard 
              key={item.id} 
              className="item-card"
              onClick={() => setViewImage(item.image)}
            >
              <div className="item-image-container">
                <img src={item.image} alt={item.name} className="item-image" />
                {item.color && (
                  <div 
                    className="item-color-dot"
                    style={{ backgroundColor: item.color }}
                    title={getColorName(item.color)}
                  />
                )}
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

          {/* Color Picker */}
          <div className="form-group">
            <label>Cor {color && <span className="color-label-preview" style={{ backgroundColor: color }} />}</label>
            <div className="color-picker-grid">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  className={`color-dot ${color === c.hex ? 'selected' : ''}`}
                  style={{ '--dot-color': c.hex }}
                  onClick={() => { setColor(c.hex); setShowCustomColorPicker(false); }}
                  title={c.name}
                />
              ))}
              <button
                type="button"
                className={`color-dot custom-color-dot ${showCustomColorPicker ? 'selected' : ''}`}
                style={{ '--dot-color': 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                title="Cor personalizada"
              />
            </div>
            {showCustomColorPicker && (
              <div className="custom-color-row">
                <input
                  type="color"
                  className="custom-color-input"
                  value={customColor}
                  onChange={(e) => { setCustomColor(e.target.value); setColor(e.target.value); }}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {customColor}
                </span>
              </div>
            )}
            {color && (
              <button 
                type="button" 
                className="clear-filter" 
                onClick={() => { setColor(''); setShowCustomColorPicker(false); }}
                style={{ marginTop: '4px' }}
              >
                Remover cor
              </button>
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
            if (categories.length === 0) setCategory(newCategoryName.trim());
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
