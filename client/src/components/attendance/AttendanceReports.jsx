import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Filter
} from 'lucide-react';

const AttendanceReports = ({ onGenerateReport, loading }) => {
  const [reportType, setReportType] = useState('daily');
  const [reportConfig, setReportConfig] = useState({
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    format: 'pdf',
    includeCharts: true,
    includeDetails: true
  });

  const reportTypes = [
    { id: 'daily', label: 'Daily Report', icon: Calendar },
    { id: 'weekly', label: 'Weekly Report', icon: Calendar },
    { id: 'monthly', label: 'Monthly Report', icon: Calendar },
    { id: 'employee', label: 'Employee Report', icon: Users },
    { id: 'summary', label: 'Summary Report', icon: TrendingUp }
  ];

  const handleGenerateReport = () => {
    if (onGenerateReport) {
      onGenerateReport({
        type: reportType,
        config: reportConfig
      });
    }
  };

  const getReportDescription = (type) => {
    const descriptions = {
      daily: 'Detailed attendance for a specific day',
      weekly: 'Weekly attendance summary and trends',
      monthly: 'Monthly attendance statistics and analysis',
      employee: 'Individual employee attendance history',
      summary: 'Executive summary with key metrics'
    };
    return descriptions[type] || '';
  };

  const renderDateControls = () => {
    switch (reportType) {
      case 'daily':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={reportConfig.date}
              onChange={(e) => setReportConfig({...reportConfig, date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        );
      
      case 'monthly':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={reportConfig.month}
                onChange={(e) => setReportConfig({...reportConfig, month: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={reportConfig.year}
                onChange={(e) => setReportConfig({...reportConfig, year: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
        );
      
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Period
            </label>
            <input
              type="date"
              value={reportConfig.date}
              onChange={(e) => setReportConfig({...reportConfig, date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
                reportType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <type.icon className={`w-6 h-6 mb-2 ${
                reportType === type.id ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className="font-medium text-sm">{type.label}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {getReportDescription(reportType)}
          </p>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Report Configuration</h3>
        
        {renderDateControls()}
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Output Format */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Output Format</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={reportConfig.format === 'pdf'}
                  onChange={() => setReportConfig({...reportConfig, format: 'pdf'})}
                  className="text-blue-600"
                />
                <FileText className="w-4 h-4 ml-2 mr-2 text-gray-400" />
                <span className="text-gray-700">PDF Document</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={reportConfig.format === 'excel'}
                  onChange={() => setReportConfig({...reportConfig, format: 'excel'})}
                  className="text-blue-600"
                />
                <FileSpreadsheet className="w-4 h-4 ml-2 mr-2 text-gray-400" />
                <span className="text-gray-700">Excel Spreadsheet</span>
              </label>
            </div>
          </div>

          {/* Include Options */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Include Options</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeCharts}
                  onChange={() => setReportConfig({
                    ...reportConfig,
                    includeCharts: !reportConfig.includeCharts
                  })}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Include charts and graphs</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeDetails}
                  onChange={() => setReportConfig({
                    ...reportConfig,
                    includeDetails: !reportConfig.includeDetails
                  })}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Include detailed records</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Report Preview</h3>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-lg text-gray-800">
                {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Attendance Report
              </h4>
              <p className="text-sm text-gray-600">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Format: {reportConfig.format.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Sample content based on report type */}
            {reportType === 'daily' && (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            )}
            
            {reportType === 'monthly' && (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            )}
            
            {reportType === 'summary' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            )}
            
            {reportConfig.includeCharts && (
              <div className="h-40 bg-gray-200 rounded mt-4"></div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          This is a preview. The actual report will contain real data.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Reports are generated with the latest available data
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Preview
          </button>
          
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className={`flex items-center px-6 py-2 rounded-lg text-white ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-800">Analytics</h4>
          </div>
          <p className="text-sm text-blue-700">
            Detailed analytics and trend analysis included in all reports
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-green-800">Team Insights</h4>
          </div>
          <p className="text-sm text-green-700">
            Team performance metrics and individual statistics
          </p>
        </div>
        
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="font-medium text-purple-800">Time Analysis</h4>
          </div>
          <p className="text-sm text-purple-700">
            Comprehensive time tracking and overtime analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;