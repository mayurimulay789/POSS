import React from 'react';
import { Clock, Calendar, BarChart3, TrendingUp } from 'lucide-react';

const AttendanceStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Hours',
      value: `${stats.totalHours?.toFixed(1) || '0.0'}h`,
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      description: 'Lifetime total'
    },
    {
      title: 'Days Present',
      value: stats.daysPresent || 0,
      icon: <Calendar className="w-5 h-5 text-green-600" />,
      color: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-700',
      description: 'Total working days'
    },
    {
      title: 'Completed Shifts',
      value: stats.completedShifts || 0,
      icon: <BarChart3 className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-700',
      description: 'Successfully completed'
    },
    {
      title: 'Avg Hours/Shift',
      value: `${stats.averageHours?.toFixed(1) || '0.0'}h`,
      icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
      color: 'bg-orange-50',
      border: 'border-orange-100',
      text: 'text-orange-700',
      description: 'Average per shift'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} ${stat.border} border rounded-xl p-2 transition-all duration-200 hover:shadow-md hover:border-opacity-80`}
        >
          {/* Icon and Title Section */}
          <div className="px-1 flex items-center justify-between gap-3 mb-2">
           
            <span className={`text-2xl font-bold ${stat.text}`}>
              {stat.value}
            </span>
             <div className={`p-2.5 rounded-lg ${stat.color.replace('50', '100')}`}>
              {stat.icon}
            </div>
          </div>
          
          {/* Value Section */}
          <div className="mb-1">
            <span className="text-sm font-medium text-gray-600">
              {stat.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceStats;