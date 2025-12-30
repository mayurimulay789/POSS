import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/apiConfig';

const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('role');
    setUserRole(role);
    
    fetchData();
    // listen to menuUpdated events
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
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token, 'Token length:', token ? token.length : 0);
      
      const config = token ? { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      } : {};
      
      console.log('Fetching categories from:', `${API_BASE_URL}/menu/categories`);
      console.log('Config:', config);
      
      const [catRes, itemRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/menu/categories`, config),
        axios.get(`${API_BASE_URL}/menu/items`, config)
      ]);
      setCategories(catRes.data || []);
      setItems(itemRes.data || []);
    } catch (err) {
      console.error('Error fetching menu data:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setToast('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTree = (cats, parentId = null) => {
    return cats
      .filter(c => (c.parent || null) === parentId)
      .map(c => ({
        ...c,
        children: buildCategoryTree(cats, c._id)
      }));
  };

  const renderCategoryTree = (cats, level = 0) => (
    <ul className="list-disc ml-4">
      {cats.map(c => (
        <li key={c._id} className="text-gray-700">
          <span className="font-medium">{c.name}</span>
          {c.children && c.children.length > 0 && renderCategoryTree(c.children, level + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Menu Management — Supervisor View</h1>
      
      {/* Permission Denied Message */}
      <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-800 rounded-lg">
        <p className="font-semibold">View Only Access</p>
        <p className="text-sm mt-1">Only merchants and managers can add or modify food items and categories. You have view-only access.</p>
      </div>
      
      {toast && <div className="mb-3 p-2 bg-green-100 text-green-800 rounded">{toast}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Menu Categories</h2>
          {loading ? (
            <div className="text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-gray-500">No categories found</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {renderCategoryTree(buildCategoryTree(categories))}
            </div>
          )}
        </div>

        {/* Items Summary Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Menu Statistics</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Categories:</span>
              <span className="font-bold text-blue-600">{categories.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Menu Items:</span>
              <span className="font-bold text-green-600">{items.length}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Average Price:</span>
              <span className="font-bold text-purple-600">
                ₹{items.length > 0 ? (items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price Range:</span>
              <span className="font-bold text-orange-600">
                {items.length > 0 ? `₹${Math.min(...items.map(i => i.price || 0)).toFixed(2)} - ₹${Math.max(...items.map(i => i.price || 0)).toFixed(2)}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* All Items Display */}
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-3">All Menu Items</h2>
        {loading ? (
          <div className="text-center py-8">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No menu items available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(it => (
              <div key={it._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                {it.imageUrl && (
                  <img 
                    src={it.imageUrl} 
                    alt={it.name} 
                    className="h-32 w-full object-cover mb-2 rounded"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="font-semibold text-sm text-gray-800">{it.name}</div>
                {it.description && (
                  <div className="text-xs text-gray-600 line-clamp-2 mt-1">{it.description}</div>
                )}
                <div className="text-green-600 font-bold text-sm mt-2">₹{it.price}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Category: <span className="font-medium">{it.category?.name || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: As a supervisor, you have view-only access to the menu. To edit or delete items/categories, please contact management.
      </p>
    </div>
  );
};

export default MenuManagement;
