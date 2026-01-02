import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cuisineGalleryAPI from '../api/cuisineGalleryAPI';

export const fetchCuisineGallery = createAsyncThunk(
  'cuisineGallery/fetchCuisineGallery',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cuisineGalleryAPI.fetchCuisineGallery();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching cuisine gallery');
    }
  }
);

export const updateCuisineGallery = createAsyncThunk(
  'cuisineGallery/updateCuisineGallery',
  async (data, { rejectWithValue }) => {
    try {
      const response = await cuisineGalleryAPI.updateCuisineGallery(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating cuisine gallery');
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  success: false
};

const cuisineGallerySlice = createSlice({
  name: 'cuisineGallery',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = false; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCuisineGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuisineGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
      })
      .addCase(fetchCuisineGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCuisineGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCuisineGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
        state.success = true;
      })
      .addCase(updateCuisineGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { clearSuccess, clearError } = cuisineGallerySlice.actions;
export default cuisineGallerySlice.reducer;
