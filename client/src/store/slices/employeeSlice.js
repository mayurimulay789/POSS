import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import employeeAPI from '../api/employeeAPI';

// Async Thunks
export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.createEmployee(employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create employee'
      );
    }
  }
);

export const getEmployees = createAsyncThunk(
  'employees/getEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployees(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch employees'
      );
    }
  }
);

export const getEmployee = createAsyncThunk(
  'employees/getEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployee(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch employee'
      );
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateEmployee(id, employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update employee'
      );
    }
  }
);

export const toggleEmployeeStatus = createAsyncThunk(
  'employees/toggleEmployeeStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.toggleEmployeeStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update employee status'
      );
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await employeeAPI.deleteEmployee(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete employee'
      );
    }
  }
);

// Initial State
const initialState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    search: '',
    role: '',
    page: 1,
    limit: 10
  }
};

// Employee Slice
const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        role: '',
        page: 1,
        limit: 10
      };
    },
    resetEmployeeState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.unshift(action.payload.user);
        state.success = action.payload.message || 'Employee created successfully';
        state.error = null;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      // Get Employees
      .addCase(getEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.users;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.employees = [];
      })
      // Get Employee
      .addCase(getEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload.user;
        state.error = null;
      })
      .addCase(getEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentEmployee = null;
      })
      // Update Employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEmployee = action.payload.user;
        const index = state.employees.findIndex(emp => emp._id === updatedEmployee._id);
        if (index !== -1) {
          state.employees[index] = updatedEmployee;
        }
        if (state.currentEmployee && state.currentEmployee._id === updatedEmployee._id) {
          state.currentEmployee = updatedEmployee;
        }
        state.success = action.payload.message || 'Employee updated successfully';
        state.error = null;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      // Toggle Employee Status
      .addCase(toggleEmployeeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(toggleEmployeeStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEmployee = action.payload.user;
        const index = state.employees.findIndex(emp => emp._id === updatedEmployee._id);
        if (index !== -1) {
          state.employees[index] = updatedEmployee;
        }
        if (state.currentEmployee && state.currentEmployee._id === updatedEmployee._id) {
          state.currentEmployee = updatedEmployee;
        }
        state.success = action.payload.message || 'Employee status updated successfully';
        state.error = null;
      })
      .addCase(toggleEmployeeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      // Delete Employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(emp => emp._id !== action.payload);
        state.success = 'Employee deleted successfully';
        state.error = null;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentEmployee,
  setFilters,
  clearFilters,
  resetEmployeeState
} = employeeSlice.actions;

export default employeeSlice.reducer;