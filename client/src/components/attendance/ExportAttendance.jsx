import React, { useState } from 'react';
import { 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  Settings,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';

const ExportAttendance = ({ onExport, loading }) => {
  const [exportConfig, setExportConfig] = useState({
    dateRange: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    include: {
      remarks: true,
      selfies: false
    },
    filters: {
      status: '',
      role: '',
      department: ''
    }
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleExport = async () => {
    const confirmExport = window.confirm(
      `Export attendance data as CSV?`
    );
    
    if (confirmExport && onExport) {
      try {
        await onExport(exportConfig);
      } catch (error) {
        console.error('Export error:', error);
        alert('Export failed. Please try again.');
      }
    }
  };

  const handleIncludeChange = (key) => {
    setExportConfig({
      ...exportConfig,
      include: {
        ...exportConfig.include,
        [key]: !exportConfig.include[key]
      }
    });
  };

  const handleFilterChange = (key, value) => {
    setExportConfig({
      ...exportConfig,
      filters: {
        ...exportConfig.filters,
        [key]: value
      }
    });
  };

  const handleReset = () => {
    setExportConfig({
      dateRange: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      include: {
        remarks: true,
        selfies: false
      },
      filters: {
        status: '',
        role: '',
        department: ''
      }
    });
  };

  // Validate date range
  const isDateRangeValid = () => {
    const start = new Date(exportConfig.dateRange.startDate);
    const end = new Date(exportConfig.dateRange.endDate);
    return start <= end;
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Export Header - Mobile */}
      <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-medium text-gray-800">Export Data</h3>
            <p className="text-xs text-gray-500">Generate CSV report</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              CSV
            </span>
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="p-1.5 border border-gray-300 rounded-lg"
            >
              <Filter className="w-4 h-4 " />
            </button>
          </div>
        </div>
        
        {/* Mobile Quick Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            disabled={loading || !isDateRangeValid()}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium ${
              loading || !isDateRangeValid()
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Processing...' : 'Export'}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export Header - Desktop */}
      <div className="hidden sm:block bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-800">Export Attendance Data</h3>
            <p className="text-sm text-gray-500">Export attendance records in CSV format</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              CSV Format
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {isMobileFiltersOpen && (
        <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            {/* Date Range - Mobile */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exportConfig.dateRange.startDate}
                    onChange={(e) => setExportConfig({
                      ...exportConfig,
                      dateRange: {
                        ...exportConfig.dateRange,
                        startDate: e.target.value
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    max={exportConfig.dateRange.endDate}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={exportConfig.dateRange.endDate}
                    onChange={(e) => setExportConfig({
                      ...exportConfig,
                      dateRange: {
                        ...exportConfig.dateRange,
                        endDate: e.target.value
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    min={exportConfig.dateRange.startDate}
                  />
                </div>
              </div>
              
              {!isDateRangeValid() && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    End date must be after start date
                  </p>
                </div>
              )}
            </div>

            {/* Include Options - Mobile */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Include Options
              </h4>
              <div className="space-y-2">
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportConfig.include.remarks}
                    onChange={() => handleIncludeChange('remarks')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <div className="ml-2">
                    <span className="text-sm text-gray-700">Include Remarks</span>
                  </div>
                </label>
                
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportConfig.include.selfies}
                    onChange={() => handleIncludeChange('selfies')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <div className="ml-2">
                    <span className="text-sm text-gray-700">Include Selfie URLs</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Filters - Mobile */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    value={exportConfig.filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Role</label>
                  <select
                    value={exportConfig.filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Roles</option>
                    <option value="manager">Manager</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Summary */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Export Summary</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium">CSV</span>
                </div>
                <div className="flex justify-between">
                  <span>Date Range:</span>
                  <span className="font-medium">
                    {exportConfig.dateRange.startDate} to {exportConfig.dateRange.endDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Filters:</span>
                  <span className="font-medium">
                    {Object.values(exportConfig.filters).filter(f => f).length > 0 ? 'Applied' : 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Content */}
      <div className="hidden sm:block space-y-4 sm:space-y-6">
        {/* Date Range - Desktop */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Select Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={exportConfig.dateRange.startDate}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  dateRange: {
                    ...exportConfig.dateRange,
                    startDate: e.target.value
                  }
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                max={exportConfig.dateRange.endDate}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={exportConfig.dateRange.endDate}
                onChange={(e) => setExportConfig({
                  ...exportConfig,
                  dateRange: {
                    ...exportConfig.dateRange,
                    endDate: e.target.value
                  }
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={exportConfig.dateRange.startDate}
              />
            </div>
          </div>
          
          {!isDateRangeValid() && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                End date must be after start date
              </p>
            </div>
          )}
        </div>

        {/* Include Options - Desktop */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Include in Export</h3>
          <div className="space-y-2 sm:space-y-3">
            <label className="flex items-center p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={exportConfig.include.remarks}
                  onChange={() => handleIncludeChange('remarks')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <span className="text-sm sm:text-base text-gray-700 font-medium">Include Remarks/Comments</span>
                <p className="text-xs sm:text-sm text-gray-500">Add employee remarks and comments to export</p>
              </div>
            </label>
            
            <label className="flex items-center p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={exportConfig.include.selfies}
                  onChange={() => handleIncludeChange('selfies')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <span className="text-sm sm:text-base text-gray-700 font-medium">Include Selfie URLs</span>
                <p className="text-xs sm:text-sm text-gray-500">Add links to employee selfies (in separate column)</p>
              </div>
            </label>
          </div>
        </div>

        {/* Filters - Desktop */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800">Filter Data</h3>
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={exportConfig.filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={exportConfig.filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={exportConfig.filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
                <option value="hr">Human Resources</option>
                <option value="it">IT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Button & Summary - Desktop */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-2">Export Summary</h4>
              <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Format:</span>
                  <span className="ml-2 font-medium">CSV (Excel compatible)</span>
                </div>
                <div>
                  <span className="text-gray-500">Date Range:</span>
                  <span className="ml-2 font-medium">
                    {exportConfig.dateRange.startDate} to {exportConfig.dateRange.endDate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Filters:</span>
                  <span className="ml-2 font-medium">
                    {Object.values(exportConfig.filters).filter(f => f).length > 0 
                      ? 'Applied' 
                      : 'No filters applied'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Includes:</span>
                  <span className="ml-2 font-medium">
                    {Object.entries(exportConfig.include)
                      .filter(([_, value]) => value)
                      .map(([key]) => key)
                      .join(', ') || 'None'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
              
              <button
                onClick={handleExport}
                disabled={loading || !isDateRangeValid()}
                className={`flex items-center justify-center px-4 sm:px-6 py-2 rounded-lg text-white font-medium text-sm sm:text-base ${
                  loading || !isDateRangeValid()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Processing...' : 'Export as CSV'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <div>Ready to export</div>
            <div className="font-medium">{exportConfig.dateRange.startDate} to {exportConfig.dateRange.endDate}</div>
          </div>
          <button
            onClick={handleExport}
            disabled={loading || !isDateRangeValid()}
            className={`flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium ${
              loading || !isDateRangeValid()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Bottom spacing for mobile fixed bar */}
      <div className="sm:hidden h-16"></div>
    </div>
  );
};

export default ExportAttendance;