import React from 'react';
import { Users, Mail, Phone, Key } from 'lucide-react';

const CustomerStats = ({ stats }) => {
  // Extract data from stats
  const getStatsData = () => {
    if (!stats || typeof stats !== 'object') {
      return {
        totalCustomers: 0,
        totalWithEmail: 0,
        totalWithPhone: 0,
        totalWithMembershipId: 0
      };
    }

    return {
      totalCustomers: stats.totalCustomers || 0,
      totalWithEmail: stats.totalWithEmail || 0,
      totalWithPhone: stats.totalWithPhone || 0,
      totalWithMembershipId: stats.totalWithMembershipId || 0
    };
  };

  const data = getStatsData();

  const statCards = [
    {
      label: 'Total Customers',
      value: data.totalCustomers,
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'With Email',
      value: data.totalWithEmail,
      icon: Mail,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'With Phone',
      value: data.totalWithPhone,
      icon: Phone,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'With Membership ID',
      value: data.totalWithMembershipId,
      icon: Key,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white rounded-lg shadow p-3 lg:p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-500">{stat.label}</p>
              <p className="text-lg lg:text-xl font-bold text-gray-800 mt-0.5 lg:mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`p-2 ${stat.bgColor} rounded-full ml-2`}>
              <stat.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerStats;