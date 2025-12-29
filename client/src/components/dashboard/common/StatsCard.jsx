// src/components/dashboard/common/StatsCard.jsx
import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  color = 'blue', 
  format = 'number',
  isLoading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  const iconColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  const formatValue = (val) => {
    if (val === undefined || val === null) return 'N/A';
    
    if (format === 'currency') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (format === 'percent') {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={`p-6 rounded-xl border ${colorClasses[color]} animate-pulse`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{formatValue(value)}</h3>
        </div>
        <div className={`p-3 rounded-lg ${iconColors[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      {change !== undefined && change !== null && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(change) >= 0 ? '↗' : '↘'} {Math.abs(change)}%
          </span>
          <span className="text-gray-500 text-sm ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;