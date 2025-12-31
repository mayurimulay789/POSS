import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getAllAttendance,
  getTeamAttendance,
  getAttendanceAnalytics,
  approveAttendance,
  exportAttendance,
  clearError,
  clearSuccess,
  setFilters,
  getAttendanceCalendar,
  getMerchantUsers,
  selectAllAttendance,
  selectTeamAttendance,
  selectAttendanceAnalytics,
  selectMerchantAttendanceLoading,
  selectMerchantAttendanceError,
  selectMerchantAttendanceSuccess,
  selectMerchantAttendanceStats,
  selectMerchantAttendanceFilters,
  selectCalendarData,
  selectMerchantUsers,
  selectCalendarLoading
} from '../store/slices/merchantAttendanceSlice';
import merchantAttendanceAPI from '../store/api/merchantAttendanceAPI';
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Download,
  CheckCircle,
  XCircle,
  Filter,
  BarChart3,
  Eye,
  DollarSign,
  AlertCircle,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import MerchantAttendanceTable from '../components/attendance/MerchantAttendanceTable';
import AttendanceAnalytics from '../components/attendance/AttendanceAnalytics';
import TeamAttendanceCalendar from '../components/attendance/TeamAttendanceCalendar';
import ExportAttendance from '../components/attendance/ExportAttendance';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';

const MerchantAttendanceDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const allAttendance = useSelector(selectAllAttendance);
  const teamAttendance = useSelector(selectTeamAttendance);
  const analytics = useSelector(selectAttendanceAnalytics);
  const loading = useSelector(selectMerchantAttendanceLoading);
  const error = useSelector(selectMerchantAttendanceError);
  const success = useSelector(selectMerchantAttendanceSuccess);
  const stats = useSelector(selectMerchantAttendanceStats);
  const filters = useSelector(selectMerchantAttendanceFilters);
  const calendarData = useSelector(selectCalendarData);
  const merchantUsers = useSelector(selectMerchantUsers);
  const calendarLoading = useSelector(selectCalendarLoading);

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportLoading, setExportLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedCalendarUser, setSelectedCalendarUser] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'merchant') {
      loadData();
    }
  }, [user, activeTab, dateRange, selectedDate]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        if (error) dispatch(clearError());
        if (success) dispatch(clearSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  const loadData = () => {
    switch (activeTab) {
      case 'overview':
        dispatch(getAttendanceAnalytics({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }));
        break;
      case 'all':
        dispatch(getAllAttendance({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          page: 1,
          limit: 50
        }));
        break;
      case 'team':
        dispatch(getTeamAttendance({ date: selectedDate }));
        break;
      case 'attendance-calendar':
        loadCalendarData();
        break;
      default:
        break;
    }
  };

  const loadCalendarData = () => {
    dispatch(getMerchantUsers());
    if (selectedCalendarUser) {
      dispatch(getAttendanceCalendar({
        userId: selectedCalendarUser,
        month: calendarMonth,
        year: calendarYear
      }));
    }
  };

  const handleApprove = (attendanceId, action, remarks = '') => {
    dispatch(approveAttendance({ id: attendanceId, action, remarks }));
  };

  const handleExport = useCallback(async (exportConfig) => {
    try {
      setExportLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('format', 'csv');
      params.append('startDate', exportConfig.dateRange.startDate);
      params.append('endDate', exportConfig.dateRange.endDate);
      
      if (exportConfig.filters.status) {
        params.append('status', exportConfig.filters.status);
      }
      if (exportConfig.filters.role) {
        params.append('role', exportConfig.filters.role);
      }
      if (exportConfig.filters.department) {
        params.append('department', exportConfig.filters.department);
      }
      if (exportConfig.include.remarks) {
        params.append('includeRemarks', 'true');
      }
      if (exportConfig.include.selfies) {
        params.append('includeSelfies', 'true');
      }
      
      // Get the export data
      const response = await merchantAttendanceAPI.exportAttendance({
        format: 'csv',
        startDate: exportConfig.dateRange.startDate,
        endDate: exportConfig.dateRange.endDate,
        status: exportConfig.filters.status || '',
        role: exportConfig.filters.role || '',
        department: exportConfig.filters.department || '',
        includeRemarks: exportConfig.include.remarks,
        includeSelfies: exportConfig.include.selfies
      });
      
      if (response.data) {
        // If backend returns CSV data as string
        let csvContent = '';
        
        if (typeof response.data === 'string') {
          csvContent = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Convert JSON data to CSV
          const data = response.data.data;
          if (data.length > 0) {
            // Create headers
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row => 
              Object.values(row).map(value => 
                typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
              ).join(',')
            );
            csvContent = [headers, ...rows].join('\n');
          }
        }
        
        if (csvContent) {
          // Create blob and download
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `attendance_${exportConfig.dateRange.startDate}_to_${exportConfig.dateRange.endDate}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          dispatch(clearError());
        }
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      // Fallback: Try direct download approach
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        const queryParams = new URLSearchParams({
          format: 'csv',
          startDate: exportConfig.dateRange.startDate,
          endDate: exportConfig.dateRange.endDate
        });
        
        if (exportConfig.filters.status) queryParams.append('status', exportConfig.filters.status);
        if (exportConfig.filters.role) queryParams.append('role', exportConfig.filters.role);
        if (exportConfig.filters.department) queryParams.append('department', exportConfig.filters.department);
        
        const url = `${baseUrl}/api/merchant/attendance/export?${queryParams.toString()}`;
        
        // Create a hidden iframe for download
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 10000);
        
      } catch (fallbackError) {
        console.error('Fallback export failed:', fallbackError);
      }
    } finally {
      setExportLoading(false);
    }
  }, [dispatch]);

  const handleSimpleExport = async () => {
    try {
      setExportLoading(true);
      
      const token = localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Create a simple export with current filters
      const params = new URLSearchParams();
      params.append('format', 'csv');
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
      
      const url = `${baseUrl}/api/merchant/attendance/export?${params.toString()}`;
      
      // Method 1: Using fetch with credentials
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: 'csv',
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `attendance_export_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        dispatch(clearError());
      } else {
        throw new Error('Export failed');
      }
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewDetails = (attendanceId) => {
    console.log('View details for:', attendanceId);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleApplyFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
    loadData();
  };

  const handleCalendarMonthChange = (month, year) => {
    setCalendarMonth(month);
    setCalendarYear(year);
    if (selectedCalendarUser) {
      dispatch(getAttendanceCalendar({
        userId: selectedCalendarUser,
        month,
        year
      }));
    }
  };

  const handleCalendarUserChange = (userId) => {
    setSelectedCalendarUser(userId);
    if (userId) {
      dispatch(getAttendanceCalendar({
        userId,
        month: calendarMonth,
        year: calendarYear
      }));
    }
  };

  if (user?.role !== 'merchant') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Only merchants can access attendance management.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          {/* Mobile Header */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 mr-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Attendance Dashboard</h1>
                  <p className="text-xs text-gray-600">Manage team attendance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Attendance Dashboard</h1>
                <p className="text-gray-600">Monitor and manage team attendance</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start sm:items-center">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start sm:items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-green-700 text-sm sm:text-base">{success}</p>
            </div>
          )}

          {/* Mobile Tabs Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mb-4 bg-white rounded-lg shadow border p-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'team', label: 'Team', icon: Users },
                  { id: 'all', label: 'Records', icon: Calendar },
                  { id: 'reports', label: 'Reports', icon: Download },
                  { id: 'attendance-calendar', label: 'Calendar', icon: Calendar }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      py-2 px-3 rounded-lg font-medium text-sm flex flex-col items-center justify-center
                      ${activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 border border-gray-100'
                      }
                    `}
                  >
                    {tab.icon && <tab.icon className="w-4 h-4 mb-1" />}
                    <span className="text-xs">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Tabs */}
          <div className="hidden lg:block border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'team', label: 'Team', icon: Users },
                { id: 'all', label: 'All Records', icon: Calendar },
                { id: 'reports', label: 'Reports', icon: Download },
                { id: 'attendance-calendar', label: 'Attendance Calendar', icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          {/* Mobile Tab Indicator */}
          <div className="lg:hidden bg-gray-50 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'team' && 'Team Attendance'}
                {activeTab === 'all' && 'All Records'}
                {activeTab === 'reports' && 'Reports'}
                {activeTab === 'attendance-calendar' && 'Attendance Calendar'}
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Change Tab
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Overview</h2>
                <div className="flex flex-col xs:flex-row gap-2">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                      className="border rounded-lg px-3 py-2 text-sm w-full xs:w-auto"
                    />
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                      className="border rounded-lg px-3 py-2 text-sm w-full xs:w-auto"
                    />
                  </div>
                  <button 
                    onClick={loadData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <AttendanceAnalytics 
                analytics={analytics} 
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'team' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Team Attendance</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
                  />
                  <button 
                    onClick={() => dispatch(getTeamAttendance({ date: selectedDate }))}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              <TeamAttendanceCalendar
                teamAttendance={teamAttendance}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                onApprove={handleApprove}
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'all' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">All Attendance Records</h2>
                <div className="flex flex-col xs:flex-row gap-2">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                      className="border rounded-lg px-3 py-2 text-sm w-full xs:w-auto"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                      className="border rounded-lg px-3 py-2 text-sm w-full xs:w-auto"
                      placeholder="End Date"
                    />
                  </div>
                  <button 
                    onClick={loadData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    Filter
                  </button>
                </div>
              </div>
              <MerchantAttendanceTable
                attendance={allAttendance}
                loading={loading}
                onApprove={handleApprove}
                onViewDetails={handleViewDetails}
                onExport={handleSimpleExport}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Reports</h2>
              </div>
              <ExportAttendance 
                onExport={handleExport}
                loading={exportLoading}
              />
            </div>
          )}

          {activeTab === 'attendance-calendar' && (
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Attendance Calendar</h2>
              </div>
              <AttendanceCalendar
                users={merchantUsers}
                loading={calendarLoading}
                onMonthChange={handleCalendarMonthChange}
                onUserChange={handleCalendarUserChange}
                selectedMonth={calendarMonth}
                selectedUserId={selectedCalendarUser}
                attendanceData={calendarData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantAttendanceDashboard;