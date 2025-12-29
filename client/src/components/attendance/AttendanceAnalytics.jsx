import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign,
  CheckCircle,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AttendanceAnalytics = ({ analytics, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
        <p className="text-gray-500 text-sm sm:text-base">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics || Object.keys(analytics).length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">No Analytics Data</h3>
        <p className="text-gray-500 text-sm sm:text-base">Analytics data will appear here</p>
      </div>
    );
  }

  const { summary, byRole, topPerformers } = analytics;

  // Prepare data for charts
  const roleData = Object.keys(byRole).map(role => ({
    name: role.length > 10 ? role.substring(0, 8) + '...' : role,
    fullName: role,
    shifts: byRole[role]?.count || 0,
    hours: byRole[role]?.totalHours || 0
  }));

  const performanceData = topPerformers?.map(performer => ({
    name: performer.user.name,
    shortName: performer.user.name.length > 15 ? 
      performer.user.name.substring(0, 13) + '...' : 
      performer.user.name,
    hours: performer.totalHours,
    shifts: performer.shifts,
    avgHours: performer.avgHours || 0
  })) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Stats - Mobile Horizontal Scroll */}
      <div className="overflow-x-auto pb-2 sm:pb-0">
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3 min-w-max sm:min-w-0">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100 min-w-[150px] sm:min-w-0">
            <div className="flex items-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-blue-600 truncate">Total Shifts</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700 truncate">{summary?.totalShifts || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100 min-w-[150px] sm:min-w-0">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-green-600 truncate">Completed Shifts</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700 truncate">{summary?.completedShifts || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100 min-w-[150px] sm:min-w-0">
            <div className="flex items-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-purple-600 truncate">Total Hours</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-700 truncate">
                  {summary?.totalHours?.toFixed(1) || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-100 min-w-[150px] sm:min-w-0">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-orange-600 truncate">Avg Hours/Shift</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-700 truncate">
                  {summary?.avgHoursPerShift || '0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Shifts by Role - Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
              <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Shifts by Role
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {roleData.length} roles
            </span>
          </div>
          <div className="h-48 sm:h-56 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={30}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Total Shifts') return [value, 'Shifts'];
                    if (name === 'Total Hours') return [value.toFixed(1), 'Hours'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const fullName = roleData.find(r => r.name === label)?.fullName || label;
                    return `Role: ${fullName}`;
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="shifts" 
                  fill="#8884d8" 
                  name="Total Shifts"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#82ca9d" 
                  name="Total Hours"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Top Performers
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {performanceData.length} employees
            </span>
          </div>
          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
            {performanceData.length > 0 ? (
              performanceData.map((performer, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center min-w-0">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0
                      ${index === 0 ? 'bg-yellow-100' : 
                        index === 1 ? 'bg-gray-100' : 
                        index === 2 ? 'bg-orange-100' : 'bg-blue-100'}`}
                    >
                      <span className={`text-xs sm:text-sm font-medium
                        ${index === 0 ? 'text-yellow-600' : 
                          index === 1 ? 'text-gray-600' : 
                          index === 2 ? 'text-orange-600' : 'text-blue-600'}`}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate text-sm sm:text-base">
                        {window.innerWidth < 640 ? performer.shortName : performer.name}
                      </p>
                      <p className="text-xs text-gray-500">{performer.shifts} shifts</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-bold text-gray-800 text-sm sm:text-base">
                      {performer.hours.toFixed(1)}h
                    </p>
                    <p className="text-xs text-green-600">
                      {performer.avgHours.toFixed(1)}h avg
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No performance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Shift Distribution - Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center">
              <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Shift Distribution
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              By Role
            </span>
          </div>
          <div className="h-48 sm:h-56 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="shifts"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} shifts`, 'Count']}
                  labelFormatter={(label) => {
                    const fullName = roleData.find(r => r.name === label)?.fullName || label;
                    return `Role: ${fullName}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Detailed Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Role Performance */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Role Performance</h4>
            <div className="space-y-2">
              {roleData.slice(0, 5).map((role, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm truncate pr-2" title={role.fullName}>
                    {window.innerWidth < 640 ? role.name : role.fullName}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-right">
                    <span className="font-medium text-xs sm:text-sm">
                      {role.shifts} shifts
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:inline">•</span>
                    <span className="font-medium text-xs sm:text-sm">
                      {role.hours.toFixed(1)}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Shift Status */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Shift Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Completed</span>
                <span className="font-medium text-green-600 text-sm sm:text-base">
                  {summary?.completedShifts || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Active</span>
                <span className="font-medium text-blue-600 text-sm sm:text-base">
                  {summary?.activeShifts || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total</span>
                <span className="font-medium text-sm sm:text-base">
                  {summary?.totalShifts || 0}
                </span>
              </div>
            </div>
          </div>
          
          {/* Time Analysis */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Time Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Hours</span>
                <span className="font-medium text-sm sm:text-base">
                  {summary?.totalHours?.toFixed(1) || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Avg per Shift</span>
                <span className="font-medium text-sm sm:text-base">
                  {summary?.avgHoursPerShift || '0.0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Period</span>
                <span className="font-medium text-sm sm:text-base">
                  {analytics.period?.days || 0} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;