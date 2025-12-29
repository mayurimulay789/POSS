import React, { useState } from 'react';
import { Square } from 'lucide-react';
import TaskRow from './TaskRow';
import { StatusBadge, PriorityBadge, CategoryBadge } from './TaskBadges';
import { Edit, Trash2, CheckSquare } from 'lucide-react';

// Simple DesktopRow component for table rows
const DesktopRow = ({ 
  task, 
  onEdit, 
  onDelete, 
  onComplete,
  canEdit, 
  canDelete, 
  canComplete,
  formatDate 
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {task.taskName}
          </div>
          {task.taskMessage && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {task.taskMessage}
            </div>
          )}
          <div className="mt-1">
            <CategoryBadge category={task.category} />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {task.assignedTo?.FullName || 'Loading...'}
          {task.assignedTo?.role && (
            <span className="ml-2 text-xs text-gray-500 capitalize">
              ({task.assignedTo.role})
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Assigned by: {task.assignedBy?.FullName || 'You'}
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={task.status} />
        {task.completedTime && (
          <div className="text-xs text-gray-500 mt-1">
            Completed: {formatDate(task.completedTime)}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <PriorityBadge priority={task.priority} />
        {task.estimatedTime && (
          <div className="text-xs text-gray-500 mt-1">
            Est: {task.estimatedTime} min
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {formatDate(task.dueDate)}
        </div>
        {task.assignedTime && (
          <div className="text-xs text-gray-500 mt-1">
            Assigned: {formatDate(task.assignedTime)}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          {canComplete && task.status === 'pending' && (
            <button
              onClick={() => onComplete(task)}
              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
              title="Mark Complete"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          )}
          
          {canEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
              title="Edit Task"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={() => onDelete(task)}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const TaskTable = ({ 
  filteredTasks, 
  loading, 
  searchTerm, 
  activeTab, 
  formatDate,
  canEditTask,
  canDeleteTask,
  canCompleteTask,
  onEditClick,
  onCompleteClick,
  onDeleteClick 
}) => {
  const [expandedTask, setExpandedTask] = useState(null);

  const handleToggleExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500 text-sm sm:text-base">Loading tasks...</p>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <Square className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
        <p className="text-gray-500 text-sm sm:text-base">
          {searchTerm.trim() 
            ? 'No tasks match your search'
            : activeTab === 'all-tasks' 
              ? 'No tasks have been created yet' 
              : `You don't have any ${activeTab.replace('-', ' ')} tasks`}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden">
        {filteredTasks.map((task) => (
          <TaskRow
            key={task._id}
            task={task}
            onEdit={onEditClick}
            onDelete={onDeleteClick}
            onComplete={onCompleteClick}
            canEdit={canEditTask(task)}
            canDelete={canDeleteTask(task)}
            canComplete={canCompleteTask(task)}
            formatDate={formatDate}
            isExpanded={expandedTask === task._id}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <DesktopRow
                key={task._id}
                task={task}
                onEdit={onEditClick}
                onDelete={onDeleteClick}
                onComplete={onCompleteClick}
                canEdit={canEditTask(task)}
                canDelete={canDeleteTask(task)}
                canComplete={canCompleteTask(task)}
                formatDate={formatDate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TaskTable;