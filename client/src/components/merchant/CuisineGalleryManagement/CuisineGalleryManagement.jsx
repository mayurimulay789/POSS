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
  const [showModal, setShowModal] = useState(false);
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
  const [validationErrors, setValidationErrors] = useState({});

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

  // Validation functions
  const validateHeading = (heading) => {
    if (!heading) return 'Heading is required';
    if (heading.length < 3) return 'Heading must be at least 3 characters';
    if (heading.length > 100) return 'Heading must be less than 100 characters';
    return '';
  };

  const validateSubheading = (subheading) => {
    if (!subheading) return 'Subheading is required';
    if (subheading.length < 5) return 'Subheading must be at least 5 characters';
    if (subheading.length > 200) return 'Subheading must be less than 200 characters';
    return '';
  };

  const validateForm = () => {
    const errors = {
      heading: validateHeading(form.heading),
      subheading: validateSubheading(form.subheading)
    };
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!validateForm()) return;
    
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
      
      // Reset form and close modal
      setForm({ heading: '', subheading: '' });
      setEditMode(false);
      setEditId(null);
      setValidationErrors({});
      setShowModal(false);
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
    setShowModal(true);
  };

  const handleNewGallery = () => {
    setForm({ heading: '', subheading: '' });
    setEditMode(false);
    setEditId(null);
    setValidationErrors({});
    setShowModal(true);
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cuisine Gallery Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your cuisine gallery sections</p>
          </div>
          <button
            onClick={handleNewGallery}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + New Gallery
          </button>
        </div>
      </div>

      {/* Messages */}
      {(error || localError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error || localError}
        </div>
      )}

      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && galleries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : galleries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No cuisine galleries found. Click "New Gallery" to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heading</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subheading</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {galleries.map((gallery) => (
                <tr key={gallery._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gallery.heading}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{gallery.subheading || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {gallery.isActive ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(gallery.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button onClick={() => handleEdit(gallery)} className="text-blue-600 hover:text-blue-800 font-medium">
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(gallery._id)}
                      className="text-yellow-600 hover:text-yellow-800 font-medium"
                    >
                      {gallery.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDeleteClick(gallery._id)} className="text-red-600 hover:text-red-800 font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editMode ? 'Edit Gallery' : 'New Gallery'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heading *</label>
                <input
                  type="text"
                  name="heading"
                  value={form.heading}
                  onChange={handleChange}
                  required
                  placeholder="Our Cuisine Gallery"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    validationErrors.heading ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.heading && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.heading}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subheading *</label>
                <input
                  type="text"
                  name="subheading"
                  value={form.subheading}
                  onChange={handleChange}
                  placeholder="Explore our delicious dishes"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    validationErrors.subheading ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.subheading && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.subheading}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {loading ? 'Saving...' : editMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this gallery? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
