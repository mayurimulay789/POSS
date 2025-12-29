import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Filter,
  Search,
  Eye
} from 'lucide-react';

const AttendanceApproval = ({ 
  pendingApprovals, 
  onApprove, 
  onReject, 
  onViewDetails,
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, late, overtime, disputed

  const handleApprove = (id) => {
    if (window.confirm('Approve this attendance record?')) {
      onApprove(id, 'approve');
    }
  };

  const handleReject = (id) => {
    const remarks = prompt('Please enter rejection remarks:');
    if (remarks !== null && remarks.trim() !== '') {
      onApprove(id, 'reject', remarks);
    }
  };

  const getStatusBadge = (record) => {
    if (record.lateMinutes > 30) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Very Late ({record.lateMinutes}m)
        </span>
      );
    } else if (record.lateMinutes > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Late ({record.lateMinutes}m)
        </span>
      );
    } else if (record.isOvertime) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Clock className="w-3 h-3 mr-1" />
          Overtime
        </span>
      );
    }
    return null;
  };

  const filteredApprovals = pendingApprovals.filter(record => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesFilter = filter === 'all' ||
      (filter === 'late' && record.lateMinutes > 0) ||
      (filter === 'overtime' && record.isOvertime) ||
      (filter === 'disputed' && record.remarks && record.remarks.includes('dispute'));
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading pending approvals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Attendance Approval</h2>
            <p className="text-gray-600">Review and approve pending attendance records</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
                />
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Pending</option>
                <option value="late">Late Arrivals</option>
                <option value="overtime">Overtime</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Pending</p>
                <p className="text-2xl font-bold text-blue-700">{pendingApprovals.length}</p>
              </div>
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {pendingApprovals.filter(r => r.lateMinutes > 0).length}
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Overtime</p>
                <p className="text-2xl font-bold text-purple-700">
                  {pendingApprovals.filter(r => r.isOvertime).length}
                </p>
              </div>
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disputed</p>
                <p className="text-2xl font-bold text-gray-700">
                  {pendingApprovals.filter(r => r.remarks && r.remarks.includes('dispute')).length}
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Approval List */}
      {filteredApprovals.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Pending Approvals</h3>
          <p className="text-gray-500">All attendance records are approved</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredApprovals.map((record) => (
              <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  {/* Employee Info */}
                  <div className="mb-4 lg:mb-0 lg:w-1/3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {record.user?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.user?.role || 'Staff'} • {record.user?.email || ''}
                        </div>
                      </div>
                    </div>
                    
                    {getStatusBadge(record)}
                  </div>

                  {/* Attendance Details */}
                  <div className="mb-4 lg:mb-0 lg:w-1/3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(record.date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-medium">
                          {formatTime(record.startTime)} - {record.endTime ? formatTime(record.endTime) : 'Active'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-medium">{record.totalHours || record.duration || '0h'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-medium capitalize">{record.status}</p>
                      </div>
                    </div>
                    
                    {record.remarks && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded">
                        <p className="text-xs text-yellow-700">{record.remarks}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="lg:w-1/3 lg:text-right">
                    <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={() => onViewDetails(record.id)}
                        className="flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleApprove(record.id)}
                        className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      
                      <button
                        onClick={() => handleReject(record.id)}
                        className="flex items-center justify-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Record ID: {record.id?.slice(-8)}
                    </div>
                  </div>
                </div>

                {/* Selfie Preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selfie Verification</p>
                  <div className="flex space-x-4">
                    {record.startSelfie && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Check-in Selfie</p>
                        <a
                          href={record.startSelfie}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={record.startSelfie}
                              alt="Check-in selfie"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="%239CA3AF" d="M12 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0 2c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4z"/></svg>';
                              }}
                            />
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">View Full</span>
                        </a>
                      </div>
                    )}
                    
                    {record.endSelfie && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Check-out Selfie</p>
                        <a
                          href={record.endSelfie}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={record.endSelfie}
                              alt="Check-out selfie"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="%239CA3AF" d="M12 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0 2c-2.21 0-4 1.79-4 4v2h8v-2c0-2.21-1.79-4-4-4z"/></svg>';
                              }}
                            />
                          </div>
                          <span className="text-xs text-blue-600 hover:text-blue-800">View Full</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Approval Guidelines</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Approve records when attendance matches scheduled hours and selfies are valid</span>
          </li>
          <li className="flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Check selfie verification for location and time validation</span>
          </li>
          <li className="flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Review late arrivals and add remarks when approving</span>
          </li>
          <li className="flex items-start">
            <XCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Reject records with invalid selfies or mismatched timings</span>
          </li>
          <li className="flex items-start">
            <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Process approvals within 24 hours for payroll accuracy</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AttendanceApproval;