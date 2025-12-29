import React from 'react';
import { 
  XCircle, 
  Target, 
  RefreshCw, 
  Loader,
  X,
  Mail,
  Phone,
  MapPin,
  User,
  Shield
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

// Customer Form Component (for Create/Edit)
export const CustomerForm = ({ 
  formData, 
  onChange,
  isEdit = false,
  selectedCustomer = null
}) => {
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'blocked', label: 'Blocked' }
  ];

  const membershipTypes = [
    { value: 'none', label: 'No Membership' },
    { value: 'basic', label: 'Basic' },
    { value: 'premium', label: 'Premium' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' }
  ];

  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleAddressChange = (field, value) => {
    onChange({
      ...formData,
      address: {
        ...formData.address,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Basic Information */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">Basic Information</h4>
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
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter 10-digit phone number"
              pattern="[0-9]{10}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">Address Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter street address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter state"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="text"
              value={formData.address.pincode}
              onChange={(e) => handleAddressChange('pincode', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="6-digit pincode"
              pattern="[0-9]{6}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      {/* Membership Information */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">Membership Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership Type
            </label>
            <select
              value={formData.membership_type}
              onChange={(e) => handleChange('membership_type', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {membershipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {!isEdit && (
              <p className="text-xs text-gray-500 mt-1">
                Membership ID will be auto-generated for non-'none' types
              </p>
            )}
          </div>
          
          {isEdit && selectedCustomer?.membership_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membership ID
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm">
                {selectedCustomer.membership_id}
              </div>
            </div>
          )}
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
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <ModalContainer size="lg" onClose={onClose}>
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
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto pr-2 -mr-2">
            <CustomerForm 
              formData={formData}
              onChange={onChange}
              isEdit={false}
            />
          </div>

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
              disabled={loading}
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
  if (!show || !selectedCustomer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <ModalContainer size="lg" onClose={onClose}>
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
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto pr-2 -mr-2">
            <CustomerForm 
              formData={formData}
              onChange={onChange}
              isEdit={true}
              selectedCustomer={selectedCustomer}
            />
          </div>

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
              disabled={loading}
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
  loading,
  getStatus 
}) => {
  if (!show || !selectedCustomer) return null;

  const status = getStatus(selectedCustomer.status);

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <XCircle className="w-6 h-6 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Customer</h3>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Are you sure you want to delete customer <strong>"{selectedCustomer.cust_name}"</strong>?
          This action cannot be undone and will remove all associated data.
        </p>

        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span>{selectedCustomer.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone:</span>
            <span>{selectedCustomer.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
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

// Status Change Modal
export const StatusChangeModal = ({ 
  show, 
  onClose, 
  selectedCustomer,
  status,
  setStatus,
  onSubmit,
  loading 
}) => {
  if (!show || !selectedCustomer) return null;

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800', description: 'Customer can make purchases' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800', description: 'Customer is temporarily disabled' },
    { value: 'suspended', label: 'Suspended', color: 'bg-yellow-100 text-yellow-800', description: 'Customer is suspended from services' },
    { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-800', description: 'Customer is blocked permanently' }
  ];

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <Target className="w-6 h-6 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Change Customer Status</h3>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Change status for <strong>"{selectedCustomer.cust_name}"</strong>
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select New Status
          </label>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <label key={option.value} className="flex items-start">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={status === option.value}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${option.color} mr-2`}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
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
            className="w-full sm:w-auto px-4 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

// Renew Membership Modal
export const RenewMembershipModal = ({ 
  show, 
  onClose, 
  selectedCustomer,
  renewMonths,
  setRenewMonths,
  onSubmit,
  loading,
  formatDate,
  formatMembershipValidity,
  getMembershipType,
  isMembershipValid 
}) => {
  if (!show || !selectedCustomer) return null;

  const membership = getMembershipType(selectedCustomer.membership_type);

  return (
    <ModalContainer size="md" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <RefreshCw className="w-6 h-6 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Renew Membership</h3>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Renew membership for <strong>"{selectedCustomer.cust_name}"</strong>
        </p>

        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Current Membership:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${membership.color}`}>
              {membership.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Membership ID:</span>
            <span>{selectedCustomer.membership_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Current Validity:</span>
            <span>{formatMembershipValidity(selectedCustomer.membership_validity)}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Renew for (months)
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[6, 12, 24].map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => setRenewMonths(months)}
                className={`px-3 py-2 border rounded-lg text-sm ${
                  renewMonths === months
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {months} mo
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom months
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={renewMonths}
              onChange={(e) => setRenewMonths(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
            className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Renewing...
              </>
            ) : (
              'Renew Membership'
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
  formatMembershipValidity,
  getMembershipType,
  getStatus,
  isMembershipValid,
  canEditDelete 
}) => {
  if (!show || !selectedCustomer) return null;

  const membership = getMembershipType(selectedCustomer.membership_type);
  const status = getStatus(selectedCustomer.status);

  return (
    <ModalContainer size="lg" onClose={onClose}>
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
                  <p className="text-sm text-gray-900 mt-0.5">{selectedCustomer.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <label className="text-xs text-gray-500">Phone Number</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedCustomer.phone}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <div className="mt-0.5">
                    <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Membership Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Type</label>
                <div className="mt-0.5">
                  <span className={`px-2 py-1 text-xs rounded-full ${membership.color}`}>
                    {membership.label}
                  </span>
                </div>
              </div>
              {selectedCustomer.membership_id && (
                <div>
                  <label className="text-xs text-gray-500">Membership ID</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedCustomer.membership_id}</p>
                </div>
              )}
              {selectedCustomer.membership_validity && (
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500">Validity</label>
                  <p className={`text-sm mt-0.5 ${isMembershipValid(selectedCustomer.membership_validity) ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMembershipValidity(selectedCustomer.membership_validity)}
                  </p>
                </div>
              )}
              {selectedCustomer.membership_created_date && (
                <div>
                  <label className="text-xs text-gray-500">Created Date</label>
                  <p className="text-sm text-gray-900 mt-0.5">{formatDate(selectedCustomer.membership_created_date)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          {selectedCustomer.address && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Address Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <label className="text-xs text-gray-500">Full Address</label>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {selectedCustomer.address.street && `${selectedCustomer.address.street}, `}
                      {selectedCustomer.address.city || 'N/A'}, 
                      {selectedCustomer.address.state && ` ${selectedCustomer.address.state}, `}
                      {selectedCustomer.address.country || 'India'}
                      {selectedCustomer.address.pincode && ` - ${selectedCustomer.address.pincode}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">System Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500">Created At</label>
                <p className="text-sm text-gray-900 mt-0.5">{formatDate(selectedCustomer.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Last Updated</label>
                <p className="text-sm text-gray-900 mt-0.5">{formatDate(selectedCustomer.updatedAt)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Created By</label>
                <p className="text-sm text-gray-900 mt-0.5">{selectedCustomer.createdBy?.FullName || 'You'}</p>
              </div>
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