import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskAPI from '../../store/api/taskAPI';

// Async Thunks
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskAPI.createTask(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create task'
      );
    }
  }
);

export const getAllTasks = createAsyncThunk(
  'tasks/getAllTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getAllTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tasks'
      );
    }
  }
);

export const getMyTasks = createAsyncThunk(
  'tasks/getMyTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getMyTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your tasks'
      );
    }
  }
);

export const getAssignedTasks = createAsyncThunk(
  'tasks/getAssignedTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getAssignedTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch assigned tasks'
      );
    }
  }
);

export const getMyPendingTasks = createAsyncThunk(
  'tasks/getMyPendingTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getMyPendingTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch pending tasks'
      );
    }
  }
);

export const getMyCompletedTasks = createAsyncThunk(
  'tasks/getMyCompletedTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getMyCompletedTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch completed tasks'
      );
    }
  }
);

export const getTask = createAsyncThunk(
  'tasks/getTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTask(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.updateTask(id, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await taskAPI.deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete task'
      );
    }
  }
);

// Initial State
const initialState = {
  allTasks: [],
  myTasks: [],
  assignedTasks: [],
  pendingTasks: [],
  completedTasks: [],
  currentTask: null,
  users: [], // For assigning tasks
  loading: false,
  error: null,
  success: null,
  filters: {
    search: '',
    status: '',
    priority: '',
    category: '',
    page: 1,
    limit: 10
  }
};

// Task Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        priority: '',
        category: '',
        page: 1,
        limit: 10
      };
    },
    resetTaskState: (state) => {
      return initialState;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.allTasks.unshift(action.payload.data);
        state.success = action.payload.message || 'Task created successfully';
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Get All Tasks
      .addCase(getAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.allTasks = action.payload.data;
        state.error = null;
      })
      .addCase(getAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.allTasks = [];
      })
      
      // Get My Tasks
      .addCase(getMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.myTasks = action.payload.data;
        state.error = null;
      })
      .addCase(getMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.myTasks = [];
      })
      
      // Get Assigned Tasks
      .addCase(getAssignedTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssignedTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedTasks = action.payload.data;
        state.error = null;
      })
      .addCase(getAssignedTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.assignedTasks = [];
      })
      
      // Get My Pending Tasks
      .addCase(getMyPendingTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPendingTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTasks = action.payload.data;
        state.error = null;
      })
      .addCase(getMyPendingTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.pendingTasks = [];
      })
      
      // Get My Completed Tasks
      .addCase(getMyCompletedTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyCompletedTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.completedTasks = action.payload.data;
        state.error = null;
      })
      .addCase(getMyCompletedTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.completedTasks = [];
      })
      
      // Get Single Task
      .addCase(getTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload.data;
        state.error = null;
      })
      .addCase(getTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentTask = null;
      })
      
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload.data;
        
        // Update in all arrays
        const updateArray = (array) => {
          const index = array.findIndex(task => task._id === updatedTask._id);
          if (index !== -1) {
            array[index] = updatedTask;
          }
        };
        
        updateArray(state.allTasks);
        updateArray(state.myTasks);
        updateArray(state.assignedTasks);
        updateArray(state.pendingTasks);
        updateArray(state.completedTasks);
        
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        
        state.success = action.payload.message || 'Task updated successfully';
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        
        // Remove from all arrays
        const removeFromArray = (array) => {
          return array.filter(task => task._id !== deletedId);
        };
        
        state.allTasks = removeFromArray(state.allTasks);
        state.myTasks = removeFromArray(state.myTasks);
        state.assignedTasks = removeFromArray(state.assignedTasks);
        state.pendingTasks = removeFromArray(state.pendingTasks);
        state.completedTasks = removeFromArray(state.completedTasks);
        
        if (state.currentTask && state.currentTask._id === deletedId) {
          state.currentTask = null;
        }
        
        state.success = 'Task deleted successfully';
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentTask,
  setFilters,
  clearFilters,
  resetTaskState,
  setUsers
} = taskSlice.actions;

// Selectors
export const selectAllTasks = (state) => state.tasks.allTasks;
export const selectMyTasks = (state) => state.tasks.myTasks;
export const selectAssignedTasks = (state) => state.tasks.assignedTasks;
export const selectPendingTasks = (state) => state.tasks.pendingTasks;
export const selectCompletedTasks = (state) => state.tasks.completedTasks;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectTaskLoading = (state) => state.tasks.loading;
export const selectTaskError = (state) => state.tasks.error;
export const selectTaskSuccess = (state) => state.tasks.success;
export const selectTaskFilters = (state) => state.tasks.filters;
export const selectTaskUsers = (state) => state.tasks.users;

export default taskSlice.reducer;