import React from 'react';
import { Users, User, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

const CustomerStats = ({ stats }) => {
 
  // Determine which format we have
  const isDetailedFormat = stats && stats.totals && stats.membershipValidity;
  const isSimpleFormat = stats && stats._id !== undefined && stats.totalActive !== undefined;

  // Extract data based on format
  const extractStatsData = () => {
    if (!stats) {
      return {
        totalCustomers: 0,
        totalActive: 0,
        totalInactive: 0,
        totalSuspended: 0,
        totalBlocked: 0,
        totalWithMembership: 0,
        validMemberships: 0,
        expiredMemberships: 0
      };
    }

    if (isDetailedFormat) {
      return {
        totalCustomers: stats.totals?.totalCustomers || 0,
        totalActive: stats.totals?.totalActive || 0,
        totalInactive: stats.totals?.totalInactive || 0,
        totalSuspended: stats.totals?.totalSuspended || 0,
        totalBlocked: stats.totals?.totalBlocked || 0,
        totalWithMembership: stats.calculated?.totalWithMembership || stats.membershipValidity?.totalWithMembership || 0,
        validMemberships: stats.membershipValidity?.validMemberships || 0,
        expiredMemberships: stats.membershipValidity?.expiredMemberships || 0
      };
    }

    if (isSimpleFormat) {
      // For simple format, we need to calculate some values
      return {
        totalCustomers: 0, // Not available in simple format
        totalActive: stats.totalActive || 0,
        totalInactive: 0, // Not available in simple format
        totalSuspended: 0, // Not available in simple format
        totalBlocked: 0, // Not available in simple format
        totalWithMembership: stats.totalWithMembership || 0,
        validMemberships: (stats.totalWithMembership || 0) - (stats.totalExpiredMembership || 0),
        expiredMemberships: stats.totalExpiredMembership || 0
      };
    }

    return {
      totalCustomers: 0,
      totalActive: 0,
      totalInactive: 0,
      totalSuspended: 0,
      totalBlocked: 0,
      totalWithMembership: 0,
      validMemberships: 0,
      expiredMemberships: 0
    };
  };

  const data = extractStatsData();

  const statCards = [
    {
      label: 'Total Customers',
      value: data.totalCustomers,
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Active Customers',
      value: data.totalActive,
      icon: User,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
     {
      label: 'Inactive Customers',
      value: data.totalInactive,
      icon: Clock,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'With Membership',
      value: data.totalWithMembership,
      icon: Shield,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Valid Memberships',
      value: data.validMemberships,
      icon: CheckCircle,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 mb-4 lg:mb-6">
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