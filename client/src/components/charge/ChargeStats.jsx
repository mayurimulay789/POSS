import React from 'react';
// Replace lucide-react with react-icons
import { FaDollarSign, FaPercent, FaMicrochip, FaClock } from 'react-icons/fa';

const ChargeStats = ({ summary, counts }) => {
  const stats = [
    {
      label: 'Total System Charges',
      value: counts?.system || 0,
      icon: FaMicrochip,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      description: 'Mandatory charges'
    },
    {
      label: 'Total Optional Charges',
      value: counts?.optional || 0,
      icon: FaDollarSign,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      description: 'Optional charges'
    },
    {
      label: 'System Charge Rate',
      value: `${summary?.totalSystemChargeRate || 0}%`,
      icon: FaPercent,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      description: 'Total percentage rate'
    },
    {
      label: 'System Fixed Amount',
      value: `₹${summary?.totalSystemChargesAmount || 0}`,
      icon: FaDollarSign,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      description: 'Total fixed amount'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </div>
            <div className={`p-2 ${stat.bgColor} rounded-full ml-4`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(ChargeStats);