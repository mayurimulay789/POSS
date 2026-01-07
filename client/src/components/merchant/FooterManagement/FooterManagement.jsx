import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllFooters,
  createFooter,
  updateFooter,
  deleteFooter,
  toggleFooterStatus,
  clearSuccess,
  clearError
} from '/src/store/slices/footerSlice';

const FooterManagement = () => {
  const dispatch = useDispatch();
  const { footers, loading, error, success } = useSelector(state => state.footer);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    restaurantName: '',
    shortDescription: '',
    hours: '',
    social: { facebook: '', instagram: '', twitter: '' },
    poweredBy: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAllFooters());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  // Validation functions
  const validateRestaurantName = (name) => {
    if (!name) return 'Restaurant name is required';
    if (name.length < 2) return 'Restaurant name must be at least 2 characters';
    if (name.length > 100) return 'Restaurant name must be less than 100 characters';
    return '';
  };

  const validateShortDescription = (desc) => {
    if (!desc) return 'Short description is required';
    if (desc.length < 10) return 'Description must be at least 10 characters';
    if (desc.length > 300) return 'Description must be less than 300 characters';
    return '';
  };

  const validateHours = (hours) => {
    if (!hours) return 'Hours are required';
    if (hours.length < 5) return 'Hours must be at least 5 characters';
    if (hours.length > 100) return 'Hours must be less than 100 characters';
    
    // Check for time format pattern (e.g., "10:00 AM - 10:00 PM" or "10 AM - 10 PM" or "Mon-Fri: 9AM-5PM")
    const timePattern = /\d{1,2}(:\d{2})?\s*(AM|PM|am|pm)?/i;
    if (!timePattern.test(hours)) {
      return 'Please include valid time format (e.g., 10:00 AM - 10:00 PM)';
    }
    
    return '';
  };

  const validateUrl = (url, fieldName) => {
    if (url && url.length > 0) {
      const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
      if (!urlRegex.test(url)) return `Please enter a valid ${fieldName} URL`;
      if (url.length > 200) return `${fieldName} URL must be less than 200 characters`;
    }
    return '';
  };

  const validateForm = () => {
    const errors = {
      restaurantName: validateRestaurantName(form.restaurantName),
      shortDescription: validateShortDescription(form.shortDescription),
      hours: validateHours(form.hours),
      'social.facebook': validateUrl(form.social.facebook, 'Facebook'),
      'social.instagram': validateUrl(form.social.instagram, 'Instagram'),
      'social.twitter': validateUrl(form.social.twitter, 'Twitter')
    };
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [group, field] = name.split('.');
      setForm(prev => ({ ...prev, [group]: { ...prev[group], [field]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
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
    
    if (!validateForm()) return;
    
    try {
      if (editMode) {
        await dispatch(updateFooter({ id: editId, data: form })).unwrap();
      } else {
        await dispatch(createFooter(form)).unwrap();
      }
      resetForm();
      setShowModal(false);
      dispatch(fetchAllFooters());
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const resetForm = () => {
    setForm({
      restaurantName: '',
      shortDescription: '',
      hours: '',
      social: { facebook: '', instagram: '', twitter: '' },
      poweredBy: ''
    });
    setEditMode(false);
    setEditId(null);
    setValidationErrors({});
  };

  const handleEdit = (footer) => {
    setForm({
      restaurantName: footer.restaurantName || '',
      shortDescription: footer.shortDescription || '',
      hours: footer.hours || '',
      social: {
        facebook: footer.social?.facebook || '',
        instagram: footer.social?.instagram || '',
        twitter: footer.social?.twitter || ''
      },
      poweredBy: footer.poweredBy || ''
    });
    setEditMode(true);
    setEditId(footer._id);
    setShowModal(true);
  };

  const handleNewFooter = () => {
    resetForm();
    setValidationErrors({});
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteFooter(deleteId)).unwrap();
      setShowDeleteModal(false);
      setDeleteId(null);
      dispatch(fetchAllFooters());
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleFooterStatus(id)).unwrap();
      dispatch(fetchAllFooters());
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Footer Management</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your footer configurations</p>
          </div>
          <button
            onClick={handleNewFooter}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
          >
            + New Footer
          </button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-2 sm:p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          Operation successful!
        </div>
      )}
      {error && (
        <div className="mb-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table/Card View */}
      {loading && footers?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : footers?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 text-sm">
          No footers found. Click "New Footer" to add one.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {footers.map((footer) => (
                    <tr key={footer._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{footer.restaurantName}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{footer.hours}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{footer.shortDescription}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {footer.isActive ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button onClick={() => handleEdit(footer)} className="text-blue-600 hover:text-blue-800 font-medium">
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(footer._id)}
                          className="text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                          {footer.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteClick(footer._id)} className="text-red-600 hover:text-red-800 font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {footers.map((footer) => (
              <div key={footer._id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Restaurant Name</p>
                    <p className="text-sm text-gray-900 font-medium">{footer.restaurantName}</p>
                  </div>
                  <div>
                    {footer.isActive ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Hours</p>
                  <p className="text-sm text-gray-900">{footer.hours}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Description</p>
                  <p className="text-sm text-gray-900">{footer.shortDescription}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <button 
                    onClick={() => handleEdit(footer)} 
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(footer._id)}
                    className="flex-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg font-medium transition-colors"
                  >
                    {footer.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(footer._id)} 
                    className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {editMode ? 'Edit Footer' : 'New Footer'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={form.restaurantName}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      validationErrors.restaurantName ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.restaurantName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.restaurantName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Opening Hours *</label>
                  <input
                    type="text"
                    name="hours"
                    value={form.hours}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 10:00 AM - 10:00 PM"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      validationErrors.hours ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.hours && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.hours}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    validationErrors.shortDescription ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.shortDescription && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.shortDescription}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Powered By Text</label>
                <input
                  type="text"
                  name="poweredBy"
                  value={form.poweredBy}
                  onChange={handleChange}
                  placeholder="e.g. Powered by POS Management System"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    name="social.facebook"
                    value={form.social.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      validationErrors['social.facebook'] ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors['social.facebook'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['social.facebook']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    name="social.instagram"
                    value={form.social.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      validationErrors['social.instagram'] ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors['social.instagram'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['social.instagram']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                  <input
                    type="url"
                    name="social.twitter"
                    value={form.social.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/..."
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      validationErrors['social.twitter'] ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors['social.twitter'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['social.twitter']}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors order-1 sm:order-2"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this footer? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 order-1 sm:order-2"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterManagement;
