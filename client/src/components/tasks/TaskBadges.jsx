import React from 'react';
import { ArrowDownRight, ArrowUpRight, Flag, AlertCircle } from 'lucide-react';

// Priority options for badge
const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800', icon: ArrowDownRight },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800', icon: Flag },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', icon: ArrowUpRight },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: AlertCircle }
];

// Category options
const categoryOptions = [
  { value: 'cleaning', label: 'Cleaning', color: 'bg-green-100 text-green-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'inventory', label: 'Inventory', color: 'bg-purple-100 text-purple-800' },
  { value: 'customer_service', label: 'Customer Service', color: 'bg-blue-100 text-blue-800' },
  { value: 'reporting', label: 'Reporting', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

// Status config
const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
  expired: { color: 'bg-red-100 text-red-800', label: 'Expired' },
  cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${config.color}`}>
      {config.label}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const option = priorityOptions.find(p => p.value === priority);
  if (!option) return null;
  
  const Icon = option.icon;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${option.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      <span className="hidden sm:inline">{option.label}</span>
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const option = categoryOptions.find(c => c.value === category);
  if (!option) return null;
  
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs ${option.color} truncate max-w-[120px]`}>
      {option.label}
    </span>
  );
};