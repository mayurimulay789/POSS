import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Filter,
  Settings,
  Calendar as CalendarIcon,
  User
} from 'lucide-react';

const AttendanceCalendar = ({ 
  users = [], 
  loading = false,
  onMonthChange,
  onUserChange,
  selectedMonth,
  selectedUserId,
  attendanceData = []
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedMonth || new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Calculate month stats
  const calculateStats = () => {
    if (!attendanceData.length) return null;
    
    const presentDays = attendanceData.filter(record => record.present).length;
    const absentDays = attendanceData.filter(record => !record.present).length;
    const totalDays = attendanceData.length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
    
    return {
      presentDays,
      absentDays,
      totalDays,
      attendanceRate
    };
  };

  const stats = calculateStats();

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find attendance for this date
      const attendanceRecord = attendanceData.find(record => 
        new Date(record.date).toDateString() === date.toDateString()
      );
      
      days.push({
        day,
        date,
        dateStr,
        present: attendanceRecord?.present || false,
        attendance: attendanceRecord
      });
    }
    
    return days;
  };

  const handleMonthChange = (direction) => {
    let newMonth = currentMonth;
    let newYear = currentYear;
    
    if (direction === 'prev') {
      if (currentMonth === 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      } else {
        newMonth = currentMonth - 1;
      }
    } else {
      if (currentMonth === 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      } else {
        newMonth = currentMonth + 1;
      }
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) onMonthChange(newMonth, newYear);
  };

  const days = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  if (loading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-2 sm:mb-4"></div>
        <p className="text-gray-500 text-sm sm:text-base">Loading attendance calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Mobile Header */}
      <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">View monthly attendance</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="p-1.5 border border-gray-300 rounded-lg"
            >
              <Filter className="w-4 h-4" />
            </button>
           
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-1.5 border border-gray-300 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <div className="font-medium text-gray-800 text-sm">
              {shortMonthNames[currentMonth]} {currentYear}
            </div>
            <div className="text-xs text-gray-500">
              {selectedUserId ? 'Employee View' : 'All Employees'}
            </div>
          </div>
          
          <button
            onClick={() => handleMonthChange('next')}
            className="p-1.5 border border-gray-300 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {isMobileFiltersOpen && (
        <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-3">
            {/* Employee Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-3 h-3 mr-2" />
                Select Employee
              </label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => {
                  onUserChange(e.target.value);
                  setIsMobileFiltersOpen(false);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Employees</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.FullName.length > 20 ? user.FullName.substring(0, 18) + '...' : user.FullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center">
                <CalendarIcon className="w-3 h-3 mr-2" />
                Month
              </label>
              <select
                value={currentMonth}
                onChange={(e) => {
                  const newMonth = parseInt(e.target.value);
                  setCurrentMonth(newMonth);
                  if (onMonthChange) onMonthChange(newMonth, currentYear);
                  setIsMobileFiltersOpen(false);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {shortMonthNames.map((month, index) => (
                  <option key={index} value={index}>
                    {month} {currentYear}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Year</label>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <button
                      key={year}
                      onClick={() => {
                        setCurrentYear(year);
                        if (onMonthChange) onMonthChange(currentMonth, year);
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-sm ${
                        currentYear === year
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(now.getMonth());
                  setCurrentYear(now.getFullYear());
                  if (onMonthChange) onMonthChange(now.getMonth(), now.getFullYear());
                  setIsMobileFiltersOpen(false);
                }}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                Current Month
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header with Filters */}
      <div className="hidden sm:block bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            {/* <h2 className="text-xl font-semibold text-gray-800">Attendance Calendar</h2> */}
            <p className="text-gray-600">View monthly attendance for employees</p>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline-block w-4 h-4 mr-1" />
              Select Employee
            </label>
            <select
              value={selectedUserId || ''}
              onChange={(e) => onUserChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Employees</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.FullName} ({user.role})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              Month
            </label>
            <select
              value={currentMonth}
              onChange={(e) => {
                const newMonth = parseInt(e.target.value);
                setCurrentMonth(newMonth);
                if (onMonthChange) onMonthChange(newMonth, currentYear);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>
                  {month} {currentYear}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              Year
            </label>
            <select
              value={currentYear}
              onChange={(e) => {
                const newYear = parseInt(e.target.value);
                setCurrentYear(newYear);
                if (onMonthChange) onMonthChange(currentMonth, newYear);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Horizontal Scroll */}
      {selectedUserId && stats && (
        <div className="overflow-x-auto pb-2">
          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-2 min-w-max sm:min-w-0">
            <div className="bg-white p-3 rounded-lg border min-w-[140px] sm:min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Days</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.totalDays}</p>
                </div>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border min-w-[140px] sm:min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Present Days</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">{stats.presentDays}</p>
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border min-w-[140px] sm:min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Absent Days</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600">{stats.absentDays}</p>
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border min-w-[140px] sm:min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Attendance Rate</p>
                  <p className="text-lg sm:text-xl font-bold text-orange-600">{stats.attendanceRate}%</p>
                </div>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
        {/* Calendar Header - Desktop */}
        <div className="hidden sm:flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleMonthChange('prev')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              ← Previous
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now.getMonth());
                setCurrentYear(now.getFullYear());
                if (onMonthChange) onMonthChange(now.getMonth(), now.getFullYear());
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Current Month
            </button>
            <button
              onClick={() => handleMonthChange('next')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div 
              key={day} 
              className="text-center font-medium text-gray-500 py-1 sm:py-2 text-xs sm:text-sm"
            >
              {window.innerWidth < 640 ? day.charAt(0) : day}
            </div>
          ))}
          
          {days.map((dayData, index) => (
            <div
              key={index}
              className={`min-h-12 sm:min-h-16 md:min-h-20 lg:min-h-24 p-1 sm:p-2 border rounded ${
                dayData
                  ? dayData.present
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-100'
              } ${dayData ? 'cursor-pointer hover:opacity-90' : ''}`}
              onClick={() => dayData && console.log('Day clicked:', dayData.dateStr)}
            >
              {dayData && (
                <>
                  <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                    <span className={`text-xs sm:text-sm font-medium ${
                      dayData.present ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {dayData.day}
                    </span>
                    {dayData.attendance && window.innerWidth >= 768 && (
                      <span className={`text-xs px-1 sm:px-2 py-0.5 rounded-full ${
                        dayData.present
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {dayData.present ? 'P' : 'A'}
                      </span>
                    )}
                  </div>
                  
                  {dayData.attendance && window.innerWidth >= 768 && (
                    <div className="text-xs text-gray-600 space-y-0.5">
                      {dayData.attendance.startTime && (
                        <div className="truncate" title={`In: ${dayData.attendance.startTime}`}>
                          {dayData.attendance.startTime}
                        </div>
                      )}
                      {dayData.attendance.totalHours && (
                        <div className="font-medium">
                          {dayData.attendance.totalHours}h
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile badge */}
                  {dayData.attendance && window.innerWidth < 768 && (
                    <div className="mt-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        dayData.present ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    </div>
                  )}
                  
                  {!dayData.attendance && dayData.present === false && window.innerWidth >= 768 && (
                    <div className="text-xs text-red-500 italic mt-2 sm:mt-4">
                      No record
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-300 rounded mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-300 rounded mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Absent</span>
          </div>
          <div className="hidden sm:flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
            <span className="text-sm text-gray-600">No Data</span>
          </div>
          <div className="hidden sm:flex items-center">
            <div className="w-4 h-4 bg-gray-50 border border-gray-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Not in Month</span>
          </div>
        </div>

        {/* Mobile Legend */}
        <div className="sm:hidden text-center mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Tap on any day to view details
          </p>
        </div>
      </div>

      {/* Monthly Summary */}
      {selectedUserId && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Monthly Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Attendance Pattern</h4>
              <div className="space-y-1 sm:space-y-2 max-h-40 overflow-y-auto">
                {attendanceData
                  .filter(record => record.present)
                  .slice(0, 5)
                  .map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-xs sm:text-sm text-gray-700">
                        {new Date(record.date).toLocaleDateString('en-IN', {
                          weekday: window.innerWidth < 640 ? 'short' : 'short',
                          day: 'numeric',
                          month: window.innerWidth < 640 ? 'short' : 'short'
                        })}
                      </span>
                      <div className="text-xs sm:text-sm text-green-700 font-medium">
                        {record.totalHours}h
                      </div>
                    </div>
                  ))}
                {attendanceData.filter(record => record.present).length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No attendance records for this month
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Absence Details</h4>
              {stats.absentDays > 0 ? (
                <div className="space-y-1 sm:space-y-2 max-h-40 overflow-y-auto">
                  {attendanceData
                    .filter(record => !record.present)
                    .slice(0, 5)
                    .map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-xs sm:text-sm text-gray-700">
                          {new Date(record.date).toLocaleDateString('en-IN', {
                            weekday: window.innerWidth < 640 ? 'short' : 'short',
                            day: 'numeric',
                            month: window.innerWidth < 640 ? 'short' : 'short'
                          })}
                        </span>
                        <span className="text-xs sm:text-sm text-red-600 font-medium">Absent</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-green-600 text-sm font-medium">Perfect attendance this month! 🎉</div>
                  <p className="text-xs text-gray-500 mt-1">No absences recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AttendanceCalendar;