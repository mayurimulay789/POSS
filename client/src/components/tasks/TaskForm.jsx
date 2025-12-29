import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Flag, 
  AlertCircle 
} from 'lucide-react';

// Constants
const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800', icon: ArrowDownRight },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800', icon: Flag },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', icon: ArrowUpRight },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: AlertCircle }
];

const categoryOptions = [
  { value: 'cleaning', label: 'Cleaning', color: 'bg-green-100 text-green-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'inventory', label: 'Inventory', color: 'bg-purple-100 text-purple-800' },
  { value: 'customer_service', label: 'Customer Service', color: 'bg-blue-100 text-blue-800' },
  { value: 'reporting', label: 'Reporting', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const durationOptions = [
  { value: 'one_day', label: 'One Day' },
  { value: 'weekday', label: 'Weekday' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom_range', label: 'Custom Range' }
];

const TaskForm = ({ 
  formData, 
  onChange, 
  assignedUsers, 
  user,
  isEdit = false,
  selectedTask = null 
}) => {
  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Task Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Name *
        </label>
        <input
          type="text"
          required
          value={formData.taskName}
          onChange={(e) => handleChange('taskName', e.target.value)}
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter task name"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To *
          </label>
          <select
            required
            value={formData.assignedTo}
            onChange={(e) => handleChange('assignedTo', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isEdit && selectedTask?.status === 'completed'}
          >
            <option value="">Select user</option>
            {assignedUsers.map((userItem) => (
              <option key={userItem._id} value={userItem._id}>
                {userItem.FullName} ({userItem.role})
                {userItem._id === user?._id && ' (Self)'}
              </option>
            ))}
          </select>
        </div>

        {/* Status (only for edit) */}
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || selectedTask?.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Type */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration Type
            </label>
            <select
              value={formData.taskDurationType}
              onChange={(e) => handleChange('taskDurationType', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Estimated Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Time (minutes)
          </label>
          <input
            type="number"
            min="0"
            value={formData.estimatedTime}
            onChange={(e) => handleChange('estimatedTime', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 60"
          />
        </div>
      </div>

      {/* Task Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Message
        </label>
        <textarea
          value={formData.taskMessage}
          onChange={(e) => handleChange('taskMessage', e.target.value)}
          rows="3"
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add task description or instructions..."
        />
      </div>
    </div>
  );
};

export default TaskForm;