// --- Validation helper for item form ---
function validateItemForm(item) {
  if (!item.name || !item.name.trim()) return 'Item name is required';
  if (!item.description || !item.description.trim()) return 'Description is required';
  if (!item.category) return 'Category is required';
  if (!item.price || isNaN(item.price) || Number(item.price) <= 0) return 'Price must be a positive number';
  return null;
}
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../../../store/slices/menuSlice';
import axios from 'axios';
import API_BASE_URL from '../../../config/apiConfig';

const MenuManagement = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.menu);
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState('');
  const [parentCat, setParentCat] = useState('');

  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', category: '', image: null });
  const [editingItemId, setEditingItemId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [excelStatus, setExcelStatus] = useState(null);

  const topRef = useRef(null);
  const nameInputRef = useRef(null);

  // Prevent duplicate category (case-insensitive, trimmed, no whitespace diff)
  const isDuplicateCategory = (name, parentId = null) => {
    const normalizedName = (name || '').replace(/\s+/g, '').toLowerCase();
    const normalizedParent = parentId || null;
    return categories.some(c => {
      const existingParent = c && c.parent ? c.parent.toString() : null;
      return (c.name || '').replace(/\s+/g, '').toLowerCase() === normalizedName && existingParent === normalizedParent;
    });
  };

  useEffect(() => {
    dispatch(fetchMenuItems());
    fetchCategories();
  }, [dispatch]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/menu/categories`);
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // All data is now managed via Redux thunks/selectors. No direct API calls here.

  // Build auth headers if token exists in localStorage
  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) return { headers: { Authorization: `Bearer ${token}` } };
    } catch (e) {
      // ignore
    }
    return {};
  };

  const createCategory = async (e) => {
    e.preventDefault();
    const trimmedName = (catName || '').trim();
    const parentTarget = parentCat || null;
    if (!trimmedName) {
      setToast('Please enter a category name');
      return;
    }
    // Disallow names with only spaces or empty after trimming
    if (trimmedName.replace(/\s+/g, '') === '') {
      setToast('Category name cannot be empty or only spaces');
      return;
    }
    if (isDuplicateCategory(trimmedName, parentTarget)) {
      setToast('Category already exists at this level');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/menu/categories`, { name: trimmedName, parent: parentTarget });
      setCatName('');
      setParentCat('');
      fetchCategories();
      window.dispatchEvent(new CustomEvent('menuUpdated'));
    } catch (err) {
      console.error(err);
      const reason = err?.response?.data?.message || err.message || 'Failed to create category';
      setToast(reason);
    }
  };

  const createOrUpdateItem = async (e) => {
    e.preventDefault();
    const validationError = validateItemForm(itemForm);
    if (validationError) {
      setToast(validationError);
      return;
    }
    // Check for duplicate item name within the same category when creating (not editing)
    if (!editingItemId) {
      const trimmedName = itemForm.name.trim().toLowerCase();
      console.log('Checking duplicates:', { trimmedName, category: itemForm.category, items });
      const isDuplicate = items.some(item => {
        const nameMatch = item.name.trim().toLowerCase() === trimmedName;
        const categoryMatch = item.category?._id === itemForm.category;
        console.log('Item check:', { itemName: item.name, itemCategory: item.category?._id, nameMatch, categoryMatch });
        return nameMatch && categoryMatch;
      });
      console.log('Is duplicate?', isDuplicate);
      if (isDuplicate) {
        setToast('An item with this name already exists in this category. Please use a different name.');
        return;
      }
    }
    try {
      setSubmitting(true);
      setToast(null);
      const form = new FormData();
      form.append('name', itemForm.name.trim());
      form.append('description', itemForm.description.trim());
      form.append('price', parseFloat(itemForm.price));
      form.append('category', itemForm.category);
      if (itemForm.image) form.append('image', itemForm.image);
      if (editingItemId) {
        await axios.put(`${API_BASE_URL}/menu/items/${editingItemId}`, form);
      } else {
        await axios.post(`${API_BASE_URL}/menu/items`, form);
      }
      setItemForm({ name: '', description: '', price: '', category: '', image: null });
      setEditingItemId(null);
      setToast(editingItemId ? 'Item updated' : 'Item created');
      dispatch(fetchMenuItems());
      window.dispatchEvent(new CustomEvent('menuUpdated'));
    } catch (err) {
      console.error(err);
      // Check if it's a duplicate error from backend
      if (err.response?.status === 409) {
        setToast(err.response.data.message || 'Item already exists in this category');
      } else {
        const errorMsg = err.response?.data?.message || 'Failed to save item';
        setToast(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const uploadExcel = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      setExcelStatus('No file selected');
      return;
    }
    try {
      setExcelStatus('Uploading...');
      const form = new FormData();
      form.append('file', excelFile);
      const res = await axios.post(`${API_BASE_URL}/menu/upload-excel`, form);
      const msg = (res && res.data && res.data.message) ? res.data.message : 'File uploaded successfully';
      setExcelStatus(msg);
      setExcelFile(null);
      dispatch(fetchMenuItems());
      window.dispatchEvent(new CustomEvent('menuUpdated'));
      setTimeout(() => setExcelStatus(null), 4000);
    } catch (err) {
      console.error('Excel upload error', err);
      const reason = err && err.response && err.response.data && err.response.data.message ? err.response.data.message : (err.message || 'Upload failed');
      setExcelStatus(`Upload failed: ${reason}`);
      setTimeout(() => setExcelStatus(null), 6000);
    }
  };

  return (
    <div ref={topRef} className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Menu Management </h1>
      {toast && <div className="mb-3 p-2 bg-red-100 text-green-800 rounded">{toast}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-2">Create Category / Subcategory</h2>
          <form onSubmit={createCategory} className="space-y-2">
            <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="Category name" className="w-full p-2 border rounded" />
            <select value={parentCat} onChange={e => setParentCat(e.target.value)} className="w-full p-2 border rounded">
              <option value="">-- No parent (top-level) --</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
          </form>
        </div>

        {!editingItemId && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">Add Menu Item</h2>
            <form onSubmit={createOrUpdateItem} className="space-y-2">
              <input ref={nameInputRef} value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Item name" className="w-full p-2 border rounded" />
              <textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Description" className="w-full p-2 border rounded" />
              <input value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} placeholder="Price" type="number" className="w-full p-2 border rounded" />
              <select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} className="w-full p-2 border rounded">
                <option value="">-- Select category --</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={e => setItemForm({ ...itemForm, image: e.target.files[0] })} />
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded" disabled={submitting}>Add Item</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Upload Menu via Excel</h2>
        <form onSubmit={uploadExcel} className="flex gap-2 items-center">
          <input type="file" accept=".xlsx,.xls" onChange={e => { const f = e.target.files[0]; console.log('Excel selected:', f); setExcelFile(f); }} />
          <div className="text-sm text-gray-700">{excelFile ? `Selected: ${excelFile.name}` : 'No file chosen'}</div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={!excelFile} title={!excelFile ? 'Choose a file first' : 'Upload Excel file'}>Upload</button>
        </form>
        <p className="text-sm text-gray-500 mt-2">Excel columns: Category, Subcategory, ItemName, Description, Price, ImageUrl (optional)</p>
        {excelStatus && (
          <div className={`mt-2 text-sm ${excelStatus.toLowerCase().includes('failed') || excelStatus.toLowerCase().includes('upload failed') ? 'text-red-600' : 'text-green-600'}`}>
            {excelStatus}
          </div>
        )}
      </div>

      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Existing Items</h2>
        {loading ? <div>Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {items.map(it => (
              <div key={it._id} className="border p-2 rounded">
                {editingItemId === it._id ? (
                  <form onSubmit={createOrUpdateItem} className="space-y-2">
                    <input ref={nameInputRef} value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Item name" className="w-full p-2 border rounded" />
                    <textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Description" className="w-full p-2 border rounded" />
                    <input value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} placeholder="Price" type="number" className="w-full p-2 border rounded" />
                    <select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed" disabled>
                      <option value="">-- Select category --</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <input type="file" accept="image/*" onChange={e => setItemForm({ ...itemForm, image: e.target.files[0] })} className="text-xs" />
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm" disabled={submitting}>Update</button>
                      <button type="button" className="px-3 py-1 bg-gray-400 text-white rounded text-sm" onClick={() => { setEditingItemId(null); setItemForm({ name: '', description: '', price: '', category: '', image: null }); }}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    {it.imageUrl && <img src={it.imageUrl} alt={it.name} className="h-20 w-full object-cover mb-1 rounded" />}
                    <div className="font-semibold text-sm">{it.name}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{it.description}</div>
                    <div className="text-gray-700 font-normal text-sm">₹{it.price}</div>
                    <div className="text-xs text-gray-500">Category: {it.category?.name || '—'}</div>
                    <div className="mt-1 flex gap-2">
                      <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => {
                        setEditingItemId(it._id);
                        setItemForm({ name: it.name || '', description: it.description || '', price: it.price || '', category: it.category?._id || '', image: null });
                        setTimeout(() => {
                          try { nameInputRef.current && nameInputRef.current.focus(); } catch (fErr) { /* ignore */ }
                        }, 100);
                      }}>Edit</button>
                      <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={async () => {
                        if (!confirm('Delete this item?')) return;
                        try {
                          setSubmitting(true);
                          const res = await axios.delete(`${API_BASE_URL}/menu/items/${it._id}`, getAuthHeaders());
                          console.log('Delete response', res && res.data);
                          const msg = res && res.data && res.data.message ? res.data.message : 'Item deleted';
                          setToast(msg);
                          dispatch(fetchMenuItems());
                        } catch (err) {
                          console.error('Delete error', err, err && err.response && err.response.data);
                          const reason = err && err.response && err.response.data && err.response.data.message ? err.response.data.message : (err.message || 'Delete failed');
                          setToast(`Failed to delete: ${reason}`);
                        } finally {
                          setSubmitting(false);
                        }
                      }}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;
