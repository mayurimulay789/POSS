import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/apiConfig';

const AddMenu = () => {
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState(''); // top-level category name
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', category: '', image: null });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [excelStatus, setExcelStatus] = useState(null);
  const fileInputRef = useRef(null);
  const itemImageInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    const handler = () => fetchCategories();
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
    } catch (e) {
      console.error('Error getting auth headers', e);
      // ignore
    }
    return {};
  };

  const isDuplicateCategory = (name) => {
    const normalized = (name || '').trim().toLowerCase();
    return categories.some(c => (c.name || '').trim().toLowerCase() === normalized);
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/menu/categories`, { headers });
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    const trimmedName = (catName || '').trim();
    if (!trimmedName) {
      setToast('Please enter a category name');
      return;
    }
    if (isDuplicateCategory(trimmedName)) {
      setToast('Category already exists');
      return;
    }
    try {
      // top-level category (no parent)
      await axios.post(`${API_BASE_URL}/menu/categories`, { name: trimmedName, parent: null }, getAuthHeaders());
      setCatName('');
      fetchCategories();
      setToast('Category created successfully');
      window.dispatchEvent(new CustomEvent('menuUpdated'));
    } catch (err) {
      console.error(err);
      const reason = err?.response?.data?.message || err.message || 'Failed to create category';
      setToast(reason);
    }
  };

  const createItem = async (e) => {
    e.preventDefault();
    // Validation logic
    const name = (itemForm.name || '').trim();
    const description = (itemForm.description || '').trim();
    const price = itemForm.price;
    const category = itemForm.category;
    if (!name) {
      setToast('Please enter an item name');
      return;
    }
    if (!description) {
      setToast('Please enter a description');
      return;
    }
    if (!price || isNaN(price)) {
      setToast('Please enter a valid price');
      return;
    }
    if (Number(price) < 0) {
      setToast('Price cannot be negative');
      return;
    }
    if (Number(price) === 0) {
      setToast('Price cannot be zero');
      return;
    }
    if (!category) {
      setToast('Please select a category');
      return;
    }
    try {
      setSubmitting(true);
      setToast(null);
      const form = new FormData();
      form.append('name', name);
      form.append('description', description);
      form.append('price', price);
      form.append('category', category);
      if (itemForm.image) form.append('image', itemForm.image);
      await axios.post(`${API_BASE_URL}/menu/items`, form, getAuthHeaders());
      setItemForm({ name: '', description: '', price: '', category: '', image: null });
      if (itemImageInputRef.current) itemImageInputRef.current.value = '';
      setToast('Item created successfully');
      window.dispatchEvent(new CustomEvent('menuUpdated'));
    } catch (err) {
      console.error(err);
      setToast('Failed to create item');
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
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchCategories();
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Add Menu — Merchant</h1>
      {toast && <div className="mb-4 p-2 bg-red-300 text-black-800 rounded">{toast}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Create Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-2">Step 1: Create Category</h2>
          <p className="text-sm text-gray-600 mb-2">Create a top-level category (e.g., "Main Course", "Drinks").</p>
          <form onSubmit={createCategory} className="space-y-3">
            <input 
              value={catName} 
              onChange={e => setCatName(e.target.value)} 
              placeholder="Category name" 
              className="w-full p-2 border rounded" 
            />
            <div>
              <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Category</button>
            </div>
          </form>
        </div>

        {/* Add Menu Item */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-2">Add Menu Item</h2>
          <form onSubmit={createItem} className="space-y-3">
            <input 
              value={itemForm.name} 
              onChange={e => setItemForm({ ...itemForm, name: e.target.value })} 
              placeholder="Item name" 
              className="w-full p-2 border rounded" 
            />
            <textarea 
              value={itemForm.description} 
              onChange={e => setItemForm({ ...itemForm, description: e.target.value })} 
              placeholder="Description" 
              className="w-full p-2 border rounded" 
            />
            <input 
              value={itemForm.price} 
              onChange={e => setItemForm({ ...itemForm, price: e.target.value })} 
              placeholder="Price" 
              type="number" 
              min="0"
              step="1"
              className="w-full p-2 border rounded" 
            />
            <select 
              value={itemForm.category} 
              onChange={e => setItemForm({ ...itemForm, category: e.target.value })} 
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select category --</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input 
              ref={itemImageInputRef}
              type="file" 
              accept="image/*" 
              onChange={e => setItemForm({ ...itemForm, image: e.target.files[0] })} 
            />
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" 
                disabled={submitting}
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Upload Menu via Excel Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-2">Upload Menu via Excel</h2>
        <form onSubmit={uploadExcel} className="flex gap-3 items-center">
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".xlsx,.xls" 
            onChange={e => { 
              const f = e.target.files[0]; 
              console.log('Excel selected:', f); 
              setExcelFile(f); 
            }} 
          />
          <div className="text-sm text-gray-700">
            {excelFile ? `Selected: ${excelFile.name}` : 'No file chosen'}
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" 
            disabled={!excelFile} 
            title={!excelFile ? 'Choose a file first' : 'Upload Excel file'}
          >
            Upload
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-2">
          Excel columns: Category, Subcategory, ItemName, Description, Price, ImageUrl (optional)
        </p>
        {excelStatus && (
          <div className={`mt-2 text-sm ${excelStatus.toLowerCase().includes('failed') || excelStatus.toLowerCase().includes('upload failed') ? 'text-red-600' : 'text-green-600'}`}>
            {excelStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMenu;
