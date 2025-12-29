import React from 'react';
import { 
  XCircle, 
  CheckCircle, 
  Loader, 
  AlertCircle,
  X
} from 'lucide-react';
import TaskForm from './TaskForm';

// Base Modal Container
const ModalContainer = ({ children, size = 'md', onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
    <div className={`bg-white rounded-lg shadow-xl w-full ${
      size === 'sm' ? 'max-w-md' : 
      size === 'md' ? 'max-w-lg' : 
      'max-w-2xl'
    } my-4 sm:my-0`}>
      {children}
    </div>
    {/* Close button outside modal for mobile */}
    <button
      onClick={onClose}
      className="fixed top-4 right-4 sm:hidden bg-white rounded-full p-2 shadow-lg"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
);

// Create Task Modal
export const CreateTaskModal = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  loading, 
  assignedUsers, 
  user 
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <ModalContainer size="lg" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
          <button
            onClick={onClose}
            className="hidden sm:block text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto pr-2 -mr-2">
            <TaskForm 
              formData={formData}
              onChange={onChange}
              assignedUsers={assignedUsers}
              user={user}
            />
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

// Edit Task Modal
export const EditTaskModal = ({ 
  show, 
  onClose, 
  selectedTask,
  formData, 
  onChange, 
  onSubmit, 
  loading, 
  assignedUsers 
}) => {
  if (!show || !selectedTask) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <ModalContainer size="lg" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
          <button
            onClick={onClose}
            className="hidden sm:block text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto pr-2 -mr-2">
            <TaskForm 
              formData={formData}
              onChange={onChange}
              assignedUsers={assignedUsers}
              user={null}
              isEdit={true}
              selectedTask={selectedTask}
            />
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Updating...
                </>
              ) : (
                'Update Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
};

// Complete Task Modal
export const CompleteTaskModal = ({ 
  show, 
  onClose, 
  selectedTask,
  completeMessage,
  onMessageChange,
  onSubmit,
  loading 
}) => {
  if (!show || !selectedTask) return null;

  return (
    <ModalContainer size="sm" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Complete Task</h3>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Are you sure you want to mark <strong>"{selectedTask.taskName}"</strong> as completed?
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Completion Message (Optional)
          </label>
          <textarea
            value={completeMessage}
            onChange={onMessageChange}
            rows="3"
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any notes about task completion..."
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Completing...
              </>
            ) : (
              'Mark Complete'
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

// Delete Task Modal
export const DeleteTaskModal = ({ 
  show, 
  onClose, 
  selectedTask,
  onSubmit,
  loading,
  formatDate 
}) => {
  if (!show || !selectedTask) return null;

  return (
    <ModalContainer size="sm" onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <XCircle className="w-6 h-6 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Are you sure you want to delete the task <strong>"{selectedTask.taskName}"</strong>?
          This action cannot be undone.
        </p>

        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Assigned To:</span>
            <span className="font-medium">{selectedTask.assignedTo?.FullName || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
              {selectedTask.status === 'pending' ? 'Pending' : 
               selectedTask.status === 'completed' ? 'Completed' : 
               selectedTask.status === 'cancelled' ? 'Cancelled' : 
               selectedTask.status === 'expired' ? 'Expired' : 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Due Date:</span>
            <span className="font-medium">{formatDate(selectedTask.dueDate)}</span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Task'
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};