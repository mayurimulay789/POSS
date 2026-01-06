import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllContactUs, 
  createContactUs, 
  updateContactUs, 
  deleteContactUs, 
  toggleContactUsStatus 
} from '../../../store/slices/contactUsSlice';

const ContactUsManagement = () => {
  const dispatch = useDispatch();
  const { contacts, loading, error, success } = useSelector(state => state.contactUs);

  const [form, setForm] = useState({
    email: '',
    contactNo: '',
    address: '',
    googleMapLocation: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAllContactUs());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch({ type: 'contactUs/clearSuccess' });
      }, 3000);
    }
  }, [success, dispatch]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.length > 100) return 'Email must be less than 100 characters';
    return '';
  };

  const validateContactNo = (contactNo) => {
    const phoneRegex = /^[+]?[\d\s\-()]{10,20}$/;
    if (!contactNo) return 'Contact number is required';
    if (!phoneRegex.test(contactNo)) return 'Please enter a valid phone number (10-20 digits)';
    return '';
  };

  const validateAddress = (address) => {
    if (!address) return 'Address is required';
    if (address.length < 10) return 'Address must be at least 10 characters';
    if (address.length > 500) return 'Address must be less than 500 characters';
    return '';
  };

  const validateGoogleMapLocation = (url) => {
    if (!url) return ''; // Optional field
    const googleMapsRegex = /^https:\/\/(www\.)?google\.com\/maps\/(embed|place)/;
    if (!googleMapsRegex.test(url)) {
      return 'Please enter a valid Google Maps embed or place URL';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(form.email),
      contactNo: validateContactNo(form.contactNo),
      address: validateAddress(form.address),
      googleMapLocation: validateGoogleMapLocation(form.googleMapLocation)
    };

    // Remove empty errors
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field on change
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    
    switch(name) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'contactNo':
        error = validateContactNo(value);
        break;
      case 'address':
        error = validateAddress(value);
        break;
      case 'googleMapLocation':
        error = validateGoogleMapLocation(value);
        break;
      default:
        break;
    }
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editMode) {
        await dispatch(updateContactUs({ id: editId, data: form })).unwrap();
      } else {
        await dispatch(createContactUs(form)).unwrap();
      }
      resetForm();
      dispatch(fetchAllContactUs());
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const resetForm = () => {
    setForm({
      email: '',
      contactNo: '',
      address: '',
      googleMapLocation: ''
    });
    setEditMode(false);
    setEditId(null);
    setValidationErrors({});
  };

  const handleEdit = (contact) => {
    setForm({
      email: contact.email || '',
      contactNo: contact.contactNo || '',
      address: contact.address || '',
      googleMapLocation: contact.googleMapLocation || ''
    });
    setEditMode(true);
    setEditId(contact._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteContactUs(deleteId)).unwrap();
      setShowDeleteModal(false);
      setDeleteId(null);
      dispatch(fetchAllContactUs());
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleContactUsStatus(id)).unwrap();
      dispatch(fetchAllContactUs());
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-8 text-amber-600 text-center tracking-tight">
          Contact Us Management
        </h2>

        {/* Form Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            {editMode ? 'Edit Contact Info' : 'Add New Contact Info'}
          </h3>

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              ✅ Operation successful!
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              ❌ {error}
            </div>
          )}

          {/* Live Preview */}
          {(form.email || form.contactNo || form.address || form.googleMapLocation) && (
            <div className="mb-6 p-6 bg-amber-50 rounded-xl border-2 border-amber-200">
              <h4 className="text-lg font-bold mb-4 text-amber-700">📋 Live Preview</h4>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  {form.googleMapLocation ? (
                    <iframe 
                      src={form.googleMapLocation} 
                      className="w-full h-40 border rounded-lg shadow-sm" 
                      title="map"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-100 border rounded-lg">
                      📍 Map Preview
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p><span className="font-semibold">Email:</span> {form.email || 'Not set'}</p>
                  <p><span className="font-semibold">Phone:</span> {form.contactNo || 'Not set'}</p>
                  <p><span className="font-semibold">Address:</span> {form.address || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Email *</label>
                <input 
                  type="email"
                  name="email" 
                  value={form.email} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                    validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">⚠️ {validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Contact Number *</label>
                <input 
                  type="tel"
                  name="contactNo" 
                  value={form.contactNo} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+1234567890 or (123) 456-7890"
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                    validationErrors.contactNo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.contactNo && (
                  <p className="mt-1 text-sm text-red-600">⚠️ {validationErrors.contactNo}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Google Maps Embed Link</label>
              <input 
                type="url"
                name="googleMapLocation" 
                value={form.googleMapLocation} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="https://www.google.com/maps/embed?..."
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm ${
                  validationErrors.googleMapLocation ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.googleMapLocation && (
                <p className="mt-1 text-sm text-red-600">⚠️ {validationErrors.googleMapLocation}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                💡 Tip: Go to Google Maps → Share → Embed a map → Copy HTML src URL
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Address *</label>
              <textarea 
                name="address" 
                value={form.address} 
                onChange={handleChange}
                onBlur={handleBlur}
                rows="3"
                placeholder="Enter complete address (minimum 10 characters)"
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none ${
                  validationErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">⚠️ {validationErrors.address}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {form.address.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                className="flex-1 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || Object.keys(validationErrors).length > 0}
              >
                {loading ? 'Saving...' : editMode ? '💾 Update Contact Info' : '➕ Add Contact Info'}
              </button>
              {editMode && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors shadow-md"
                >
                  ✖ Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 bg-gradient-to-r from-amber-600 to-amber-700">
            <h3 className="text-2xl font-bold text-white">📞 All Contact Information</h3>
          </div>

          {loading && (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <p className="mt-2">Loading...</p>
            </div>
          )}

          {!loading && contacts?.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No contact information found. Add one above!</p>
            </div>
          )}

          {!loading && contacts?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.map((contact, index) => (
                    <tr key={contact._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900">{contact.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{contact.contactNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={contact.address}>
                        {contact.address}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contact.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.isActive ? '✓ Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(contact)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors"
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(contact._id)}
                            className={`px-3 py-1 text-white text-xs font-semibold rounded transition-colors ${
                              contact.isActive 
                                ? 'bg-yellow-500 hover:bg-yellow-600' 
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                            title={contact.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {contact.isActive ? '⊗ Deactivate' : '✓ Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(contact._id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            🗑️ Delete
                          </button>
                        </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this contact information? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactUsManagement;