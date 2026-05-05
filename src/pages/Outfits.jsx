import React, { useState, useRef, useMemo } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { GlassCard } from '../components/GlassCard';
import { Modal } from '../components/Modal';
import { ImageViewer } from '../components/ImageViewer';
import { compressImage } from '../utils/imageCompressor';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Upload, Filter, Sparkles, Pencil, LogOut, FolderPlus, X, Palette } from 'lucide-react';
import './Pages.css';

export const Outfits = () => {
  const { outfits, items, categories, folders, addOutfit, removeOutfit, getOutfitsByItems, updateOutfit, addFolder, removeFolder } = useWardrobe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutfitId, setEditingOutfitId] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const { logout } = useAuth();
  
  // Folder state
  const [activeFolder, setActiveFolder] = useState('all'); // 'all' or folder id
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Filter state
  const [filterMode, setFilterMode] = useState(false);
  const [selectedFilterItems, setSelectedFilterItems] = useState([]);
  const [colorFilterMode, setColorFilterMode] = useState(false);
  const [selectedFilterColors, setSelectedFilterColors] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  
  const fileInputRef = useRef(null);
  const newFolderInputRef = useRef(null);

  // Get unique colors from all items for color filter
  const availableColors = useMemo(() => {
    const colorSet = new Map();
    items.forEach(item => {
      if (item.color) {
        colorSet.set(item.color, true);
      }
    });
    return Array.from(colorSet.keys());
  }, [items]);

  // Get outfits filtered by folder, items, and colors
  const getFilteredOutfits = () => {
    let result = outfits;
    
    // Filter by folder
    if (activeFolder !== 'all') {
      result = result.filter(outfit => 
        outfit.folderIds && outfit.folderIds.includes(activeFolder)
      );
    }
    
    // Filter by items
    if (filterMode && selectedFilterItems.length > 0) {
      result = result.filter(outfit => 
        selectedFilterItems.every(id => outfit.itemIds.includes(id))
      );
    }
    
    // Filter by colors - show outfits that contain at least one item with each selected color
    if (colorFilterMode && selectedFilterColors.length > 0) {
      result = result.filter(outfit => {
        const outfitItemColors = outfit.itemIds
          .map(id => items.find(i => i.id === id))
          .filter(Boolean)
          .map(i => i.color)
          .filter(Boolean);
        return selectedFilterColors.every(c => outfitItemColors.includes(c));
      });
    }
    
    return result;
  };

  const displayedOutfits = getFilteredOutfits();

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
      updateOutfit(editingOutfitId, { name, image, itemIds: selectedItems, folderIds: selectedFolderIds });
    } else {
      addOutfit({ name, image, itemIds: selectedItems, folderIds: selectedFolderIds });
    }
    setIsModalOpen(false);
    
    // Reset form
    setEditingOutfitId(null);
    setName('');
    setImage(null);
    setSelectedItems([]);
    setSelectedFolderIds([]);
  };

  const openAddModal = () => {
    setEditingOutfitId(null);
    setName('');
    setImage(null);
    setSelectedItems([]);
    // Pre-select current folder if viewing one
    setSelectedFolderIds(activeFolder !== 'all' ? [activeFolder] : []);
    setIsModalOpen(true);
  };

  const openEditModal = (outfit) => {
    setEditingOutfitId(outfit.id);
    setName(outfit.name);
    setImage(outfit.image);
    setSelectedItems(outfit.itemIds);
    setSelectedFolderIds(outfit.folderIds || []);
    setIsModalOpen(true);
  };

  const toggleItemSelection = (id, list, setList) => {
    if (list.includes(id)) {
      setList(list.filter(itemId => itemId !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleDeleteFolder = (folderId) => {
    if (activeFolder === folderId) {
      setActiveFolder('all');
    }
    removeFolder(folderId);
  };

  const activeFolderName = activeFolder === 'all' 
    ? 'Todos' 
    : folders.find(f => f.id === activeFolder)?.name || 'Todos';

  const toggleColorFilter = (hex) => {
    if (selectedFilterColors.includes(hex)) {
      setSelectedFilterColors(selectedFilterColors.filter(c => c !== hex));
    } else {
      setSelectedFilterColors([...selectedFilterColors, hex]);
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
            title="Filtrar por peças"
          >
            <Filter size={20} />
          </button>
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

      {/* Folders Navigation */}
      <div className="folders-bar glass">
        <div className="folders-scroll">
          <button 
            className={`folder-pill ${activeFolder === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFolder('all')}
          >
            Todos
          </button>
          {folders.map(folder => (
            <div key={folder.id} className="folder-pill-wrapper">
              <button 
                className={`folder-pill ${activeFolder === folder.id ? 'active' : ''}`}
                onClick={() => setActiveFolder(folder.id)}
              >
                {folder.name}
              </button>
              {activeFolder === folder.id && (
                <button 
                  className="folder-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  title="Apagar pasta"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {showNewFolderInput ? (
            <div className="new-folder-input-wrapper">
              <input
                ref={newFolderInputRef}
                type="text"
                className="new-folder-input"
                placeholder="Nome da pasta..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddFolder();
                  if (e.key === 'Escape') { setShowNewFolderInput(false); setNewFolderName(''); }
                }}
                autoFocus
              />
              <button className="folder-pill add-folder-confirm" onClick={handleAddFolder}>
                ✓
              </button>
              <button className="folder-pill add-folder-cancel" onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }}>
                ✕
              </button>
            </div>
          ) : (
            <button 
              className="folder-pill add-folder-btn"
              onClick={() => setShowNewFolderInput(true)}
              title="Nova Pasta"
            >
              <FolderPlus size={16} />
            </button>
          )}
        </div>
      </div>

      {filterMode && (
        <div className="filter-section glass animate-fade-in">
          <h3>Filtrar por Peças:</h3>
          <p className="text-sm">Seleciona peças para ver em que outfits são usadas.</p>
          <div className="filter-items-container">
            {categories.map(category => {
              const categoryItems = items.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;
              return (
                <div key={`filter-cat-${category}`} className="category-group">
                  <h4 className="category-title">{category}</h4>
                  <div className="filter-items-grid">
                    {categoryItems.map(item => (
                      <div 
                        key={`filter-${item.id}`}
                        className={`filter-item ${selectedFilterItems.includes(item.id) ? 'selected' : ''}`}
                        onClick={() => toggleItemSelection(item.id, selectedFilterItems, setSelectedFilterItems)}
                      >
                        <img src={item.image} alt={item.name} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {items.filter(item => !categories.includes(item.category)).length > 0 && (
              <div key="filter-cat-others" className="category-group">
                <h4 className="category-title">Outros</h4>
                <div className="filter-items-grid">
                  {items.filter(item => !categories.includes(item.category)).map(item => (
                    <div 
                      key={`filter-${item.id}`}
                      className={`filter-item ${selectedFilterItems.includes(item.id) ? 'selected' : ''}`}
                      onClick={() => toggleItemSelection(item.id, selectedFilterItems, setSelectedFilterItems)}
                    >
                      <img src={item.image} alt={item.name} />
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* Color Filter */}
      {colorFilterMode && (
        <div className="filter-section glass animate-fade-in">
          <h3>Filtrar por Cor:</h3>
          <p className="text-sm">Seleciona cores para encontrar outfits que contenham peças dessas cores.</p>
          <div className="color-filter-grid">
            {availableColors.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Adiciona cores às tuas peças para poderes filtrar.
              </p>
            ) : (
              availableColors.map(hex => (
                <button
                  key={`outfit-color-filter-${hex}`}
                  className={`color-filter-dot ${selectedFilterColors.includes(hex) ? 'selected' : ''}`}
                  style={{ '--dot-color': hex }}
                  onClick={() => toggleColorFilter(hex)}
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

      {displayedOutfits.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={48} className="empty-icon" />
          <p>
            {filterMode 
              ? "Nenhum outfit encontrado com estas peças." 
              : activeFolder !== 'all'
                ? `Nenhum outfit na pasta "${activeFolderName}".`
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
                {outfit.folderIds && outfit.folderIds.length > 0 && (
                  <div className="outfit-folder-tags">
                    {outfit.folderIds.map(fId => {
                      const folder = folders.find(f => f.id === fId);
                      return folder ? (
                        <span key={fId} className="folder-tag">{folder.name}</span>
                      ) : null;
                    })}
                  </div>
                )}
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

          {/* Folder selection */}
          <div className="form-group">
            <label>Pastas ({selectedFolderIds.length})</label>
            {folders.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Cria pastas primeiro para organizar os teus outfits.
              </p>
            ) : (
              <div className="folder-select-grid">
                {folders.map(folder => (
                  <div 
                    key={`folder-select-${folder.id}`}
                    className={`folder-select-item ${selectedFolderIds.includes(folder.id) ? 'selected' : ''}`}
                    onClick={() => toggleItemSelection(folder.id, selectedFolderIds, setSelectedFolderIds)}
                  >
                    {folder.name}
                    {selectedFolderIds.includes(folder.id) && (
                      <span className="folder-check">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Peças Usadas ({selectedItems.length})</label>
            {items.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Adiciona peças no guarda-roupa primeiro.
              </p>
            ) : (
              <div className="select-items-container">
                {categories.map(category => {
                  const categoryItems = items.filter(item => item.category === category);
                  if (categoryItems.length === 0) return null;
                  return (
                    <div key={`select-cat-${category}`} className="category-group">
                      <h4 className="category-title">{category}</h4>
                      <div className="select-items-grid">
                        {categoryItems.map(item => (
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
                    </div>
                  );
                })}
                {items.filter(item => !categories.includes(item.category)).length > 0 && (
                  <div key="select-cat-others" className="category-group">
                    <h4 className="category-title">Outros</h4>
                    <div className="select-items-grid">
                      {items.filter(item => !categories.includes(item.category)).map(item => (
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
                  </div>
                )}
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
