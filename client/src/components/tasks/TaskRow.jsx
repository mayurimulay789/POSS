import React from 'react';
import { Edit, Trash2, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from './TaskBadges';

const TaskRow = ({ 
  task, 
  onEdit, 
  onDelete, 
  onComplete,
  canEdit, 
  canDelete, 
  canComplete,
  formatDate,
  isExpanded,
  onToggleExpand
}) => {
  return (
    <div className="bg-white p-4 border-b border-gray-200 sm:hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{task.taskName}</h3>
          <div className="mt-1 flex items-center space-x-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        <button
          onClick={() => onToggleExpand(task._id)}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
        <div>
          <span className="text-gray-500 text-xs">Assigned To:</span>
          <p className="font-medium">{task.assignedTo?.FullName || 'Loading...'}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Due Date:</span>
          <p className="font-medium">{formatDate(task.dueDate)}</p>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {/* Category */}
          <div className="mb-3">
            <span className="text-gray-500 text-xs block mb-1">Category:</span>
            <CategoryBadge category={task.category} />
          </div>

          {/* Task Message */}
          {task.taskMessage && (
            <div className="mb-3">
              <span className="text-gray-500 text-xs block mb-1">Description:</span>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                {task.taskMessage}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Assigned by:</span>
              <span>{task.assignedBy?.FullName || 'You'}</span>
            </div>
            {task.estimatedTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Time:</span>
                <span>{task.estimatedTime} min</span>
              </div>
            )}
            {task.completedTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">Completed:</span>
                <span>{formatDate(task.completedTime)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-end space-x-2">
              {canComplete && task.status === 'pending' && (
                <button
                  onClick={() => onComplete(task)}
                  className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100"
                  title="Mark Complete"
                >
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Complete
                </button>
              )}
              
              {canEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100"
                  title="Edit Task"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => onDelete(task)}
                  className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Actions */}
      {!isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-end space-x-2">
            {canComplete && task.status === 'pending' && (
              <button
                onClick={() => onComplete(task)}
                className="text-green-600 hover:text-green-800 p-1"
                title="Mark Complete"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            )}
            
            {canEdit && (
              <button
                onClick={() => onEdit(task)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit Task"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={() => onDelete(task)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskRow;