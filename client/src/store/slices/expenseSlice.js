import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import expenseAPI from '../../store/api/expenseAPI';

// Async Thunks
export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.createExpense(expenseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create expense'
      );
    }
  }
);

export const getExpenses = createAsyncThunk(
  'expenses/getExpenses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getExpenses(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch expenses'
      );
    }
  }
);

export const getMyExpenses = createAsyncThunk(
  'expenses/getMyExpenses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getMyExpenses(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your expenses'
      );
    }
  }
);

export const getExpense = createAsyncThunk(
  'expenses/getExpense',
  async (id, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.getExpense(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch expense'
      );
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, expenseData }, { rejectWithValue }) => {
    try {
      const response = await expenseAPI.updateExpense(id, expenseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update expense'
      );
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await expenseAPI.deleteExpense(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete expense'
      );
    }
  }
);

// Initial State
const initialState = {
  expenses: [],
  myExpenses: [],
  currentExpense: null,
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
  myExpensesPagination: {
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  },
  statistics: {
    totalAmount: 0
  }
};

// Expense Slice
const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 10
      };
    },
    resetExpenseState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload.data);
        state.myExpenses.unshift(action.payload.data);
        state.success = action.payload.message || 'Expense created successfully';
        state.error = null;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Get Expenses (All)
      .addCase(getExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.data;
        state.pagination = action.payload.pagination;
        state.statistics.totalAmount = action.payload.totalAmount || 0;
        state.error = null;
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.expenses = [];
      })
      
      // Get My Expenses
      .addCase(getMyExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.myExpenses = action.payload.data;
        state.myExpensesPagination = action.payload.pagination;
        state.statistics.totalAmount = action.payload.totalAmount || 0;
        state.error = null;
      })
      .addCase(getMyExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.myExpenses = [];
      })
      
      // Get Single Expense
      .addCase(getExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExpense = action.payload.data;
        state.error = null;
      })
      .addCase(getExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentExpense = null;
      })
      
      // Update Expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const updatedExpense = action.payload.data;
        
        // Update in expenses array
        const index = state.expenses.findIndex(exp => exp._id === updatedExpense._id);
        if (index !== -1) {
          state.expenses[index] = updatedExpense;
        }
        
        // Update in myExpenses array
        const myIndex = state.myExpenses.findIndex(exp => exp._id === updatedExpense._id);
        if (myIndex !== -1) {
          state.myExpenses[myIndex] = updatedExpense;
        }
        
        if (state.currentExpense && state.currentExpense._id === updatedExpense._id) {
          state.currentExpense = updatedExpense;
        }
        
        state.success = action.payload.message || 'Expense updated successfully';
        state.error = null;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Delete Expense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        
        // Remove from expenses array
        state.expenses = state.expenses.filter(exp => exp._id !== deletedId);
        
        // Remove from myExpenses array
        state.myExpenses = state.myExpenses.filter(exp => exp._id !== deletedId);
        
        if (state.currentExpense && state.currentExpense._id === deletedId) {
          state.currentExpense = null;
        }
        
        state.success = 'Expense deleted successfully';
        state.error = null;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentExpense,
  setFilters,
  clearFilters,
  resetExpenseState
} = expenseSlice.actions;

// Selectors
export const selectExpenses = (state) => state.expenses.expenses;
export const selectMyExpenses = (state) => state.expenses.myExpenses;
export const selectCurrentExpense = (state) => state.expenses.currentExpense;
export const selectExpenseLoading = (state) => state.expenses.loading;
export const selectExpenseError = (state) => state.expenses.error;
export const selectExpenseSuccess = (state) => state.expenses.success;
export const selectExpensePagination = (state) => state.expenses.pagination;
export const selectMyExpensesPagination = (state) => state.expenses.myExpensesPagination;
export const selectExpenseFilters = (state) => state.expenses.filters;
export const selectExpenseStatistics = (state) => state.expenses.statistics;

export default expenseSlice.reducer;