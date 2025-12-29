import React from 'react';

const TaskTabs = ({ activeTab, setActiveTab, user }) => {
  const tabs = [
    { id: 'all-tasks', label: 'All Tasks', showFor: ['merchant'] },
    { id: 'my-tasks', label: 'My Tasks', showFor: ['merchant', 'manager', 'supervisor', 'staff'] },
    { id: 'assigned-tasks', label: 'Assigned', showFor: ['merchant', 'manager', 'supervisor', 'staff'] },
    { id: 'pending', label: 'Pending', showFor: ['merchant', 'manager', 'supervisor', 'staff'] },
    { id: 'completed', label: 'Completed', showFor: ['merchant', 'manager', 'supervisor', 'staff'] },
  ];

  return (
    <div className="border-b">
      <div className="px-3 sm:px-0">
        <nav className="flex space-x-1 sm:space-x-0 overflow-x-auto -mb-px">
          {tabs
            .filter(tab => tab.showFor.includes(user?.role))
            .map((tab) => (
              <button
                key={tab.id}
                className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
        </nav>
      </div>
    </div>
  );
};

export default TaskTabs;