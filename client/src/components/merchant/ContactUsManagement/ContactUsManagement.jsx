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

  const validateForm = () => {
    const errors = {
      email: validateEmail(form.email),
      contactNo: validateContactNo(form.contactNo),
      address: validateAddress(form.address)
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Contact Us Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your contact information</p>
          </div>
          <button
            onClick={handleNewContact}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + New Contact
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          Operation successful!
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No contact information found. Click "New Contact" to add one.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.contactNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{contact.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
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
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editMode ? 'Edit Contact' : 'New Contact'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {validationErrors.email && <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="text"
                  name="contactNo"
                  value={form.contactNo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {validationErrors.contactNo && <p className="text-red-600 text-xs mt-1">{validationErrors.contactNo}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
                {validationErrors.address && <p className="text-red-600 text-xs mt-1">{validationErrors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Map Location (Optional)</label>
                <input
                  type="url"
                  name="googleMapLocation"
                  value={form.googleMapLocation}
                  onChange={handleChange}
                  placeholder="https://www.google.com/maps/..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this contact? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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

export default ContactUsManagement;