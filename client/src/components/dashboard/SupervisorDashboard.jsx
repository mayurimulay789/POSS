// src/components/dashboard/SupervisorDashboard.jsx
import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import StatsCard from './common/StatsCard';

const SupervisorDashboard = () => {
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
    customerStats,
    teamStats,
    taskStats,
    dailyStats,
  } = data;

  return (
    <div className="space-y-6 px-4 py-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Supervisor Dashboard</h2>
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
          title="My Expenses" 
          value={overview?.myExpenses || 0} 
          icon="💰"
          color="blue"
          format="currency"
          isLoading={loading}
        />
        <StatsCard 
          title="Team Expenses" 
          value={overview?.teamExpenses || 0} 
          icon="💸"
          color="red"
          format="currency"
          isLoading={loading}
        />
        <StatsCard 
          title="Team Members" 
          value={teamStats?.teamMembers || 0} 
          icon="👥"
          color="green"
          isLoading={loading}
        />
        <StatsCard 
          title="Customers Added (Me)" 
          value={customerStats?.customersAddedByMe || 0} 
          icon="👤"
          color="indigo"
          isLoading={loading}
        />
        <StatsCard 
          title="Memberships Sold" 
          value={customerStats?.membershipConversions || 0} 
          icon="🎫"
          color="green"
          isLoading={loading}
        />
      </div>

    

      {/* Task Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">My Tasks</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tasks:</span>
              <span className="font-semibold">{taskStats?.myTasks?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending:</span>
              <span className="font-semibold text-yellow-600">{taskStats?.myTasks?.pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed:</span>
              <span className="font-semibold text-green-600">{taskStats?.myTasks?.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue:</span>
              <span className="font-semibold text-red-600">{taskStats?.myTasks?.overdue || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Tasks</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Assigned by Me:</span>
              <span className="font-semibold">{taskStats?.teamTasks?.assignedByMe || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending:</span>
              <span className="font-semibold text-yellow-600">{taskStats?.teamTasks?.pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed:</span>
              <span className="font-semibold text-green-600">{taskStats?.teamTasks?.completed || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{dailyStats?.customersAdded || 0}</div>
            <div className="text-sm text-gray-600">Customers Added</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dailyStats?.expensesAdded || 0}</div>
            <div className="text-sm text-gray-600">Expenses Added</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{dailyStats?.tasksCompleted || 0}</div>
            <div className="text-sm text-gray-600">Tasks Completed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{dailyStats?.tasksCreated || 0}</div>
            <div className="text-sm text-gray-600">Tasks Created</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;