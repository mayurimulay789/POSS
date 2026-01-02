import React, { useState, useEffect } from 'react';
import { 
  XCircle, 
  Loader,
  X,
  Mail,
  Phone,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';

// Base Modal Container
const ModalContainer = ({ children, size = 'md', onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
    <div className={`bg-white rounded-lg shadow-xl w-full ${
      size === 'sm' ? 'max-w-md' : 
      size === 'md' ? 'max-w-lg' : 
      'max-w-2xl'
    } my-4 sm:my-0`}>
      {children}
    </div>
    {/* Close button outside modal for mobile */}
    <button
      onClick={onClose}
      className="fixed top-4 right-4 sm:hidden bg-white rounded-full p-2 shadow-lg"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
);

// Validation functions
const validatePhone = (phone) => {
  if (!phone) return { isValid: true, message: '' }; // Phone is optional
  const phoneRegex = /^\d{10}$/;
  const isValid = phoneRegex.test(phone);
  return {
    isValid,
    message: isValid ? '' : 'Phone number must be exactly 10 digits'
  };
};

const validateMembershipId = (membershipId) => {
  if (!membershipId) return { isValid: true, message: '' }; // Membership ID is optional
  
  // Check if exactly 12 characters
  if (membershipId.length !== 12) {
    return {
      isValid: false,
      message: 'Membership ID must be exactly 12 characters'
    };
  }
  
  // Check if contains both letters and digits
  const hasLetters = /[a-zA-Z]/.test(membershipId);
  const hasDigits = /\d/.test(membershipId);
  
  if (!hasLetters || !hasDigits) {
    return {
      isValid: false,
      message: 'Membership ID must contain both letters and numbers'
    };
  }
  
  // Check if alphanumeric only
  const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(membershipId);
  
  return {
    isValid: isAlphanumeric,
    message: isAlphanumeric ? '' : 'Membership ID can only contain letters and numbers'
  };
};

// Error message component
const ErrorMessage = ({ message }) => (
  <div className="flex items-center mt-1 text-red-600 text-xs">
    <AlertCircle className="w-3 h-3 mr-1" />
    {message}
  </div>
);

// Customer Form Component (for Create/Edit)
export const CustomerForm = ({ 
  formData, 
  onChange,
  errors = {},
  onValidate,
  isEdit = false,
  selectedCustomer = null
}) => {
  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    onChange(updatedData);
    
    // Trigger validation on change
    if (onValidate) {
      onValidate(field, value);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Basic Information */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">Customer Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={formData.cust_name}
              onChange={(e) => handleChange('cust_name', e.target.value)}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cust_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter customer name"
            />
            {errors.cust_name && <ErrorMessage message={errors.cust_name} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="customer@example.com"
            />
            {errors.email && <ErrorMessage message={errors.email} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter 10-digit phone number"
            />
            {errors.phone && <ErrorMessage message={errors.phone} />}
            {!errors.phone && formData.phone && (
              <div className="mt-1 text-xs text-gray-500">
                {formData.phone.length}/10 digits
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership ID
            </label>
            <input
              type="text"
              value={formData.membership_id || ''}
              onChange={(e) => handleChange('membership_id', e.target.value)}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.membership_id ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter 12-character alphanumeric ID"
            />
            {errors.membership_id && <ErrorMessage message={errors.membership_id} />}
            {!errors.membership_id && formData.membership_id && (
              <div className="mt-1 text-xs text-gray-500">
                {formData.membership_id.length}/12 characters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Customer Modal
export const CreateCustomerModal = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  loading 
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!show) return null;

  const handleValidate = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'cust_name':
        if (!value.trim()) {
          newErrors.cust_name = 'Customer name is required';
        } else {
          delete newErrors.cust_name;
        }
        break;
      
      case 'phone':
        const phoneValidation = validatePhone(value);
        if (!phoneValidation.isValid) {
          newErrors.phone = phoneValidation.message;
        } else {
          delete newErrors.phone;
        }
        break;
      
      case 'membership_id':
        const membershipValidation = validateMembershipId(value);
        if (!membershipValidation.isValid) {
          newErrors.membership_id = membershipValidation.message;
        } else {
          delete newErrors.membership_id;
        }
        break;
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.cust_name?.trim()) {
      newErrors.cust_name = 'Customer name is required';
    }
    
    // Validate phone if provided
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.message;
      }
    }
    
    // Validate membership ID if provided
    if (formData.membership_id) {
      const membershipValidation = validateMembershipId(formData.membership_id);
      if (!membershipValidation.isValid) {
        newErrors.membership_id = membershipValidation.message;
      }
    }
    
    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      cust_name: true,
      email: true,
      phone: true,
      membership_id: true
    });
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length === 0) {
      onSubmit(e);
    } else {
      setErrors(formErrors);
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleFormChange = (updatedData) => {
    onChange(updatedData);
  };

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add New Customer</h3>
          <button
            onClick={onClose}
            className="hidden sm:block text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto pr-2 -mr-2">
            <CustomerForm 
              formData={formData}
              onChange={handleFormChange}
              errors={errors}
              onValidate={handleValidate}
              isEdit={false}
            />
          </div>

          {/* Show validation summary if there are errors */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Please fix the errors above before submitting
              </div>
            </div>
          )}

          <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Add Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

// Edit Customer Modal
export const EditCustomerModal = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  loading,
  selectedCustomer 
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!show || !selectedCustomer) return null;

  const handleValidate = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'cust_name':
        if (!value.trim()) {
          newErrors.cust_name = 'Customer name is required';
        } else {
          delete newErrors.cust_name;
        }
        break;
      
      case 'phone':
        const phoneValidation = validatePhone(value);
        if (!phoneValidation.isValid) {
          newErrors.phone = phoneValidation.message;
        } else {
          delete newErrors.phone;
        }
        break;
      
      case 'membership_id':
        const membershipValidation = validateMembershipId(value);
        if (!membershipValidation.isValid) {
          newErrors.membership_id = membershipValidation.message;
        } else {
          delete newErrors.membership_id;
        }
        break;
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.cust_name?.trim()) {
      newErrors.cust_name = 'Customer name is required';
    }
    
    // Validate phone if provided
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.message;
      }
    }
    
    // Validate membership ID if provided
    if (formData.membership_id) {
      const membershipValidation = validateMembershipId(formData.membership_id);
      if (!membershipValidation.isValid) {
        newErrors.membership_id = membershipValidation.message;
      }
    }
    
    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      cust_name: true,
      email: true,
      phone: true,
      membership_id: true
    });
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length === 0) {
      onSubmit(e);
    } else {
      setErrors(formErrors);
    }
  };

  const handleFormChange = (updatedData) => {
    onChange(updatedData);
  };

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Edit Customer</h3>
          <button
            onClick={onClose}
            className="hidden sm:block text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto pr-2 -mr-2">
            <CustomerForm 
              formData={formData}
              onChange={handleFormChange}
              errors={errors}
              onValidate={handleValidate}
              isEdit={true}
              selectedCustomer={selectedCustomer}
            />
          </div>

          {/* Show validation summary if there are errors */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Please fix the errors above before submitting
              </div>
            </div>
          )}

          <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Updating...
                </>
              ) : (
                'Update Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

// Delete Confirmation Modal
export const DeleteCustomerModal = ({ 
  show, 
  onClose, 
  selectedCustomer,
  onSubmit,
  loading
}) => {
  if (!show || !selectedCustomer) return null;

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <XCircle className="w-6 h-6 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Customer</h3>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Are you sure you want to delete customer <strong>"{selectedCustomer.cust_name}"</strong>?
          This action cannot be undone.
        </p>

        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span>{selectedCustomer.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone:</span>
            <span>{selectedCustomer.phone || 'N/A'}</span>
          </div>
          {selectedCustomer.membership_id && (
            <div className="flex justify-between">
              <span className="text-gray-500">Membership ID:</span>
              <span>{selectedCustomer.membership_id}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Customer'
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

// Customer Details Modal
export const CustomerDetailsModal = ({ 
  show, 
  onClose, 
  selectedCustomer,
  onEditClick,
  formatDate,
  canEditDelete 
}) => {
  if (!show || !selectedCustomer) return null;

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
          <button
            onClick={onClose}
            className="hidden sm:block text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <label className="text-xs text-gray-500">Full Name</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedCustomer.cust_name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <label className="text-xs text-gray-500">Email Address</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedCustomer.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <label className="text-xs text-gray-500">Phone Number</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedCustomer.phone || 'N/A'}</p>
                </div>
              </div>
              {selectedCustomer.membership_id && (
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <label className="text-xs text-gray-500">Membership ID</label>
                    <p className="text-sm text-gray-900 mt-0.5">{selectedCustomer.membership_id}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">System Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <label className="text-xs text-gray-500">Created At</label>
                  <p className="text-sm text-gray-900 mt-0.5">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <label className="text-xs text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900 mt-0.5">{formatDate(selectedCustomer.updatedAt)}</p>
                </div>
              </div>
              {selectedCustomer.createdBy?.FullName && (
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500">Created By</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedCustomer.createdBy.FullName}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
          {canEditDelete && (
            <button
              onClick={() => {
                onClose();
                onEditClick(selectedCustomer);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Edit Customer
            </button>
          )}
        </div>
      </div>
    </ModalContainer>
  );
};

export { validatePhone, validateMembershipId };