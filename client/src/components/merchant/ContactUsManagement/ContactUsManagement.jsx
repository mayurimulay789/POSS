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

  const [showModal, setShowModal] = useState(false);
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
      setShowModal(false);
      resetForm();
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
    const phoneRegex = /^[0-9]{10}$/;
    if (!contactNo) return 'Contact number is required';
    if (!phoneRegex.test(contactNo)) return 'Contact number must be exactly 10 digits';
    return '';
  };

  const validateAddress = (address) => {
    if (!address) return 'Address is required';
    if (address.length < 10) return 'Address must be at least 10 characters';
    if (address.length > 500) return 'Address must be less than 500 characters';
    return '';
  };

  const validateGoogleMapLocation = (url) => {
    // Optional field, but if provided must be valid URL
    if (!url || url.trim() === '') return '';
    
    const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    if (!urlRegex.test(url)) return 'Please enter a valid URL';
    
    // Check if it's a Google Maps URL
    if (!url.includes('google.com/maps') && !url.includes('goo.gl/maps')) {
      return 'Please enter a valid Google Maps URL';
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
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For contact number, only allow digits and limit to 10 characters
    if (name === 'contactNo') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setForm(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user starts typing
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
    
    // Validate on blur
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
    setShowModal(true);
  };

  const handleNewContact = () => {
    resetForm();
    setShowModal(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleContactUsStatus(id)).unwrap();
      dispatch(fetchAllContactUs());
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
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

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Contact Us Management</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your contact information</p>
          </div>
          <button
            onClick={handleNewContact}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
          >
            + New Contact
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
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
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 text-sm">
          No contact information found. Click "New Contact" to add one.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 break-words max-w-xs">{contact.email}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.contactNo}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{contact.address}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {contact.isActive ? (
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
                        <button onClick={() => handleEdit(contact)} className="text-blue-600 hover:text-blue-800 font-medium">
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(contact._id)}
                          className="text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                          {contact.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteClick(contact._id)} className="text-red-600 hover:text-red-800 font-medium">
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
            {contacts.map((contact) => (
              <div key={contact._id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Email</p>
                    <p className="text-sm text-gray-900 break-words">{contact.email}</p>
                  </div>
                  <div>
                    {contact.isActive ? (
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
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Contact Number</p>
                  <p className="text-sm text-gray-900">{contact.contactNo}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Address</p>
                  <p className="text-sm text-gray-900">{contact.address}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <button 
                    onClick={() => handleEdit(contact)} 
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(contact._id)}
                    className="flex-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg font-medium transition-colors"
                  >
                    {contact.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(contact._id)} 
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {editMode ? 'Edit Contact' : 'New Contact'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="example@email.com"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'focus:ring-green-500'
                  }`}
                />
                {validationErrors.email && <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="text"
                  name="contactNo"
                  value={form.contactNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  maxLength="10"
                  pattern="[0-9]{10}"
                  placeholder="Enter 10-digit number"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.contactNo 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'focus:ring-green-500'
                  }`}
                />
                {validationErrors.contactNo && <p className="text-red-600 text-xs mt-1">{validationErrors.contactNo}</p>}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  rows="3"
                  placeholder="Enter complete address (minimum 10 characters)"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.address 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'focus:ring-green-500'
                  }`}
                ></textarea>
                {validationErrors.address && <p className="text-red-600 text-xs mt-1">{validationErrors.address}</p>}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Google Map Location (Optional)</label>
                <input
                  type="url"
                  name="googleMapLocation"
                  value={form.googleMapLocation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://www.google.com/maps/..."
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.googleMapLocation 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'focus:ring-green-500'
                  }`}
                />
                {validationErrors.googleMapLocation && <p className="text-red-600 text-xs mt-1">{validationErrors.googleMapLocation}</p>}
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
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors order-1 sm:order-2"
                >
                  {editMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this contact? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 order-1 sm:order-2"
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

export default ContactUsManagement;