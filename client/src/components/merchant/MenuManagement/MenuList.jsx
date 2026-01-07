import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/apiConfig';

const MenuList = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', category: '' });
  const [editingItemId, setEditingItemId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categoryToDelete, setCategoryToDelete] = useState('');
  const topRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    const handler = () => fetchData();
    window.addEventListener('menuUpdated', handler);
    return () => window.removeEventListener('menuUpdated', handler);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) return { headers: { Authorization: `Bearer ${token}` } };
    } catch (e) {}
    return {};
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, itemRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/menu/categories`),
        axios.get(`${API_BASE_URL}/menu/items`)
      ]);
      const fetchedCats = catRes.data || [];
      setCategories(fetchedCats);
      setItems(itemRes.data || []);
      if (activeCategory !== 'All' && !fetchedCats.some(c => c.name === activeCategory)) {
        setActiveCategory('All');
      }
      if (categoryToDelete && !fetchedCats.some(c => c._id === categoryToDelete)) {
        setCategoryToDelete('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setToast(null);
      await axios.put(`${API_BASE_URL}/menu/items/${editingItemId}`, itemForm, getAuthHeaders());
      setItemForm({ name: '', description: '', price: '', category: '' });
      setEditingItemId(null);
      setToast('Item updated successfully');
      fetchData();
      window.dispatchEvent(new CustomEvent('menuUpdated'));
    } catch (err) {
      setToast('Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = ['All', ...new Set((categories || []).map(c => c.name || 'Uncategorized'))];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(it => (it.category?.name || 'Uncategorized') === activeCategory);

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Delete category "${categoryName}"? Items in this category must be reassigned first.`)) return;
    try {
      setSubmitting(true);
      await axios.delete(`${API_BASE_URL}/menu/categories/${categoryId}`, getAuthHeaders());
      setToast('Category deleted');
      await fetchData();
    } catch (err) {
      const reason = err?.response?.data?.message || err.message || 'Delete failed';
      setToast(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={topRef} className="min-h-screen bg-stone-100 p-4 md:p-12 font-serif">
      {/* Admin Controls - Floating Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-stone-800 text-stone-100 px-6 py-3 rounded-full shadow-2xl border border-gold-500 animate-bounce">
          {toast}
        </div>
      )}

      {/* MAIN MENU CARD */}
      <div className="max-w-5xl mx-auto bg-[#fdfaf6] border-[8px] border-stone-800 shadow-2xl relative overflow-hidden">
        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-stone-400 m-4 opacity-30" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-stone-400 m-4 opacity-30" />
        
        {/* Header Section */}
        <header className="text-center pt-16 pb-12 px-6">
          {/* <div className="inline-block border-y-2 border-stone-800 py-2 mb-4">
            <span className="text-sm uppercase tracking-[0.5em] text-stone-600 px-8">Est. 2025</span>
          </div> */}
          <h1 className="text-5xl md:text-7xl font-black text-stone-900 uppercase tracking-tighter mb-4">
           Our Menu
          </h1>
          {/* <p className="italic text-stone-500 max-w-md mx-auto leading-relaxed">
            Experience a curated selection of artisanal dishes, prepared daily with seasonal ingredients.
          </p> */}
          <div className="mt-8 flex justify-center items-center gap-4">
            <div className="h-px w-20 bg-stone-300" />
            <div className="w-2 h-2 rotate-45 bg-stone-800" />
            <div className="h-px w-20 bg-stone-300" />
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-stone-400 uppercase tracking-widest">Preparing Kitchen...</div>
        ) : (
          <div className="px-8 md:px-20 pb-20">
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {categoryOptions.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-sm rounded-full border transition-colors ${activeCategory === cat ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-stone-700 border-stone-200 hover:border-amber-400 hover:text-amber-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="max-w-xl mx-auto mb-8 p-4 bg-white border border-stone-200 rounded-lg shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Delete a category</label>
                  <select
                    value={categoryToDelete}
                    onChange={e => setCategoryToDelete(e.target.value)}
                    className="w-full border border-stone-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const cat = categories.find(c => c._id === categoryToDelete);
                    if (!cat) return;
                    handleDeleteCategory(cat._id, cat.name);
                  }}
                  disabled={!categoryToDelete || submitting}
                  className={`px-4 py-2 mt-2 md:mt-6 text-sm font-semibold rounded ${categoryToDelete && !submitting ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-stone-200 text-stone-500 cursor-not-allowed'}`}
                >
                  Delete
                </button>
              </div>
              {/* <p className="text-[11px] text-stone-500 mt-2">You can delete only empty categories with no subcategories or items.</p> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center text-stone-400 italic">No items found in this category.</div>
              ) : (
                filteredItems.map((it) => (
                  <div key={it._id} className="group relative">
                    {editingItemId === it._id ? (
                      <form onSubmit={updateItem} className="bg-stone-50 p-4 rounded border-2 border-stone-300">
                        <h3 className="text-sm font-bold mb-3 text-stone-800 uppercase">Edit Item</h3>
                        <div className="space-y-3">
                          <input 
                            ref={nameInputRef}
                            value={itemForm.name} 
                            onChange={e => setItemForm({ ...itemForm, name: e.target.value })} 
                            placeholder="Dish Name" 
                            className="w-full p-2 border border-stone-300 rounded text-sm" 
                          />
                          <input 
                            value={itemForm.price} 
                            onChange={e => setItemForm({ ...itemForm, price: e.target.value })} 
                            placeholder="Price (₹)" 
                            type="number" 
                            className="w-full p-2 border border-stone-300 rounded text-sm" 
                          />
                          <textarea 
                            value={itemForm.description} 
                            onChange={e => setItemForm({ ...itemForm, description: e.target.value })} 
                            placeholder="Description" 
                            className="w-full p-2 border border-stone-300 rounded text-sm h-20" 
                          />
                          <select 
                            value={itemForm.category} 
                            onChange={e => setItemForm({ ...itemForm, category: e.target.value })} 
                            className="w-full p-2 border border-stone-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                            disabled
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                          </select>
                          <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-stone-800 text-white py-2 text-xs uppercase font-bold hover:bg-stone-700">
                              Save
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { setEditingItemId(null); setItemForm({ name: '', description: '', price: '', category: '' }); }}
                              className="px-4 border border-stone-800 py-2 text-xs uppercase font-bold hover:bg-stone-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <>
                        {/* Item Header (Name & Price) */}
                        <div className="flex justify-between items-baseline gap-2 mb-1">
                          <h3 className="text-lg font-bold text-stone-900 uppercase tracking-tight group-hover:text-stone-600 transition-colors">
                            {it.name}
                          </h3>
                          <div className="flex-1 border-b border-dotted border-stone-400 mx-2 mb-1" />
                          <span className="text-base font-normal text-stone-700">₹{Number(it.price || 0).toLocaleString()}</span>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-stone-500 italic leading-snug pr-12">
                          {it.description || "Freshly prepared with our signature house blend of spices and herbs."}
                        </p>

                        {/* Admin Quick Actions (Visible on Hover) */}
                        <div className="mt-3 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                          <button 
                            onClick={() => {
                              setEditingItemId(it._id);
                              setItemForm({ name: it.name, description: it.description, price: it.price, category: it.category?._id });
                              setTimeout(() => {
                                try { nameInputRef.current && nameInputRef.current.focus(); } catch (e) {}
                              }, 100);
                            }}
                            className="text-[10px] uppercase font-bold tracking-widest text-stone-400 hover:text-stone-900 border-b border-transparent hover:border-stone-900"
                          >
                            Edit Item
                          </button>
                          <button 
                            onClick={async () => {
                              if (!window.confirm('Remove from menu?')) return;
                              try {
                                setSubmitting(true);
                                await axios.delete(`${API_BASE_URL}/menu/items/${it._id}`, getAuthHeaders());
                                setToast('Item Removed');
                                fetchData();
                              } catch (e) { setToast('Error removing item'); } finally { setSubmitting(false); }
                            }}
                            className="text-[10px] uppercase font-bold tracking-widest text-red-300 hover:text-red-700 border-b border-transparent hover:border-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {/* <footer className="bg-stone-900 text-stone-400 py-10 px-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] mb-2 text-stone-500">Service charge and taxes applicable</p>
          <div className="text-stone-200 font-bold tracking-widest italic">Bon Appétit</div>
        </footer> */}
      </div>
    </div>
  );
};

export default MenuList;