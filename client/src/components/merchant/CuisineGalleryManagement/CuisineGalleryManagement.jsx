import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllCuisineGalleries, 
  createCuisineGallery,
  updateCuisineGallery,
  deleteCuisineGallery,
  toggleCuisineGalleryStatus
} from '../../../store/slices/cuisineGallerySlice';

const CuisineGalleryManagement = () => {
  const dispatch = useDispatch();
  const { galleries, loading, error, success } = useSelector(state => state.cuisineGallery);

  // Form state
  const [form, setForm] = useState({
    heading: '',
    subheading: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [localError, setLocalError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllCuisineGalleries());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(fetchAllCuisineGalleries());
      }, 100);
    }
  }, [success, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (editMode && editId) {
        await dispatch(updateCuisineGallery({ id: editId, data: form })).unwrap();
        setToastMessage('Cuisine gallery updated successfully!');
      } else {
        await dispatch(createCuisineGallery(form)).unwrap();
        setToastMessage('Cuisine gallery created successfully!');
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Reset form
      setForm({ heading: '', subheading: '' });
      setEditMode(false);
      setEditId(null);
    } catch (err) {
      setLocalError(err?.message || 'Error saving cuisine gallery');
    }
  };

  const handleEdit = (gallery) => {
    setForm({
      heading: gallery.heading || '',
      subheading: gallery.subheading || ''
    });
    setEditMode(true);
    setEditId(gallery._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm({ heading: '', subheading: '' });
    setEditMode(false);
    setEditId(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteCuisineGallery(deleteId)).unwrap();
        setToastMessage('Cuisine gallery deleted successfully!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        setLocalError(err?.message || 'Error deleting cuisine gallery');
      }
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleCuisineGalleryStatus(id)).unwrap();
      setToastMessage('Status updated successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      // Refetch all galleries to get updated status
      await dispatch(fetchAllCuisineGalleries());
    } catch (err) {
      setLocalError(err?.message || 'Error toggling status');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cuisine Gallery Management</h1>

      {(error || localError) && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error || localError}
        </div>
      )}

      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Create/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Cuisine Gallery' : 'Create New Cuisine Gallery'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Heading *</label>
            <input
              type="text"
              name="heading"
              value={form.heading}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Our Cuisine Gallery"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subheading</label>
            <input
              type="text"
              name="subheading"
              value={form.subheading}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Explore our delicious dishes"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              disabled={loading}
            >
              {loading ? 'Saving...' : editMode ? 'Update' : 'Create'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Galleries List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">All Cuisine Galleries</h2>
        
        {loading && galleries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading...</div>
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No cuisine galleries found. Create your first one above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subheading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {galleries.map((gallery) => (
                  <tr key={gallery._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{gallery.heading}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{gallery.subheading || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        gallery.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {gallery.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(gallery.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(gallery)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(gallery._id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {gallery.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(gallery._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this cuisine gallery? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuisineGalleryManagement;
