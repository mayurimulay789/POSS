import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as footerAPI from '../api/footerAPI';

// Get active footer (public)
export const fetchFooter = createAsyncThunk('footer/fetchFooter', async (_, { rejectWithValue }) => {
  try {
    return await footerAPI.fetchFooter();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching footer');
  }
});

// Get all footers (protected)
export const fetchAllFooters = createAsyncThunk('footer/fetchAllFooters', async (_, { rejectWithValue }) => {
  try {
    return await footerAPI.fetchAllFooters();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching footers');
  }
});

// Get footer by ID (protected)
export const fetchFooterById = createAsyncThunk('footer/fetchFooterById', async (id, { rejectWithValue }) => {
  try {
    return await footerAPI.fetchFooterById(id);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching footer');
  }
});

// Create footer (protected)
export const createFooter = createAsyncThunk('footer/createFooter', async (footerData, { rejectWithValue }) => {
  try {
    return await footerAPI.createFooter(footerData);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error creating footer');
  }
});

// Update footer (protected)
export const updateFooter = createAsyncThunk('footer/updateFooter', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await footerAPI.updateFooter({ id, data });
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error updating footer');
  }
});

// Delete footer (protected)
export const deleteFooter = createAsyncThunk('footer/deleteFooter', async (id, { rejectWithValue }) => {
  try {
    return await footerAPI.deleteFooter(id);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error deleting footer');
  }
});

// Toggle footer status (protected)
export const toggleFooterStatus = createAsyncThunk('footer/toggleFooterStatus', async (id, { rejectWithValue }) => {
  try {
    return await footerAPI.toggleFooterStatus(id);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error toggling footer status');
  }
});

const footerSlice = createSlice({
  name: 'footer',
  initialState: {
    data: null,
    footers: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearSuccess: (state) => { 
      state.success = false; 
    },
    clearError: (state) => { 
      state.error = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active footer
      .addCase(fetchFooter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFooter.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFooter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all footers
      .addCase(fetchAllFooters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFooters.fulfilled, (state, action) => {
        state.loading = false;
        state.footers = action.payload;
      })
      .addCase(fetchAllFooters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch footer by ID
      .addCase(fetchFooterById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFooterById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFooterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create footer
      .addCase(createFooter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createFooter.fulfilled, (state, action) => {
        state.loading = false;
        state.footers.push(action.payload);
        state.success = true;
      })
      .addCase(createFooter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update footer
      .addCase(updateFooter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateFooter.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.footers.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.footers[index] = action.payload;
        }
        state.data = action.payload;
        state.success = true;
      })
      .addCase(updateFooter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete footer
      .addCase(deleteFooter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteFooter.fulfilled, (state, action) => {
        state.loading = false;
        state.footers = state.footers.filter(f => f._id !== action.meta.arg);
        state.success = true;
      })
      .addCase(deleteFooter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Toggle footer status
      .addCase(toggleFooterStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFooterStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.footers.findIndex(f => f._id === action.payload._id);
        if (index !== -1) {
          state.footers[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(toggleFooterStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSuccess, clearError } = footerSlice.actions;
export default footerSlice.reducer;
