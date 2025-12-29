import React from 'react';
import { 
  Users, User, Mail, Phone, MapPin, Eye, Edit, 
  Target, RefreshCw, Trash2, ChevronDown, ChevronUp 
} from 'lucide-react';

const CustomerTable = ({
  customers,
  loading,
  canEditDelete,
  user,
  formatDate,
  formatMembershipValidity,
  getMembershipType,
  getStatus,
  isMembershipValid,
  onEditClick,
  onDeleteClick,
  onStatusClick,
  onRenewClick,
  onDetailsClick,
  expandedRows,
  onToggleExpand,
  pagination,
  onPageChange
}) => {
  // Mobile Card Component
  const MobileCustomerCard = ({ customer }) => {
    const membership = getMembershipType(customer.membership_type);
    const status = getStatus(customer.status);
    const expanded = expandedRows[customer._id];
    const canRenew = customer.membership_type !== 'none' && (user?.role === 'merchant' || user?.role === 'manager');

    return (
      <div className="bg-white p-4 border-b border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">{customer.cust_name}</h3>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${membership.color}`}>
                    {membership.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onToggleExpand(customer._id)}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Mail className="w-3 h-3 mr-1 text-gray-400" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-3 h-3 mr-1 text-gray-400" />
            <span>{customer.phone}</span>
          </div>
        </div>

        {/* Basic Info */}
        <div className="text-xs text-gray-500 space-y-1 mb-3">
          <div>Created: {formatDate(customer.createdAt)}</div>
          {customer.address?.city && (
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {customer.address.city}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onDetailsClick(customer)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {canEditDelete && (
              <>
                <button
                  onClick={() => onEditClick(customer)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit Customer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onStatusClick(customer)}
                  className="text-yellow-600 hover:text-yellow-800 p-1"
                  title="Change Status"
                >
                  <Target className="w-4 h-4" />
                </button>
                {canRenew && (
                  <button
                    onClick={() => onRenewClick(customer)}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Renew Membership"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDeleteClick(customer)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete Customer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            {/* Address Details */}
            {customer.address && (
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Address</h4>
                <div className="text-xs text-gray-600 space-y-0.5">
                  {customer.address.street && <div>{customer.address.street}</div>}
                  <div>
                    {customer.address.city && `${customer.address.city}, `}
                    {customer.address.state && `${customer.address.state}, `}
                    {customer.address.country || 'India'}
                    {customer.address.pincode && ` - ${customer.address.pincode}`}
                  </div>
                </div>
              </div>
            )}

            {/* Membership Details */}
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-1">Membership</h4>
              <div className="text-xs text-gray-600 space-y-0.5">
                <div>Type: {membership.label}</div>
                {customer.membership_id && <div>ID: {customer.membership_id}</div>}
                {customer.membership_validity && (
                  <div>
                    {formatMembershipValidity(customer.membership_validity)}
                    <span className={`ml-1 px-1 rounded text-xs ${isMembershipValid(customer.membership_validity) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {isMembershipValid(customer.membership_validity) ? 'Valid' : 'Expired'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Desktop Table Row Component
  const DesktopCustomerRow = ({ customer }) => {
    const membership = getMembershipType(customer.membership_type);
    const status = getStatus(customer.status);
    const canRenew = customer.membership_type !== 'none' && (user?.role === 'merchant' || user?.role === 'manager');

    return (
      <React.Fragment key={customer._id}>
        <tr className="hover:bg-gray-50">
          <td className="px-4 sm:px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {customer.cust_name}
                </div>
                {customer.address?.city && (
                  <div className="text-sm text-gray-500 flex items-center mt-0.5">
                    <MapPin className="w-3 h-3 mr-1" />
                    {customer.address.city}
                  </div>
                )}
              </div>
            </div>
          </td>
          <td className="px-4 sm:px-6 py-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-900 flex items-center">
                <Mail className="w-3 h-3 mr-2" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Phone className="w-3 h-3 mr-2" />
                {customer.phone}
              </div>
            </div>
          </td>
          <td className="px-4 sm:px-6 py-4">
            <div className="space-y-1">
              <span className={`px-2 py-1 text-xs rounded-full ${membership.color}`}>
                {membership.label}
              </span>
              {customer.membership_id && (
                <div className="text-xs text-gray-500">
                  ID: {customer.membership_id}
                </div>
              )}
              {customer.membership_validity && (
                <div className={`text-xs ${isMembershipValid(customer.membership_validity) ? 'text-green-600' : 'text-red-600'}`}>
                  {formatMembershipValidity(customer.membership_validity)}
                </div>
              )}
            </div>
          </td>
          <td className="px-4 sm:px-6 py-4">
            <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
              {status.label}
            </span>
          </td>
          <td className="px-4 sm:px-6 py-4">
            <div className="text-sm text-gray-900">
              {formatDate(customer.createdAt)}
            </div>
            <div className="text-xs text-gray-500">
              By: {customer.createdBy?.FullName || 'You'}
            </div>
          </td>
          <td className="px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onDetailsClick(customer)}
                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>

              {canEditDelete && (
                <>
                  <button
                    onClick={() => onEditClick(customer)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Edit Customer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onStatusClick(customer)}
                    className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                    title="Change Status"
                  >
                    <Target className="w-4 h-4" />
                  </button>
                  {canRenew && (
                    <button
                      onClick={() => onRenewClick(customer)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                      title="Renew Membership"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteClick(customer)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={() => onToggleExpand(customer._id)}
                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                title={expandedRows[customer._id] ? 'Collapse' : 'Expand'}
              >
                {expandedRows[customer._id] ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </td>
        </tr>

        {/* Expanded Row */}
        {expandedRows[customer._id] && (
          <tr className="bg-gray-50">
            <td colSpan="6" className="px-4 sm:px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Address Details</h4>
                  {customer.address ? (
                    <div className="text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                      {customer.address.street && (
                        <div>{customer.address.street}</div>
                      )}
                      <div>
                        {customer.address.city && `${customer.address.city}, `}
                        {customer.address.state && `${customer.address.state}, `}
                        {customer.address.country || 'India'}
                        {customer.address.pincode && ` - ${customer.address.pincode}`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-500">No address provided</div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Membership Details</h4>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                    <div>
                      Type: <span className="font-medium">{membership.label}</span>
                    </div>
                    {customer.membership_id && (
                      <div>ID: {customer.membership_id}</div>
                    )}
                    {customer.membership_created_date && (
                      <div>Created: {formatDate(customer.membership_created_date)}</div>
                    )}
                    {customer.membership_validity && (
                      <div>
                        Validity: {formatDate(customer.membership_validity)}
                        <span className={`ml-1 sm:ml-2 px-1 rounded text-xs ${isMembershipValid(customer.membership_validity) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isMembershipValid(customer.membership_validity) ? 'Valid' : 'Expired'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Additional Info</h4>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                    <div>Created: {formatDate(customer.createdAt)}</div>
                    <div>Last Updated: {formatDate(customer.updatedAt)}</div>
                    {customer.createdBy?.FullName && (
                      <div>Created By: {customer.createdBy.FullName}</div>
                    )}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // Pagination Component
  const Pagination = () => {
    if (!pagination || pagination.pages <= 1) return null;

    return (
      <div className="px-3 sm:px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
        <div className="text-xs sm:text-sm text-gray-500">
          Showing page {pagination.current || 1} of {pagination.pages || 1}
          <span className="hidden sm:inline ml-2">•</span>
          <span className="ml-0 sm:ml-2 block sm:inline">Total: {pagination.total || customers.length} customers</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange((pagination.current || 1) - 1)}
            disabled={!pagination.hasPrev}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm ${
              pagination.hasPrev
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(3, pagination.pages || 1) }, (_, i) => {
            const currentPage = pagination.current || 1;
            const totalPages = pagination.pages || 1;
            let pageNum;
            
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (currentPage <= 2) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 1) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = currentPage - 1 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2 sm:px-3 py-1 sm:py-1 border rounded text-xs sm:text-sm ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => onPageChange((pagination.current || 1) + 1)}
            disabled={!pagination.hasNext}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm ${
              pagination.hasNext
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500 text-sm sm:text-base">Loading customers...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No customers found</h3>
        <p className="text-gray-500 text-sm sm:text-base">
          Start by adding your first customer
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden">
        {customers.map((customer) => (
          <MobileCustomerCard key={customer._id} customer={customer} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membership
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <DesktopCustomerRow key={customer._id} customer={customer} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination />
    </>
  );
};

export default CustomerTable;