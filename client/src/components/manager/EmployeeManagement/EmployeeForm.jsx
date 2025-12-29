import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEmployee, updateEmployee, clearError, clearSuccess } from '../../../store/slices/employeeSlice';

const EmployeeForm = ({ employee, onClose }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector(state => state.employees);
  
  const [formData, setFormData] = useState({
    FullName: '',
    email: '',
    password: '',
    role: 'staff',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules configuration
  const validationRules = {
    FullName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s.'-]+$/,
      message: {
        required: 'Full name is required',
        minLength: 'Full name must be at least 2 characters long',
        maxLength: 'Full name cannot exceed 100 characters',
        pattern: 'Full name can only contain letters, spaces, apostrophes, periods, and hyphens'
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: {
        required: 'Email is required',
        pattern: 'Please enter a valid email address'
      }
    },
    password: {
      required: !employee, // Password only required for new employees
      minLength: 6,
      message: {
        required: 'Password is required',
        minLength: 'Password must be at least 6 characters long'
      }
    },
    role: {
      required: true,
      message: {
        required: 'Role is required'
      }
    }
  };

  useEffect(() => {
    if (employee) {
      setFormData({
        FullName: employee.FullName || '',
        email: employee.email || '',
        password: '', // Don't pre-fill password for security
        role: employee.role || 'staff',
        isActive: employee.isActive !== undefined ? employee.isActive : true
      });
    }
  }, [employee]);

  // Handle successful operation and close form
  useEffect(() => {
    if (success && (success.includes('created') || success.includes('updated'))) {
      console.log('Operation successful, closing form in 1 second...');
      
      const timer = setTimeout(() => {
        console.log('Closing form now');
        onClose();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const validateField = (name, value) => {
    const rule = validationRules[name];
    const newErrors = { ...errors };

    if (!rule) {
      delete newErrors[name];
      setErrors(newErrors);
      return true;
    }

    // Clear error if field is empty and not required
    if (!value.toString().trim() && !rule.required) {
      delete newErrors[name];
      setErrors(newErrors);
      return true;
    }

    // Required validation
    if (rule.required && !value.toString().trim()) {
      newErrors[name] = rule.message.required;
    }
    // Pattern validation
    else if (rule.pattern && value.toString().trim() && !rule.pattern.test(value.toString().trim())) {
      newErrors[name] = rule.message.pattern;
    }
    // Min length validation
    else if (rule.minLength && value.toString().trim().length < rule.minLength) {
      newErrors[name] = rule.message.minLength;
    }
    // If no errors, remove from errors object
    else {
      delete newErrors[name];
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    Object.keys(validationRules).forEach(field => {
      const value = formData[field];
      const rule = validationRules[field];
      
      if (rule.required && !value.toString().trim()) {
        newErrors[field] = rule.message.required;
      } else if (value.toString().trim()) {
        if (rule.pattern && !rule.pattern.test(value.toString().trim())) {
          newErrors[field] = rule.message.pattern;
        } else if (rule.minLength && value.toString().trim().length < rule.minLength) {
          newErrors[field] = rule.message.minLength;
        }
      }
    });

    // Mark all fields as touched for error display
    const allTouched = {};
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Validate field in real-time if it's been touched
    if (touched[name]) {
      validateField(name, fieldValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[class*="border-red-300"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log('Submitting form...');

    const submitData = {
      ...formData,
      FullName: formData.FullName.trim(),
      email: formData.email.trim().toLowerCase()
    };

    // Don't send password if it's empty (for updates)
    if (!submitData.password) {
      delete submitData.password;
    }

    // Clear any previous errors
    dispatch(clearError());

    if (employee) {
      console.log('Updating employee...');
      await dispatch(updateEmployee({ id: employee._id, employeeData: submitData }));
    } else {
      console.log('Creating employee...');
      await dispatch(createEmployee(submitData));
    }
  };

  const handleReset = () => {
    setFormData({
      FullName: '',
      email: '',
      password: '',
      role: 'staff',
      isActive: true
    });
    setErrors({});
    setTouched({});
    dispatch(clearError());
  };

  const handleCancel = () => {
    onClose();
  };

  const isFormValid = () => {
    const requiredFields = ['FullName', 'email', 'role'];
    if (!employee) {
      requiredFields.push('password');
    }
    
    const hasRequiredFields = requiredFields.every(field => {
      const value = formData[field];
      return value !== null && value !== undefined && value.toString().trim() !== '';
    });
    
    const hasFieldErrors = Object.keys(errors).length > 0;
    
    return hasRequiredFields && !hasFieldErrors;
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] ? errors[fieldName] : '';
  };

  const roleOptions = [
    { value: 'staff', label: 'Staff', description: 'Basic team member with limited permissions' },
    { value: 'supervisor', label: 'Supervisor', description: 'Can manage staff and oversee operations' },
    { value: 'manager', label: 'Manager', description: 'Has full operational control except employee management' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {success && (success.includes('created') || success.includes('updated')) && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>{success}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-600">Closing...</span>
            <button onClick={handleCancel} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
          <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="FullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="FullName"
            name="FullName"
            value={formData.FullName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError('FullName') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter employee's full name"
            disabled={loading}
            maxLength={100}
          />
          {getFieldError('FullName') && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{getFieldError('FullName')}</span>
            </p>
          )}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              {formData.FullName.length}/100 characters
            </span>
            <span className="text-xs text-gray-500">
              Letters, spaces, apostrophes, periods, and hyphens allowed
            </span>
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError('email') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="employee@company.com"
            disabled={loading}
          />
          {getFieldError('email') && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{getFieldError('email')}</span>
            </p>
          )}
        </div>

        {/* Password - Only for new employees */}
        {!employee && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('password') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter a secure password"
              disabled={loading}
              minLength={6}
            />
            {getFieldError('password') && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{getFieldError('password')}</span>
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters required
            </p>
          </div>
        )}

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {roleOptions.map(option => (
              <label key={option.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={formData.role === option.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          {getFieldError('role') && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{getFieldError('role')}</span>
            </p>
          )}
        </div>

        {/* Status */}
        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
              Active Employee
            </label>
            <p className="text-sm text-gray-600 mt-1">
              {formData.isActive 
                ? '✅ This employee is active and can access the system' 
                : '❌ This employee is inactive and cannot access the system'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              You can change this status anytime after creation
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{employee ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{employee ? 'Update Employee' : 'Create Employee'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;