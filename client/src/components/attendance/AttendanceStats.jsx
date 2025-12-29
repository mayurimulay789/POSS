import React from 'react';
import { Clock, Calendar, BarChart3, TrendingUp, Users } from 'lucide-react';

const AttendanceStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Hours',
      value: `${stats.totalHours?.toFixed(1) || '0.0'}h`,
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700'
    },
    {
      title: 'Days Present',
      value: stats.daysPresent || 0,
      icon: <Calendar className="w-6 h-6 text-green-600" />,
      color: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-700'
    },
    {
      title: 'Completed Shifts',
      value: stats.completedShifts || 0,
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-700'
    },
    {
      title: 'Avg Hours/Shift',
      value: `${stats.averageHours?.toFixed(1) || '0.0'}h`,
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-50',
      border: 'border-orange-100',
      text: 'text-orange-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} ${stat.border} border rounded-lg p-4 sm:p-6 transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.color.replace('50', '100')}`}>
              {stat.icon}
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {stat.title}
            </span>
          </div>
          
          <div className="mb-1">
            <span className={`text-2xl sm:text-3xl font-bold ${stat.text}`}>
              {stat.value}
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            {stat.title === 'Total Hours' && 'Lifetime total'}
            {stat.title === 'Days Present' && 'Total working days'}
            {stat.title === 'Completed Shifts' && 'Successfully completed'}
            {stat.title === 'Avg Hours/Shift' && 'Average per shift'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceStats;