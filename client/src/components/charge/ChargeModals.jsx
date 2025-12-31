import React, { useState, useEffect } from 'react';
import { 
  XCircle, 
  Loader,
  DollarSign, 
  Percent, 
  Cpu, 
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Base Modal Container
const ModalContainer = ({ children, size = 'md', onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`bg-white rounded-lg shadow-xl w-full ${
      size === 'sm' ? 'max-w-md' : 
      size === 'md' ? 'max-w-lg' : 
      'max-w-2xl'
    } max-h-[90vh] overflow-y-auto`}>
      {children}
    </div>
  </div>
);

// Charge Form Component
export const ChargeForm = ({ 
  formData, 
  onChange,
  isEdit = false,
  selectedCharge = null
}) => {
  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleChargeTypeChange = (type) => {
    const newFormData = { ...formData, chargeType: type };
    // Reset value when changing type
    if (type === 'percentage') {
      newFormData.value = newFormData.value || 0;
      if (newFormData.value > 100) newFormData.value = 100;
    }
    onChange(newFormData);
  };

  const handleCategoryChange = (category) => {
    onChange({ ...formData, category });
  };

  const handleValueChange = (value) => {
    let numValue = parseFloat(value) || 0;
    
    // Validate based on charge type
    if (formData.chargeType === 'percentage') {
      if (numValue > 100) numValue = 100;
      if (numValue < 0) numValue = 0;
    } else {
      if (numValue < 0) numValue = 0;
    }
    
    onChange({ ...formData, value: numValue });
  };

  return (
    <div className="space-y-6">
      {/* Charge Information */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Charge Information</h4>
        
        {/* Charge Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Charge Name *
          </label>
          <input
            type="text"
            required
            value={formData.chargeName}
            onChange={(e) => handleChange('chargeName', e.target.value)}
            className="w-full mx-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Service Charge, VAT, GST"
          />
          <p className="text-xs text-gray-500 mt-1">
            Unique name for this charge (max 50 characters)
          </p>
        </div>

        {/* Charge Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Charge Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChargeTypeChange('percentage')}
              className={`p-2 border rounded-lg flex flex-col items-center justify-center ${
                formData.chargeType === 'percentage'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Percent className={`w-6 h-6 mb-2 ${
                formData.chargeType === 'percentage' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                formData.chargeType === 'percentage' ? 'text-blue-600' : 'text-gray-700'
              }`}>
                Percentage
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => handleChargeTypeChange('fixed')}
              className={`p-2 border rounded-lg flex flex-col items-center justify-center ${
                formData.chargeType === 'fixed'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <DollarSign className={`w-6 h-6 mb-2 ${
                formData.chargeType === 'fixed' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                formData.chargeType === 'fixed' ? 'text-blue-600' : 'text-gray-700'
              }`}>
                Fixed Amount
              </span>
            </button>
          </div>
        </div>

        {/* Charge Value */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.chargeType === 'percentage' ? 'Percentage Value *' : 'Fixed Amount *'}
          </label>
          <div className="relative">
            {formData.chargeType === 'percentage' ? (
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            ) : (
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            )}
            <input
              type="number"
              required
              min="0"
              max={formData.chargeType === 'percentage' ? 100 : undefined}
              step={formData.chargeType === 'percentage' ? 0.1 : 1}
              value={formData.value}
              onChange={(e) => handleValueChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={formData.chargeType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {formData.chargeType === 'percentage' ? '%' : '₹'}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.chargeType === 'percentage' 
              ? 'Enter percentage value between 0-100%' 
              : 'Enter fixed amount (non-negative)'}
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleCategoryChange('systemcharge')}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
                formData.category === 'systemcharge'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Cpu className={`w-6 h-6 mb-2 ${
                formData.category === 'systemcharge' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                formData.category === 'systemcharge' ? 'text-blue-600' : 'text-gray-700'
              }`}>
                System Charge
              </span>
              <span className="text-xs text-gray-500 mt-1">Applied to all bills</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleCategoryChange('optionalcharge')}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
                formData.category === 'optionalcharge'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Package className={`w-6 h-6 mb-2 ${
                formData.category === 'optionalcharge' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                formData.category === 'optionalcharge' ? 'text-blue-600' : 'text-gray-700'
              }`}>
                Optional Charge
              </span>
              <span className="text-xs text-gray-500 mt-1">Applied selectively</span>
            </button>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleChange('active', !formData.active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                formData.active ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                formData.active ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {formData.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Inactive charges won't be applied to bills
          </p>
        </div>
      </div>

    </div>
  );
};

// Create Charge Modal
export const CreateChargeModal = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  loading 
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New Charge</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
            <ChargeForm 
              formData={formData}
              onChange={onChange}
              isEdit={false}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Charge'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

// Edit Charge Modal
export const EditChargeModal = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  loading,
  selectedCharge 
}) => {
  if (!show || !selectedCharge) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Edit Charge</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
            <ChargeForm 
              formData={formData}
              onChange={onChange}
              isEdit={true}
              selectedCharge={selectedCharge}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Updating...
                </>
              ) : (
                'Update Charge'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

// Delete Confirmation Modal
export const DeleteChargeModal = ({ 
  show, 
  onClose, 
  selectedCharge,
  onSubmit,
  loading
}) => {
  if (!show || !selectedCharge) return null;

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Charge</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the charge <strong>"{selectedCharge.chargeName}"</strong>?
          This action cannot be undone.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium capitalize">{selectedCharge.chargeType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Value:</span>
            <span className="font-medium">
              {selectedCharge.chargeType === 'percentage' 
                ? `${selectedCharge.value}%` 
                : `₹${selectedCharge.value}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Category:</span>
            <span className={`font-medium ${
              selectedCharge.category === 'systemcharge' ? 'text-blue-600' : 'text-green-600'
            }`}>
              {selectedCharge.category === 'systemcharge' ? 'System Charge' : 'Optional Charge'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className={`font-medium ${
              selectedCharge.active ? 'text-green-600' : 'text-red-600'
            }`}>
              {selectedCharge.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Charge'
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

// Status Toggle Confirmation Modal
export const StatusToggleModal = ({ 
  show, 
  onClose, 
  selectedCharge,
  newStatus,
  onSubmit,
  loading
}) => {
  if (!show || !selectedCharge) return null;

  const isActivating = newStatus === true;

  return (
    <ModalContainer size="sm" onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          {isActivating ? (
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-500 mr-2" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {isActivating ? 'Activate Charge' : 'Deactivate Charge'}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          {isActivating 
            ? `Are you sure you want to activate "${selectedCharge.chargeName}"? This charge will be applied to bills.`
            : `Are you sure you want to deactivate "${selectedCharge.chargeName}"? This charge will no longer be applied to bills.`
          }
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className={`px-4 py-2.5 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              isActivating 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                {isActivating ? 'Activating...' : 'Deactivating...'}
              </>
            ) : (
              isActivating ? 'Activate Charge' : 'Deactivate Charge'
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

// Charge Details Modal
export const ChargeDetailsModal = ({ 
  show, 
  onClose, 
  selectedCharge,
  onEditClick,
  formatDate
}) => {
  if (!show || !selectedCharge) return null;

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Charge Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Charge Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-gray-900">{selectedCharge.chargeName}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedCharge.category === 'systemcharge' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedCharge.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedCharge.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCharge.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  {selectedCharge.chargeType === 'percentage' 
                    ? `${selectedCharge.value}%` 
                    : `₹${selectedCharge.value}`}
                </p>
                <p className="text-sm text-gray-500 mt-0.5 capitalize">
                  {selectedCharge.chargeType}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Charge Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Charge Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Charge Type</label>
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedCharge.chargeType}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Display Value</label>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedCharge.displayValue || (selectedCharge.chargeType === 'percentage' 
                      ? `${selectedCharge.value}%` 
                      : `₹${selectedCharge.value}`)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Category</label>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedCharge.category === 'systemcharge' ? 'System Charge' : 'Optional Charge'}
                  </p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">System Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <p className={`text-sm font-medium ${
                    selectedCharge.active ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedCharge.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Created At</label>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedCharge.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Last Updated</label>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedCharge.updatedAt)}</p>
                </div>
                {selectedCharge.createdBy?.FullName && (
                  <div>
                    <label className="text-xs text-gray-500">Created By</label>
                    <p className="text-sm font-medium text-gray-900">{selectedCharge.createdBy.FullName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEditClick(selectedCharge);
            }}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Charge
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};