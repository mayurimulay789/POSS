import React from 'react';
import { Plus, Search } from 'lucide-react';

const TaskToolbar = ({ searchTerm, onSearchChange, onCreateTask }) => {
  return (
    <div className="p-3 sm:p-4 border-b">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="w-full sm:flex-1 sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={onCreateTask}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base mt-2 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </button>
      </div>
    </div>
  );
};

export default TaskToolbar;