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
      setCategories(catRes.data || []);
      setItems(itemRes.data || []);
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

  const groupedMenu = Object.values(items.reduce((acc, it) => {
    const id = it?.category?._id || 'uncategorized';
    const name = it?.category?.name || 'Uncategorized';
    if (!acc[id]) acc[id] = { name, items: [] };
    acc[id].items.push(it);
    return acc;
  }, {})).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div ref={topRef} className="min-h-screen bg-stone-100 p-4 md:p-12 font-serif">
      {/* Admin Controls - Floating Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-stone-800 text-stone-100 px-6 py-3 rounded-full shadow-2xl border border-gold-500 animate-bounce">
          {toast}
        </div>
      )}

      {/* 1. EDIT FORM SECTION (Contextual Overlay) */}
      {editingItemId && (
        <div className="max-w-2xl mx-auto mb-12 bg-white border-2 border-stone-800 p-8 shadow-[10px_10px_0px_0px_rgba(41,37,36,1)]">
          <h2 className="text-2xl font-bold mb-6 text-stone-800 uppercase tracking-widest border-b-2 border-stone-800 pb-2">
            Modify Selection
          </h2>
          <form onSubmit={updateItem} className="space-y-4 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                ref={nameInputRef}
                value={itemForm.name} 
                onChange={e => setItemForm({ ...itemForm, name: e.target.value })} 
                placeholder="Dish Name" 
                className="p-3 border-2 border-stone-200 focus:border-stone-800 outline-none transition-colors" 
              />
              <input 
                value={itemForm.price} 
                onChange={e => setItemForm({ ...itemForm, price: e.target.value })} 
                placeholder="Price (₹)" 
                type="number" 
                className="p-3 border-2 border-stone-200 focus:border-stone-800 outline-none transition-colors" 
              />
            </div>
            <textarea 
              value={itemForm.description} 
              onChange={e => setItemForm({ ...itemForm, description: e.target.value })} 
              placeholder="Describe the flavors and ingredients..." 
              className="w-full p-3 border-2 border-stone-200 focus:border-stone-800 outline-none transition-colors h-24" 
            />
            <select 
              value={itemForm.category} 
              onChange={e => setItemForm({ ...itemForm, category: e.target.value })} 
              className="w-full p-3 border-2 border-stone-200 focus:border-stone-800 outline-none transition-colors bg-white"
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <div className="flex gap-4 pt-4">
              <button className="flex-1 bg-stone-800 text-white py-3 uppercase tracking-widest font-bold hover:bg-stone-700 transition-colors">
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={() => { setEditingItemId(null); setItemForm({ name: '', description: '', price: '', category: '' }); }}
                className="px-8 border-2 border-stone-800 py-3 uppercase tracking-widest font-bold hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. MAIN MENU CARD */}
      <div className="max-w-5xl mx-auto bg-[#fdfaf6] border-[8px] border-stone-800 shadow-2xl relative overflow-hidden">
        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-stone-400 m-4 opacity-30" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-stone-400 m-4 opacity-30" />
        
        {/* Header Section */}
        <header className="text-center pt-16 pb-12 px-6">
          <div className="inline-block border-y-2 border-stone-800 py-2 mb-4">
            <span className="text-sm uppercase tracking-[0.5em] text-stone-600 px-8">Est. 2025</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-stone-900 uppercase tracking-tighter mb-4">
            The Grand Menu
          </h1>
          <p className="italic text-stone-500 max-w-md mx-auto leading-relaxed">
            Experience a curated selection of artisanal dishes, prepared daily with seasonal ingredients.
          </p>
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
            {groupedMenu.map((section) => (
              <section key={section.name} className="mb-16">
                {/* Category Title */}
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-3xl font-bold text-stone-800 uppercase tracking-widest whitespace-nowrap">
                    {section.name}
                  </h2>
                  <div className="flex-1 h-[2px] bg-stone-200" />
                </div>

                {/* Grid of Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                  {section.items.map((it) => (
                    <div key={it._id} className="group relative">
                      {/* Item Header (Name & Price) */}
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <h3 className="text-lg font-bold text-stone-900 uppercase tracking-tight group-hover:text-stone-600 transition-colors">
                          {it.name}
                        </h3>
                        <div className="flex-1 border-b border-dotted border-stone-400 mx-2 mb-1" />
                        <span className="text-lg font-bold text-stone-800">₹{it.price}</span>
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
                              if (topRef?.current) {
                                topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 0);
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
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="bg-stone-900 text-stone-400 py-10 px-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] mb-2 text-stone-500">Service charge and taxes applicable</p>
          <div className="text-stone-200 font-bold tracking-widest italic">Bon Appétit</div>
        </footer>
      </div>
    </div>
  );
};

export default MenuList;