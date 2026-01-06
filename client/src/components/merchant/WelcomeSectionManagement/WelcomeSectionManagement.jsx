import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllWelcomeSections, 
  createWelcomeSection,
  updateWelcomeSection,
  deleteWelcomeSection,
  toggleWelcomeSectionStatus
} from '../../../store/slices/welcomeSectionSlice';

const WelcomeSectionManagement = () => {
  const dispatch = useDispatch();
  const { sections, loading, error, success } = useSelector(state => state.welcomeSection);

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    hotelName: '',
    tagline: '',
    description: ''
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
    dispatch(fetchAllWelcomeSections());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(fetchAllWelcomeSections());
      }, 100);
    }
  }, [success, dispatch]);

  // Validation functions
  const validateHotelName = (hotelName) => {
    if (!hotelName) return 'Hotel name is required';
    if (hotelName.length < 2) return 'Hotel name must be at least 2 characters';
    if (hotelName.length > 100) return 'Hotel name must be less than 100 characters';
    return '';
  };

  const validateTagline = (tagline) => {
    if (!tagline) return 'Tagline is required';
    if (tagline.length < 5) return 'Tagline must be at least 5 characters';
    if (tagline.length > 150) return 'Tagline must be less than 150 characters';
    return '';
  };

  const validateDescription = (description) => {
    if (!description) return 'Description is required';
    if (description.length < 10) return 'Description must be at least 10 characters';
    if (description.length > 1000) return 'Description must be less than 1000 characters';
    return '';
  };

  const validateForm = () => {
    const errors = {
      hotelName: validateHotelName(form.hotelName),
      tagline: validateTagline(form.tagline),
      description: validateDescription(form.description)
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
        await dispatch(updateWelcomeSection({ id: editId, data: form })).unwrap();
        setToastMessage('Welcome section updated successfully!');
      } else {
        await dispatch(createWelcomeSection(form)).unwrap();
        setToastMessage('Welcome section created successfully!');
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Reset form and close modal
      setForm({ hotelName: '', tagline: '', description: '' });
      setEditMode(false);
      setEditId(null);
      setValidationErrors({});
      setShowModal(false);
    } catch (err) {
      setLocalError(err?.message || 'Error saving welcome section');
    }
  };

  const handleEdit = (section) => {
    setForm({
      hotelName: section.hotelName || '',
      tagline: section.tagline || '',
      description: section.description || ''
    });
    setEditMode(true);
    setEditId(section._id);
    setShowModal(true);
  };

  const handleNewSection = () => {
    setForm({ hotelName: '', tagline: '', description: '' });
    setEditMode(false);
    setEditId(null);
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCancelEdit = () => {
    setForm({ hotelName: '', tagline: '', description: '' });
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
        await dispatch(deleteWelcomeSection(deleteId)).unwrap();
        setToastMessage('Welcome section deleted successfully!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        setLocalError(err?.message || 'Error deleting welcome section');
      }
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleWelcomeSectionStatus(id)).unwrap();
      setToastMessage('Status updated successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      // Refetch all sections to get updated status
      await dispatch(fetchAllWelcomeSections());
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
            <h1 className="text-2xl font-bold text-gray-800">Welcome Section Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your welcome sections</p>
          </div>
          <button
            onClick={handleNewSection}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + New Section
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
        {loading && sections.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : sections.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No welcome sections found. Click "New Section" to create one.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tagline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sections.map((section) => (
                <tr key={section._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{section.hotelName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{section.tagline}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {section.isActive ? (
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
                    {new Date(section.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button onClick={() => handleEdit(section)} className="text-blue-600 hover:text-blue-800 font-medium">
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(section._id)}
                      className="text-yellow-600 hover:text-yellow-800 font-medium"
                    >
                      {section.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDeleteClick(section._id)} className="text-red-600 hover:text-red-800 font-medium">
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
                {editMode ? 'Edit Welcome Section' : 'New Welcome Section'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                <input
                  type="text"
                  name="hotelName"
                  value={form.hotelName}
                  onChange={handleChange}
                  required
                  placeholder="Enter Hotel Name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    validationErrors.hotelName ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.hotelName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.hotelName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline *</label>
                <input
                  type="text"
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  required
                  placeholder="Short catchy tagline"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    validationErrors.tagline ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.tagline && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.tagline}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Full description..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    validationErrors.description ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
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
            <p className="text-gray-600 mb-4">Are you sure you want to delete this section? This action cannot be undone.</p>
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

export default WelcomeSectionManagement;