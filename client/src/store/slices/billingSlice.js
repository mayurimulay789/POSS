
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import billingAPI from '../api/billingAPI';

export const fetchBills = createAsyncThunk(
  'billing/fetchBills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await billingAPI.fetchBills();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching bills');
    }
  }
);

export const createBill = createAsyncThunk(
  'billing/createBill',
  async (data, { rejectWithValue }) => {
    try {
      const response = await billingAPI.createBill(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating bill');
    }
  }
);

export const updateBill = createAsyncThunk(
  'billing/updateBill',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await billingAPI.updateBill(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating bill');
    }
  }
);

export const deleteBill = createAsyncThunk(
  'billing/deleteBill',
  async (id, { rejectWithValue }) => {
    try {
      const response = await billingAPI.deleteBill(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting bill');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  success: false
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = false; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBill.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload.data || action.payload);
        state.success = true;
      })
      .addCase(createBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBill.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        const idx = state.items.findIndex(i => i._id === updated._id);
        if (idx > -1) state.items[idx] = updated;
        state.success = true;
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBill.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.data?._id || action.payload._id;
        state.items = state.items.filter(i => i._id !== deletedId);
        state.success = true;
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSuccess, clearError } = billingSlice.actions;
export default billingSlice.reducer;
