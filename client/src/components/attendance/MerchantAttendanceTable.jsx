import React, { useState } from 'react';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Filter,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  X,
  Image
} from 'lucide-react';

const MerchantAttendanceTable = ({ 
  attendance, 
  loading, 
  onApprove, 
  onViewDetails,
  onExport 
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    approvalStatus: '',
    date: '',
    employee: ''
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const handleApprove = (id) => {
    if (window.confirm('Approve this attendance?')) {
      onApprove(id, 'approve');
    }
  };

  const handleReject = (id) => {
    const remarks = prompt('Enter rejection remarks:');
    if (remarks !== null) {
      onApprove(id, 'reject', remarks);
    }
  };

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusBadge = (status) => {
    const isMobile = window.innerWidth < 768;
    const statusConfig = {
      active: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: isMobile ? '⏳' : <Clock className="w-3 h-3" />,
        text: isMobile ? 'Active' : 'Active'
      },
      completed: { 
        color: 'bg-green-100 text-green-800', 
        icon: isMobile ? '✅' : <CheckCircle className="w-3 h-3" />,
        text: isMobile ? 'Done' : 'Completed'
      }
    };
    const config = statusConfig[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: '?',
      text: status
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {!isMobile && React.cloneElement(config.icon, { className: 'w-3 h-3 mr-1' })}
        {isMobile && <span className="mr-1">{config.icon}</span>}
        {config.text}
      </span>
    );
  };

  const getApprovalBadge = (status) => {
    const isMobile = window.innerWidth < 768;
    const approvalConfig = {
      approved: { 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="w-3 h-3" />,
        text: isMobile ? 'Approved' : 'Approved'
      },
      rejected: { 
        color: 'bg-red-100 text-red-800', 
        icon: <XCircle className="w-3 h-3" />,
        text: isMobile ? 'Rejected' : 'Rejected'
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="w-3 h-3" />,
        text: isMobile ? 'Pending' : 'Pending'
      }
    };
    const config = approvalConfig[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: '?',
      text: status
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {React.cloneElement(config.icon, { className: 'w-3 h-3 mr-1' })}
        {config.text}
      </span>
    );
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const isMobile = window.innerWidth < 768;
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: isMobile ? 'short' : 'short',
      year: isMobile ? '2-digit' : 'numeric'
    });
  };

  // Filter attendance based on filters
  const filteredAttendance = attendance.filter(item => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.approvalStatus && item.approvalStatus !== filters.approvalStatus) return false;
    if (filters.date && formatDate(item.date) !== formatDate(filters.date)) return false;
    if (filters.employee && !item.user.name.toLowerCase().includes(filters.employee.toLowerCase())) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAttendance = filteredAttendance.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-2 sm:mb-4"></div>
        <p className="text-gray-500 text-sm sm:text-base">Loading attendance records...</p>
      </div>
    );
  }

  if (attendance.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">No Attendance Records</h3>
        <p className="text-gray-500 text-sm sm:text-base">No attendance data available for your team.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Filter Header */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-medium text-gray-800">Attendance Records</h3>
            <p className="text-xs text-gray-500">{filteredAttendance.length} records found</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={onExport}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Items Per Page Selector */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          
          <div className="text-xs text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        {isMobileFiltersOpen && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Approval</label>
                <select
                  value={filters.approvalStatus}
                  onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Approval</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={filters.employee}
                    onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setFilters({ status: '', approvalStatus: '', date: '', employee: '' })}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Approval</label>
            <select
              value={filters.approvalStatus}
              onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Approval</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={filters.employee}
                onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={() => setFilters({ status: '', approvalStatus: '', date: '', employee: '' })}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm"
            >
              Clear
            </button>
            <button
              onClick={onExport}
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar - Desktop */}
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Showing {filteredAttendance.length} records
          {selectedRows.length > 0 && (
            <span className="ml-2 text-blue-600">
              • {selectedRows.length} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Approval
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAttendance.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {record.user?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.user?.role || 'Staff'} • {record.user?.email || ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {formatDate(record.date)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {record.startTime} - {record.endTime ? record.endTime : 'Active'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {record.totalHours ? `${record.totalHours}h` : record.duration}
                  </div>
                  {record.lateMinutes > 0 && (
                    <div className="text-xs text-red-600">
                      Late: {record.lateMinutes}m
                    </div>
                  )}
                  {record.overtimeHours > 0 && (
                    <div className="text-xs text-orange-600">
                      OT: {record.overtimeHours}h
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(record.status)}
                </td>
                <td className="px-4 py-4">
                  {getApprovalBadge(record.approvalStatus)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(record.id)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {record.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(record.id)}
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(record.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    {record.startSelfie && (
                      <a
                        href={record.startSelfie}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50"
                        title="View Selfie"
                      >
                        <Image className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {paginatedAttendance.map((record) => (
          <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900 text-sm">
                    {record.user?.name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {record.user?.role || 'Staff'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleRowExpand(record.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedRows[record.id] ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Card Content */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(record.date)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Time</div>
                <div className="text-sm text-gray-900">
                  {record.startTime} - {record.endTime ? record.endTime : 'Active'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">{getStatusBadge(record.status)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Approval</div>
                <div className="mt-1">{getApprovalBadge(record.approvalStatus)}</div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedRows[record.id] && (
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="text-sm font-medium text-gray-900">
                    {record.totalHours ? `${record.totalHours}h` : record.duration}
                  </div>
                  {(record.lateMinutes > 0 || record.overtimeHours > 0) && (
                    <div className="flex space-x-3 mt-1">
                      {record.lateMinutes > 0 && (
                        <span className="text-xs text-red-600">
                          Late: {record.lateMinutes}m
                        </span>
                      )}
                      {record.overtimeHours > 0 && (
                        <span className="text-xs text-orange-600">
                          OT: {record.overtimeHours}h
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-sm text-gray-900 truncate">
                    {record.user?.email || 'N/A'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => onViewDetails(record.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </button>
                  
                  {record.approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(record.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(record.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </>
                  )}
                </div>

                {record.startSelfie && (
                  <a
                    href={record.startSelfie}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-purple-600 hover:text-purple-800 text-sm"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    View Selfie
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-700 mb-2 sm:mb-0">
            Page {currentPage} of {totalPages} • {filteredAttendance.length} records
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-sm ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">←</span>
            </button>
            
            {[...Array(Math.min(window.innerWidth < 640 ? 3 : 5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantAttendanceTable;