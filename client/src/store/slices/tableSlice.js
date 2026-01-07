import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tableAPI from '../api/tableAPI';

export const fetchTables = createAsyncThunk(
  'table/fetchTables',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tableAPI.fetchTables();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching tables');
    }
  }
);

export const createTable = createAsyncThunk(
  'table/createTable',
  async (data, { rejectWithValue }) => {
    try {
      const response = await tableAPI.createTable(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating table');
    }
  }
);

export const updateTable = createAsyncThunk(
  'table/updateTable',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await tableAPI.updateTable(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating table');
    }
  }
);

export const deleteTable = createAsyncThunk(
  'table/deleteTable',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tableAPI.deleteTable(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting table');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  success: false
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = false; },
    clearError: (state) => { state.error = null; },
    // Optimistic update - immediately update UI before API call
    optimisticUpdateTable: (state, action) => {
      const { id, data } = action.payload;
      const idx = state.items.findIndex(i => i._id === id);
      if (idx > -1) {
        state.items[idx] = { ...state.items[idx], ...data };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTable.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload.data || action.payload);
        state.success = true;
      })
      .addCase(createTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTable.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        const idx = state.items.findIndex(s => s._id === updated._id);
        // Merge server response with existing state to prevent overwriting optimistic updates
        if (idx > -1) {
          state.items[idx] = { ...state.items[idx], ...updated };
        }
        state.success = true;
      })
      .addCase(updateTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTable.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.data?._id || action.payload._id;
        state.items = state.items.filter(s => s._id !== deletedId);
        state.success = true;
      })
      .addCase(deleteTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSuccess, clearError, optimisticUpdateTable } = tableSlice.actions;
export default tableSlice.reducer;
