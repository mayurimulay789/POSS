

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getAllTasks,
  getMyTasks,
  getAssignedTasks,
  getMyPendingTasks,
  getMyCompletedTasks,
  createTask,
  updateTask,
  deleteTask,
  clearError,
  clearSuccess
} from '../store/slices/taskSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import employeeAPI from '../store/api/employeeAPI';
import { 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

// Import components
import {
  TaskStats,
  TaskTabs,
  TaskToolbar,
  TaskTable,
  CreateTaskModal,
  EditTaskModal,
  CompleteTaskModal,
  DeleteTaskModal
} from '../components/tasks';

const TaskManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const {
    allTasks,
    myTasks,
    assignedTasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    success
  } = useSelector((state) => state.tasks);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('my-tasks');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    taskName: '',
    taskMessage: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    category: 'other',
    estimatedTime: '',
    taskDurationType: 'one_day'
  });
  const [completeMessage, setCompleteMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Set default tab based on user role when component mounts
  useEffect(() => {
    if (user) {
      if (user.role === 'merchant') {
        setActiveTab('all-tasks');
      } else {
        setActiveTab('my-tasks');
      }
    }
  }, [user]);

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await employeeAPI.getEmployees();
        if (response.data.users) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    
    loadUsers();
  }, []);

  // Load tasks based on activeTab and user
  useEffect(() => {
    if (!user?._id) return;

    const loadTasks = () => {
      try {
        switch (activeTab) {
          case 'all-tasks':
            if (user.role === 'merchant') {
              dispatch(getAllTasks());
            } else {
              setActiveTab('my-tasks');
              dispatch(getMyTasks());
            }
            break;
          case 'my-tasks':
            dispatch(getMyTasks());
            break;
          case 'assigned-tasks':
            dispatch(getAssignedTasks());
            break;
          case 'pending':
            dispatch(getMyPendingTasks());
            break;
          case 'completed':
            dispatch(getMyCompletedTasks());
            break;
          default:
            dispatch(getMyTasks());
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, [activeTab, user?._id, dispatch, user?.role]);

  // Clear error/success messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get filtered tasks based on search term
  const getFilteredTasks = useCallback(() => {
    let tasks = [];
    switch (activeTab) {
      case 'all-tasks': tasks = allTasks; break;
      case 'my-tasks': tasks = myTasks; break;
      case 'assigned-tasks': tasks = assignedTasks; break;
      case 'pending': tasks = pendingTasks; break;
      case 'completed': tasks = completedTasks; break;
      default: tasks = myTasks;
    }

    if (!searchTerm.trim()) return tasks;

    const lowerSearch = searchTerm.toLowerCase();
    return tasks.filter(task => 
      task.taskName.toLowerCase().includes(lowerSearch) ||
      (task.taskMessage && task.taskMessage.toLowerCase().includes(lowerSearch)) ||
      (task.assignedTo?.FullName && task.assignedTo.FullName.toLowerCase().includes(lowerSearch)) ||
      (task.assignedBy?.FullName && task.assignedBy.FullName.toLowerCase().includes(lowerSearch))
    );
  }, [activeTab, allTasks, myTasks, assignedTasks, pendingTasks, completedTasks, searchTerm]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined
    };
    
    const result = await dispatch(createTask(taskData));
    
    if (!result.error) {
      setShowCreateModal(false);
      setFormData({
        taskName: '',
        taskMessage: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
        category: 'other',
        estimatedTime: '',
        taskDurationType: 'one_day'
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    const taskData = {
      ...formData,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined
    };
    
    const result = await dispatch(updateTask({
      id: selectedTask._id,
      taskData
    }));
    
    if (!result.error) {
      setShowEditModal(false);
      setSelectedTask(null);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    
    const result = await dispatch(updateTask({
      id: selectedTask._id,
      taskData: {
        status: 'completed',
        taskCompleteMessage: completeMessage,
        completedTime: new Date().toISOString()
      }
    }));
    
    if (!result.error) {
      setShowCompleteModal(false);
      setSelectedTask(null);
      setCompleteMessage('');
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    
    const result = await dispatch(deleteTask(selectedTask._id));
    if (!result.error) {
      setShowDeleteModal(false);
      setSelectedTask(null);
    }
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setFormData({
      taskName: task.taskName,
      taskMessage: task.taskMessage || '',
      assignedTo: task.assignedTo?._id || task.assignedTo,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority,
      category: task.category,
      estimatedTime: task.estimatedTime || '',
      taskDurationType: task.taskDurationType
    });
    setShowEditModal(true);
  };

  const handleCompleteClick = (task) => {
    setSelectedTask(task);
    setShowCompleteModal(true);
  };

  const handleDeleteClick = (task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getAssignedToUsers = useCallback(() => {
    if (!user?.role || users.length === 0) return [];
    
    let allowedRoles = [];
    
    switch (user.role) {
      case 'merchant':
        allowedRoles = ['manager', 'supervisor', 'staff'];
        break;
      case 'manager':
        allowedRoles = ['manager', 'supervisor', 'staff'];
        break;
      case 'supervisor':
        allowedRoles = ['supervisor', 'staff'];
        break;
      case 'staff':
        allowedRoles = ['staff'];
        break;
      default:
        allowedRoles = [];
    }
    
    let filteredUsers = users.filter(u => 
      allowedRoles.includes(u.role) || u._id === user._id
    );
    
    if (filteredUsers.length === 0) {
      const selfUser = {
        _id: user._id,
        FullName: user.FullName || 'Yourself',
        role: user.role
      };
      filteredUsers = [selfUser];
    }
    
    return filteredUsers;
  }, [user, users]);

  const canEditTask = useCallback((task) => {
    if (!task || !user) return false;
    
    if (user.role === 'merchant') return true;
    
    const isAssignedBy = task.assignedBy?._id === user._id || task.assignedBy === user._id;
    if (isAssignedBy) return true;
    
    const isAssignedTo = task.assignedTo?._id === user._id || task.assignedTo === user._id;
    if (isAssignedTo) return true;
    
    return false;
  }, [user]);

  const canDeleteTask = useCallback((task) => {
    if (!task || !user) return false;
    
    if (user.role === 'merchant') return true;
    
    const isAssignedBy = task.assignedBy?._id === user._id || task.assignedBy === user._id;
    return isAssignedBy;
  }, [user]);

  const canCompleteTask = useCallback((task) => {
    if (!task || !user) return false;
    
    const isAssignedTo = task.assignedTo?._id === user._id || task.assignedTo === user._id;
    return isAssignedTo && task.status === 'pending';
  }, [user]);

  const filteredTasks = getFilteredTasks();
  const assignedUsers = getAssignedToUsers();
  const stats = { allTasks, myTasks, pendingTasks, completedTasks };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Task Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage and track tasks across your restaurant
          </p>
        </div>

        {/* Stats Cards */}
        <TaskStats stats={stats} user={user} />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow mb-6">
          {/* Tabs */}
          <TaskTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
          />

          {/* Toolbar */}
          <TaskToolbar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onCreateTask={() => setShowCreateModal(true)}
          />

          {/* Error/Success Messages */}
          {error && (
            <div className="m-3 sm:m-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start sm:items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
          )}

          {success && (
            <div className="m-3 sm:m-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start sm:items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-green-700 text-sm sm:text-base">{success}</p>
            </div>
          )}

          {/* Tasks Table */}
          <TaskTable
            filteredTasks={filteredTasks}
            loading={loading}
            searchTerm={searchTerm}
            activeTab={activeTab}
            formatDate={formatDate}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
            canCompleteTask={canCompleteTask}
            onEditClick={handleEditClick}
            onCompleteClick={handleCompleteClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleCreateSubmit}
        loading={loading}
        assignedUsers={assignedUsers}
        user={user}
      />

      <EditTaskModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        selectedTask={selectedTask}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleEditSubmit}
        loading={loading}
        assignedUsers={assignedUsers}
      />

      <CompleteTaskModal
        show={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedTask(null);
          setCompleteMessage('');
        }}
        selectedTask={selectedTask}
        completeMessage={completeMessage}
        onMessageChange={(e) => setCompleteMessage(e.target.value)}
        onSubmit={handleCompleteTask}
        loading={loading}
      />

      <DeleteTaskModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
        selectedTask={selectedTask}
        onSubmit={handleDelete}
        loading={loading}
        formatDate={formatDate}
      />
    </div>
  );
};

export default TaskManagement;