
function validateItemForm(item) {
  if (!item.name || !item.name.trim()) return 'Item name is required';
  if (!item.description || !item.description.trim()) return 'Description is required';
  if (!item.category) return 'Category is required';
  const price = Number(item.price);
  if (isNaN(price) || price <= 0) return 'Price must be a positive number (greater than zero)';
  if (!/^\d+(\.\d{1,2})?$/.test(item.price.toString()) || price < 0) return 'Price must be a valid positive number';
  return null;
}
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../../../store/slices/menuSlice';
import API_BASE_URL from '../../../config/apiConfig';

const MenuManagement = () => {
  const dispatch = useDispatch();
  const { items: menuItems, loading } = useSelector(state => state.menu);
  
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

  const token = localStorage.getItem('token');

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

  const fetchData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch(`${API_BASE_URL}/menu/categories`).then(r => r.json()),
        fetch(`${API_BASE_URL}/menu/items`).then(r => r.json())
      ]);
      setCategories(catRes || []);
      // Using Redux state instead of local state
    } catch (err) {
      console.error(err);
    }
  };

  // Build auth headers if token exists in localStorage
  const getAuthHeaders = () => {
    try {
      if (token) return { Authorization: `Bearer ${token}` };
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
      const response = await fetch(`${API_BASE_URL}/menu/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ name: trimmedName, parent: parentTarget })
      });
      if (response.ok) {
        setCatName('');
        setParentCat('');
        fetchData();
        window.dispatchEvent(new CustomEvent('menuUpdated'));
      } else {
        const data = await response.json();
        setToast(data?.message || 'Failed to create category');
      }
    } catch (err) {
      console.error(err);
      setToast(err?.message || 'Failed to create category');
    }
  };

  const createOrUpdateItem = async (e) => {
    e.preventDefault();
    // Final check: block negative/zero prices
    const priceNum = Number(itemForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setToast('Price must be a positive number');
      return;
    }
    const validationError = validateItemForm(itemForm);
    if (validationError) {
      setToast(validationError);
      return;
    }
    // Check for duplicate item name within the same category when creating (not editing)
    if (!editingItemId) {
      const trimmedName = itemForm.name.trim().toLowerCase();
      console.log('Checking duplicates:', { trimmedName, category: itemForm.category, menuItems });
      const isDuplicate = menuItems.some(item => {
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
      form.append('price', priceNum);
      form.append('category', itemForm.category);
      if (itemForm.image) form.append('image', itemForm.image);
      const url = editingItemId 
        ? `${API_BASE_URL}/menu/items/${editingItemId}`
        : `${API_BASE_URL}/menu/items`;
      const method = editingItemId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: form
      });
      if (response.ok) {
        setItemForm({ name: '', description: '', price: '', category: '', image: null });
        setEditingItemId(null);
        setToast(editingItemId ? 'Item updated' : 'Item created');
        fetchData();
        window.dispatchEvent(new CustomEvent('menuUpdated'));
      } else {
        const errorData = await response.json();
        // Show the specific error message from backend (e.g., duplicate item)
        setToast(errorData.message || 'Failed to save item');
      }
    } catch (err) {
      console.error(err);
      setToast('Failed to save item');
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
      const response = await fetch(`${API_BASE_URL}/menu/upload-excel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form
      });
      if (response.ok) {
        const data = await response.json();
        setExcelStatus(data?.message || 'File uploaded successfully');
        setExcelFile(null);
        fetchData();
        window.dispatchEvent(new CustomEvent('menuUpdated'));
        setTimeout(() => setExcelStatus(null), 4000);
      } else {
        setExcelStatus('Upload failed');
        setTimeout(() => setExcelStatus(null), 6000);
      }
    } catch (err) {
      console.error('Excel upload error', err);
      setExcelStatus(`Upload failed: ${err.message || 'Unknown error'}`);
      setTimeout(() => setExcelStatus(null), 6000);
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return;
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/menu/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setToast(data?.message || 'Item deleted');
        fetchData();
      } else {
        setToast('Failed to delete item');
      }
    } catch (err) {
      console.error('Delete error', err);
      setToast(`Failed to delete: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
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
              <button className="px-4 py-2 bg-green-600 text-white rounded" disabled={submitting}>{editingItemId ? 'Update Item' : 'Add Item'}</button>
              {editingItemId && (
                <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded" onClick={() => { setEditingItemId(null); setItemForm({ name: '', description: '', price: '', category: '', image: null }); }}>Cancel</button>
              )}
            </div>
          </form>
        </div>
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
            {menuItems && menuItems.map(it => (
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
                    <div className="text-gray-700 font-normal text-sm">₹{Number(it.price) > 0 ? it.price : '0.00'}</div>
                    <div className="text-xs text-gray-500">Category: {it.category?.name || '—'}</div>
                    <div className="mt-1 flex gap-2">
                      <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => {
                        setEditingItemId(it._id);
                        setItemForm({
                          name: it.name || '',
                          description: it.description || '',
                          price: (Number(it.price) > 0 ? String(it.price) : ''),
                          category: it.category?._id || '',
                          image: null
                        });
                        setTimeout(() => {
                          try { nameInputRef.current && nameInputRef.current.focus(); } catch (fErr) { /* ignore */ }
                        }, 100);
                      }}>Edit</button>
                      <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => deleteItem(it._id)}>Delete</button>
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
