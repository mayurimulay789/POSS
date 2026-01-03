import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import aboutUsAPI from '../api/aboutUsAPI';

export const fetchAboutUs = createAsyncThunk(
  'aboutUs/fetchAboutUs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aboutUsAPI.fetchAboutUs();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching about us');
    }
  }
);

export const updateAboutUs = createAsyncThunk(
  'aboutUs/updateAboutUs',
  async (data, { rejectWithValue }) => {
    try {
      const response = await aboutUsAPI.updateAboutUs(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating about us');
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  success: false
};

const aboutUsSlice = createSlice({
  name: 'aboutUs',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = false; },
    clearError: (state) => { state.error = null; },
    setAboutUsField: (state, action) => {
      // action.payload: { field, value }
      if (!state.data) state.data = {};
      state.data[action.payload.field] = action.payload.value;
    },
    setAboutUsFields: (state, action) => {
      // action.payload: { ...fields }
      if (!state.data) state.data = {};
      Object.assign(state.data, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAboutUs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAboutUs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
      })
      .addCase(fetchAboutUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAboutUs.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAboutUs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
        state.success = true;
      })
      .addCase(updateAboutUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { clearSuccess, clearError, setAboutUsField, setAboutUsFields } = aboutUsSlice.actions;
export default aboutUsSlice.reducer;
