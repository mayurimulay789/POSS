import React from 'react';
import { Square, User, Clock, CheckSquare } from 'lucide-react';

const TaskStats = ({ stats, user }) => {
  const { allTasks, myTasks, pendingTasks, completedTasks } = stats;

  const statCards = [
    {
      label: 'All Tasks',
      value: user?.role === 'merchant' ? allTasks.length : myTasks.length,
      icon: Square,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      mobileFull: false
    },
    {
      label: 'My Tasks',
      value: myTasks.length,
      icon: User,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      mobileFull: false
    },
    {
      label: 'Pending',
      value: pendingTasks.length,
      icon: Clock,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      mobileFull: false
    },
    {
      label: 'Completed',
      value: completedTasks.length,
      icon: CheckSquare,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      mobileFull: false
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className={`bg-white rounded-lg shadow p-3 sm:p-4 ${stat.mobileFull ? 'col-span-full' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-800 mt-1 sm:mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`p-2 ${stat.bgColor} rounded-full`}>
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskStats;