import React from 'react';
// Replace lucide-react with react-icons
import { 
  FaDollarSign, 
  FaPercent, 
  FaMicrochip, 
  FaBox, 
  FaEye, 
  FaEdit,
  FaTrashAlt, 
  FaToggleOn, 
  FaToggleOff,
} from 'react-icons/fa';
import { 
   Eye, Edit,  Trash2 ,ChevronDown, ChevronUp 
} from 'lucide-react';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useSelector } from 'react-redux';

const ChargeTable = ({
  charges,
  loading,
  formatDate,
  onEditClick,
  onDeleteClick,
  onToggleStatus,
  onDetailsClick,
  expandedRows,
  onToggleExpand,
  pagination,
  onPageChange
}) => {
    const user = useSelector(selectCurrentUser);
  // Mobile Card Component
  const MobileChargeCard = ({ charge }) => {
    const expanded = expandedRows[charge._id];

    return (
      <div className="bg-white p-4 border-b border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${charge.category === 'systemcharge' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                {charge.category === 'systemcharge' ? (
                  <FaMicrochip className="h-4 w-4 text-blue-600" />
                ) : (
                  <FaBox className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">{charge.chargeName}</h3>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${charge.category === 'systemcharge'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                    }`}>
                    {charge.category}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${charge.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {charge.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onToggleExpand(charge._id)}
            className="text-gray-400 hover:text-gray-600 ml-2"
            aria-label={expanded ? `Collapse details for ${charge.chargeName}` : `Expand details for ${charge.chargeName}`}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Charge Info */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            {charge.chargeType === 'percentage' ? (
              <FaPercent className="w-3 h-3 mr-1 text-gray-400" />
            ) : (
              <FaDollarSign className="w-3 h-3 mr-1 text-gray-400" />
            )}
            <span className="font-medium">
              {charge.chargeType === 'percentage'
                ? `${charge.value}%`
                : `₹${charge.value}`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Type: </span>
            <span className="font-medium capitalize">{charge.chargeType}</span>
          </div>
        </div>

        {/* Actions */}
        {(user?.role === 'merchant' || user?.role === 'manager') &&(
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <button
            onClick={() => onToggleStatus(charge, !charge.active)}
            className={`flex items-center px-2 py-1 rounded text-xs ${charge.active
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            aria-label={charge.active ? `Deactivate ${charge.chargeName}` : `Activate ${charge.chargeName}`}
          >
            {charge.active ? (
              <>
                <FaToggleOn className="w-3 h-3 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <FaToggleOff className="w-3 h-3 mr-1" />
                Activate
              </>
            )}
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onDetailsClick(charge)}
              className="text-blue-600 hover:text-blue-800 p-1"
              aria-label={`View details for ${charge.chargeName}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditClick(charge)}
              className="text-blue-600 hover:text-blue-800 p-1"
              aria-label={`Edit ${charge.chargeName}`}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteClick(charge)}
              className="text-red-600 hover:text-red-800 p-1"
              aria-label={`Delete ${charge.chargeName}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        )}

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            {/* Charge Details */}
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-1">Charge Details</h4>
              <div className="text-xs text-gray-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{charge.chargeType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Value:</span>
                  <span className="font-medium">
                    {charge.chargeType === 'percentage'
                      ? `${charge.value}%`
                      : `₹${charge.value}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium">{charge.category}</span>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-1">System Information</h4>
              <div className="text-xs text-gray-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{formatDate(charge.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${charge.active ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {charge.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {charge.createdBy?.FullName && (
                  <div className="flex justify-between">
                    <span>Created By:</span>
                    <span>{charge.createdBy.FullName}</span>
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
  const DesktopChargeRow = ({ charge }) => {
    return (
      <React.Fragment key={charge._id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${charge.category === 'systemcharge' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                  {charge.category === 'systemcharge' ? (
                    <FaMicrochip className="h-5 w-5 text-blue-600" />
                  ) : (
                    <FaBox className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {charge.chargeName}
                </div>
              </div>
            </div>
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {charge.chargeType === 'percentage' ? (
                <div className="flex items-center">
                  {charge.value}%
                </div>
              ) : (
                <div className="flex items-center">
                  ₹{charge.value}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-700 mt-0.5">
              Type: {charge.chargeType}
            </div>
          </td>

          <td className="px-6 py-4">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${charge.category === 'systemcharge'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
              }`}>
              {charge.category}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center">
              {charge.active ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-green-600">Active</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm text-red-600">Inactive</span>
                </>
              )}
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-gray-900">
              {formatDate(charge.createdAt)}
            </div>
          </td>
          {(user?.role === 'merchant' || user?.role === 'manager') &&(
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleStatus(charge, !charge.active)}
                className={`flex items-center px-3 py-1 rounded text-sm ${charge.active
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                aria-label={charge.active ? `Deactivate ${charge.chargeName}` : `Activate ${charge.chargeName}`}
              >
                {charge.active ? (
                  <>
                    <FaToggleOn className="w-4 h-4 mr-1" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <FaToggleOff className="w-4 h-4 mr-1" />
                    Activate
                  </>
                )}
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onDetailsClick(charge)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  aria-label={`View details for ${charge.chargeName}`}
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onEditClick(charge)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  aria-label={`Edit ${charge.chargeName}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteClick(charge)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                  aria-label={`Delete ${charge.chargeName}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onToggleExpand(charge._id)}
                  className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                  aria-label={expandedRows[charge._id] ? `Collapse details for ${charge.chargeName}` : `Expand details for ${charge.chargeName}`}
                >
                  {expandedRows[charge._id] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </td>
          )}
        </tr>

        {/* Expanded Row */}
        {expandedRows[charge._id] && (
          <tr className="bg-gray-50">
            <td colSpan="6" className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Charge Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Charge Details</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Charge Type</label>
                        <p className="font-medium capitalize">{charge.chargeType}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Charge Value</label>
                        <p className="font-medium">
                          {charge.chargeType === 'percentage'
                            ? `${charge.value}%`
                            : `₹${charge.value}`}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Display Value</label>
                      <p className="font-medium">
                        {charge.displayValue || (charge.chargeType === 'percentage'
                          ? `${charge.value}%`
                          : `₹${charge.value}`)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">System Information</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Status</label>
                        <p className={`font-medium ${charge.active ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {charge.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Created</label>
                        <p>{formatDate(charge.createdAt)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Last Updated</label>
                      <p>{formatDate(charge.updatedAt)}</p>
                    </div>
                    {charge.createdBy?.FullName && (
                      <div>
                        <label className="text-xs text-gray-500">Created By</label>
                        <p>{charge.createdBy.FullName}</p>
                      </div>
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
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing page {pagination.current || 1} of {pagination.pages || 1}
          <span className="ml-2">•</span>
          <span className="ml-2">Total: {pagination.total || charges.length} charges</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange((pagination.current || 1) - 1)}
            disabled={!pagination.hasPrev}
            className={`px-4 py-2 border rounded-lg ${pagination.hasPrev
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            aria-label="Go to previous page"
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
                className={`px-3 py-1 border rounded ${currentPage === pageNum
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                aria-label={`Go to page ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange((pagination.current || 1) + 1)}
            disabled={!pagination.hasNext}
            className={`px-4 py-2 border rounded-lg ${pagination.hasNext
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            aria-label="Go to next page"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Loading charges...</p>
      </div>
    );
  }

  if (charges.length === 0) {
    return (
      <div className="p-8 text-center">
        <FaDollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No charges found</h3>
        <p className="text-gray-500">
          Start by adding your first charge
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden">
        {charges.map((charge) => (
          <MobileChargeCard key={charge._id} charge={charge} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Charge Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              {(user?.role === 'merchant' || user?.role === 'manager') &&(
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {charges.map((charge) => (
              <DesktopChargeRow key={charge._id} charge={charge} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination />
    </>
  );
};

export default ChargeTable;