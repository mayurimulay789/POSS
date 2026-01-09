// src/components/dashboard/StaffDashboard.jsx
import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import StatsCard from './common/StatsCard';

const StaffDashboard = () => {
  const { data, loading, refreshDashboard } = useDashboard();

  if (!data) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <div className="text-gray-500 mb-4">No dashboard data available</div>
        <button 
          onClick={refreshDashboard}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Load Dashboard
        </button>
      </div>
    );
  }

  const {
    overview,
    taskStats,
    performance,
    todaySummary,
    recentActivity = [],
  } = data;

  return (
    <div className="space-y-6 px-4 py-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Staff Dashboard</h2>
        </div>
        <button 
          onClick={refreshDashboard}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <span>↻</span> Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Today's Expenses" 
          value={overview?.myExpensesToday || 0} 
          icon="💰"
          color="blue"
          format="currency"
          isLoading={loading}
        />
        <StatsCard 
          title="Tasks Completed" 
          value={performance?.tasksCompleted || 0} 
          icon="✅"
          color="purple"
          isLoading={loading}
        />
        <StatsCard 
          title="Completion Rate" 
          value={parseFloat(taskStats?.completionRate || '0')} 
          icon="📈"
          color="indigo"
          format="percent"
          isLoading={loading}
        />
         <StatsCard 
          title="Week Expenses" 
          value={overview?.myExpensesThisWeek || 0} 
          icon="💸"
          color="yellow"
          format="currency"
          isLoading={loading}
        />
      </div>
      {/* Task Overview */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{taskStats?.assignedTasks || 0}</div>
            <div className="text-sm text-gray-600">Assigned</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{taskStats?.completedTasks || 0}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{taskStats?.pendingTasks || 0}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{taskStats?.overdueTasks || 0}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{taskStats?.dueToday || 0}</div>
            <div className="text-sm text-gray-600">Due Today</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Tasks Completed:</span>
              <span className="font-semibold">{performance?.tasksCompleted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Completion Time:</span>
              <span className="font-semibold">{performance?.averageCompletionTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Productivity Score:</span>
              <span className="font-semibold">{performance?.productivityScore || '0%'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Tasks to Complete:</span>
              <span className="font-semibold">{todaySummary?.tasksToComplete || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expenses to Submit:</span>
              <span className="font-semibold">{todaySummary?.expensesToSubmit || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Follow-ups:</span>
              <span className="font-semibold">{todaySummary?.customersToFollowUp || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Meetings:</span>
              <span className="font-semibold">{todaySummary?.meetings || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <span className="text-sm text-gray-500">{recentActivity.length} activities</span>
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'task_completed' ? 'bg-green-100' : 
                  activity.type === 'customer_added' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  <span className={
                    activity.type === 'task_completed' ? 'text-green-600' : 
                    activity.type === 'customer_added' ? 'text-blue-600' : 'text-purple-600'
                  }>
                    {activity.type === 'task_completed' ? '✅' : 
                     activity.type === 'customer_added' ? '👤' : '💰'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">
                    {activity.type === 'task_completed' ? `Completed "${activity.task}"` : 
                     activity.type === 'customer_added' ? `Added customer "${activity.customer}"` : 
                     `Submitted ₹${activity.amount} expense`}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
