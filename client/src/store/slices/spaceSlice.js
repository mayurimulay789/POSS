import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import spaceAPI from '../api/spaceAPI';

export const fetchSpaces = createAsyncThunk(
  'space/fetchSpaces',
  async (_, { rejectWithValue }) => {
    try {
      const response = await spaceAPI.fetchSpaces();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching spaces');
    }
  }
);

export const createSpace = createAsyncThunk(
  'space/createSpace',
  async (data, { rejectWithValue }) => {
    try {
      const response = await spaceAPI.createSpace(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating space');
    }
  }
);

export const updateSpace = createAsyncThunk(
  'space/updateSpace',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await spaceAPI.updateSpace(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating space');
    }
  }
);

export const deleteSpace = createAsyncThunk(
  'space/deleteSpace',
  async (id, { rejectWithValue }) => {
    try {
      const response = await spaceAPI.deleteSpace(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting space');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  success: false
};

const spaceSlice = createSlice({
  name: 'space',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = false; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpaces.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
      })
      .addCase(fetchSpaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSpace.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload.data || action.payload);
        state.success = true;
      })
      .addCase(createSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSpace.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        const idx = state.items.findIndex(s => s._id === updated._id);
        if (idx > -1) state.items[idx] = updated;
        state.success = true;
      })
      .addCase(updateSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSpace.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteSpace.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.data?._id || action.payload._id;
        state.items = state.items.filter(s => s._id !== deletedId);
        state.success = true;
      })
      .addCase(deleteSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSuccess, clearError } = spaceSlice.actions;
export default spaceSlice.reducer;
