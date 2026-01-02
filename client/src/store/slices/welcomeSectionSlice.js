import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import welcomeSectionAPI from '../api/welcomeSectionAPI';

export const fetchWelcomeSection = createAsyncThunk(
  'welcomeSection/fetchWelcomeSection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await welcomeSectionAPI.fetchWelcomeSection();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching welcome section');
    }
  }
);

export const updateWelcomeSection = createAsyncThunk(
  'welcomeSection/updateWelcomeSection',
  async (data, { rejectWithValue }) => {
    try {
      const response = await welcomeSectionAPI.updateWelcomeSection(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating welcome section');
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  success: false
};

const welcomeSectionSlice = createSlice({
  name: 'welcomeSection',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = false; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWelcomeSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWelcomeSection.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
      })
      .addCase(fetchWelcomeSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateWelcomeSection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateWelcomeSection.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
        state.success = true;
      })
      .addCase(updateWelcomeSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { clearSuccess, clearError } = welcomeSectionSlice.actions;
export default welcomeSectionSlice.reducer;
