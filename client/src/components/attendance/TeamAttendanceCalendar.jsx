import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  Users,
  Download,
  Filter,
  MoreVertical,
  Eye,
  Check,
  X
} from 'lucide-react';

const TeamAttendanceCalendar = ({ 
  teamAttendance, 
  selectedDate, 
  onDateChange,
  onApprove,
  loading 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [filter, setFilter] = useState('all'); // 'all', 'present', 'absent', 'late'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    setCurrentDate(new Date(selectedDate));
  }, [selectedDate]);

  const toggleCardExpand = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange(today.toISOString().split('T')[0]);
  };

  const formatDate = (date) => {
    const isMobile = window.innerWidth < 640;
    return date.toLocaleDateString('en-IN', {
      weekday: isMobile ? 'short' : 'long',
      year: 'numeric',
      month: isMobile ? 'short' : 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const iconSize = window.innerWidth < 640 ? 'w-3.5 h-3.5' : 'w-4 h-4';
    switch (status) {
      case 'present':
      case 'completed':
        return <CheckCircle className={`${iconSize} text-green-500`} />;
      case 'absent':
        return <XCircle className={`${iconSize} text-red-500`} />;
      case 'active':
        return <Clock className={`${iconSize} text-blue-500`} />;
      default:
        return <XCircle className={`${iconSize} text-gray-400`} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'absent':
        return 'bg-red-50 border-red-200';
      case 'active':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    const isMobile = window.innerWidth < 640;
    switch (status) {
      case 'present':
      case 'completed':
        return isMobile ? 'Present' : 'Present';
      case 'absent':
        return isMobile ? 'Absent' : 'Absent';
      case 'active':
        return isMobile ? 'Active' : 'Active Shift';
      default:
        return isMobile ? 'No Check-in' : 'Not Checked In';
    }
  };

  // Filter team attendance
  const filteredAttendance = teamAttendance.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'present') return item.status === 'present' || item.status === 'completed';
    if (filter === 'absent') return item.status === 'absent';
    if (filter === 'late') return item.attendance?.lateMinutes > 0;
    return true;
  });

  // Calculate stats
  const stats = {
    total: teamAttendance.length,
    present: teamAttendance.filter(item => 
      item.status === 'present' || item.status === 'completed' || item.status === 'active'
    ).length,
    absent: teamAttendance.filter(item => item.status === 'absent').length,
    late: teamAttendance.filter(item => item.attendance?.lateMinutes > 0).length
  };

  if (loading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-2 sm:mb-4"></div>
        <p className="text-gray-500 text-sm sm:text-base">Loading team attendance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Date Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
        {/* Mobile Header */}
        <div className="sm:hidden mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 text-blue-600 mr-2" />
              <h2 className="text-base font-semibold text-gray-800 truncate max-w-[200px]">
                {formatDate(currentDate)}
              </h2>
            </div>
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="p-1.5 border border-gray-300 rounded-lg"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-center mt-3 space-x-2">
            <button
              onClick={goToPreviousDay}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 flex-shrink-0"
            >
              Today
            </button>
            
            <button
              onClick={goToNextDay}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <input
              type="date"
              value={currentDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                setCurrentDate(newDate);
                onDateChange(e.target.value);
              }}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs w-28"
            />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex sm:items-center justify-between mb-4">
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              {formatDate(currentDate)}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousDay}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={goToToday}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Today
              </button>
              
              <button
                onClick={goToNextDay}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <input
              type="date"
              value={currentDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                setCurrentDate(newDate);
                onDateChange(e.target.value);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
        </div>

        {/* Stats - Mobile Horizontal Scroll */}
        <div className="overflow-x-auto pb-2">
          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-2 min-w-max sm:min-w-0">
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-100 min-w-[120px] sm:min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 truncate">Total Staff</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
            
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-100 min-w-[120px] sm:min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 truncate">Present</p>
                  <p className="text-lg sm:text-xl font-bold text-green-700">{stats.present}</p>
                </div>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              </div>
            </div>
            
            <div className="bg-red-50 p-2 sm:p-3 rounded-lg border border-red-100 min-w-[120px] sm:min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 truncate">Absent</p>
                  <p className="text-lg sm:text-xl font-bold text-red-700">{stats.absent}</p>
                </div>
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg border border-yellow-100 min-w-[120px] sm:min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-600 truncate">Late</p>
                  <p className="text-lg sm:text-xl font-bold text-yellow-700">{stats.late}</p>
                </div>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Dropdown */}
      {isMobileFilterOpen && (
        <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setFilter('all');
                setIsMobileFilterOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            
            <button
              onClick={() => {
                setFilter('present');
                setIsMobileFilterOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${
                filter === 'present'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Present ({stats.present})
            </button>
            
            <button
              onClick={() => {
                setFilter('absent');
                setIsMobileFilterOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${
                filter === 'absent'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Absent ({stats.absent})
            </button>
            
            <button
              onClick={() => {
                setFilter('late');
                setIsMobileFilterOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${
                filter === 'late'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Late ({stats.late})
            </button>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden sm:flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({stats.total})
        </button>
        
        <button
          onClick={() => setFilter('present')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            filter === 'present'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Present ({stats.present})
        </button>
        
        <button
          onClick={() => setFilter('absent')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            filter === 'absent'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Absent ({stats.absent})
        </button>
        
        <button
          onClick={() => setFilter('late')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            filter === 'late'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Late ({stats.late})
        </button>
      </div>

      {/* Team Attendance List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredAttendance.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No attendance records for this date</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAttendance.map((item, index) => (
              <div 
                key={index} 
                className={`p-3 sm:p-4 ${getStatusColor(item.status)} transition-colors hover:bg-opacity-80`}
              >
                {/* Mobile Card View */}
                <div className="sm:hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        {getStatusIcon(item.status)}
                        <span className="ml-2 font-medium text-gray-800 truncate max-w-[180px] text-sm">
                          {item.user?.name || 'Unknown Employee'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 truncate mb-1">
                        {item.user?.email || ''}
                      </div>
                      
                      <div className="flex items-center flex-wrap gap-1 mb-2">
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {item.user?.role || 'Staff'}
                        </span>
                        <span className={`text-xs font-medium ${
                          item.status === 'absent' ? 'text-red-600' : 
                          item.status === 'present' || item.status === 'completed' ? 'text-green-600' : 
                          item.status === 'active' ? 'text-blue-600' : ''
                        }`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      
                      {item.attendance && (
                        <div className="text-xs text-gray-700 space-y-0.5">
                          <div>In: <span className="font-medium">{item.attendance.startTime}</span></div>
                          <div>Out: <span className="font-medium">
                            {item.attendance.endTime ? item.attendance.endTime : '--:--'}
                          </span></div>
                          <div>Hours: <span className="font-medium">
                            {item.attendance.totalHours || item.attendance.duration || '0h'}
                          </span></div>
                          {item.attendance.lateMinutes > 0 && (
                            <div className="text-red-600">
                              Late: {item.attendance.lateMinutes} min
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => toggleCardExpand(index)}
                      className="ml-2 p-1 hover:bg-white rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Expanded Content for Mobile */}
                  {expandedCards[index] && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {item.attendance && item.attendance.startSelfie && (
                        <div className="mb-2">
                          <a
                            href={item.attendance.startSelfie}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Selfie
                          </a>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mb-2">
                        ID: {item.attendance?.id?.slice(-6) || 'N/A'}
                      </div>
                      
                      {item.attendance && (
                        <div className="flex space-x-2">
                          {item.attendance.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => onApprove(item.attendance.id, 'approve')}
                                className="flex-1 px-2 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter rejection remarks:');
                                  if (remarks !== null) {
                                    onApprove(item.attendance.id, 'reject', remarks);
                                  }
                                }}
                                className="flex-1 px-2 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs flex items-center justify-center"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                          
                          {item.attendance.approvalStatus === 'approved' && (
                            <span className="flex-1 px-2 py-1.5 bg-green-100 text-green-700 rounded text-xs text-center">
                              Approved
                            </span>
                          )}
                          
                          {item.attendance.approvalStatus === 'rejected' && (
                            <span className="flex-1 px-2 py-1.5 bg-red-100 text-red-700 rounded text-xs text-center">
                              Rejected
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Desktop Row View */}
                <div className="hidden sm:flex sm:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      {getStatusIcon(item.status)}
                      <span className="ml-2 font-medium text-gray-800 truncate max-w-[200px]">
                        {item.user?.name || 'Unknown Employee'}
                      </span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {item.user?.role || 'Staff'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 truncate max-w-[300px]">
                      {item.user?.email || ''}
                    </div>
                    
                    <div className="text-sm mt-1">
                      <span className="font-medium">Status: </span>
                      <span className={`
                        ${item.status === 'absent' ? 'text-red-600' : ''}
                        ${item.status === 'present' || item.status === 'completed' ? 'text-green-600' : ''}
                        ${item.status === 'active' ? 'text-blue-600' : ''}
                      `}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right min-w-[140px]">
                    {item.attendance ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-500">In: </span>
                          <span className="font-medium">{item.attendance.startTime}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Out: </span>
                          <span className="font-medium">
                            {item.attendance.endTime ? item.attendance.endTime : '--:--'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Hours: </span>
                          <span className="font-medium">
                            {item.attendance.totalHours || item.attendance.duration || '0h'}
                          </span>
                        </div>
                        {item.attendance.lateMinutes > 0 && (
                          <div className="text-xs text-red-600">
                            Late by {item.attendance.lateMinutes} minutes
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No attendance record
                      </div>
                    )}
                    
                    {item.attendance && item.attendance.startSelfie && (
                      <div className="mt-2">
                        <a
                          href={item.attendance.startSelfie}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                        >
                          📸 View Selfie
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Desktop Actions */}
                {item.attendance && (
                  <div className="hidden sm:block mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        ID: {item.attendance.id?.slice(-6) || 'N/A'}
                      </div>
                      
                      <div className="flex space-x-2">
                        {item.attendance.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => onApprove(item.attendance.id, 'approve')}
                              className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs flex items-center"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const remarks = prompt('Enter rejection remarks:');
                                if (remarks !== null) {
                                  onApprove(item.attendance.id, 'reject', remarks);
                                }
                              }}
                              className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs flex items-center"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {item.attendance.approvalStatus === 'approved' && (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs flex items-center">
                            <Check className="w-3 h-3 mr-1" />
                            Approved
                          </span>
                        )}
                        
                        {item.attendance.approvalStatus === 'rejected' && (
                          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs flex items-center">
                            <X className="w-3 h-3 mr-1" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAttendanceCalendar;