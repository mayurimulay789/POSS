import React from 'react';
import { IndianRupee, FileText, Shield, Lock } from 'lucide-react';

const ExpenseStats = ({ totalAmount, totalRecords, user, formatCurrency }) => {
  const stats = [
    {
      label: 'Total Expenses',
      value: formatCurrency(totalAmount),
      icon: IndianRupee,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueSize: 'text-xl lg:text-2xl'
    },
    {
      label: 'Total Records',
      value: totalRecords || 0,
      icon: FileText,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      valueSize: 'text-xl lg:text-2xl'
    },
    {
      label: 'Your Permissions',
      value: user?.role === 'merchant' ? 'Full Access' : 'Limited',
      description: user?.role === 'merchant' ? 'Can modify anytime' : 'Can modify only today',
      icon: user?.role === 'merchant' ? Shield : Lock,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueSize: 'text-lg lg:text-xl'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white rounded-lg shadow p-3 lg:p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm text-gray-500 truncate">{stat.label}</p>
              <p className={`${stat.valueSize} font-bold text-gray-800 mt-1 truncate`}>
                {stat.value}
              </p>
              {stat.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {stat.description}
                </p>
              )}
            </div>
            <div className={`p-2 lg:p-2.5 ${stat.bgColor} rounded-full ml-3 flex-shrink-0`}>
              <stat.icon className="w-4 h-4 lg:w-5 lg:h-5" className={stat.iconColor} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseStats;