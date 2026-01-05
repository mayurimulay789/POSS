import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cuisineGalleryAPI from '../api/cuisineGalleryAPI';

// Fetch active cuisine gallery (public)
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

// Fetch all cuisine galleries (protected)
export const fetchAllCuisineGalleries = createAsyncThunk(
  'cuisineGallery/fetchAllCuisineGalleries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cuisineGalleryAPI.fetchAllCuisineGalleries();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching cuisine galleries');
    }
  }
);

// Fetch single cuisine gallery by ID
export const fetchCuisineGalleryById = createAsyncThunk(
  'cuisineGallery/fetchCuisineGalleryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await cuisineGalleryAPI.fetchCuisineGalleryById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching cuisine gallery');
    }
  }
);

// Create new cuisine gallery
export const createCuisineGallery = createAsyncThunk(
  'cuisineGallery/createCuisineGallery',
  async (data, { rejectWithValue }) => {
    try {
      const response = await cuisineGalleryAPI.createCuisineGallery(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating cuisine gallery');
    }
  }
);

// Update cuisine gallery
export const updateCuisineGallery = createAsyncThunk(
  'cuisineGallery/updateCuisineGallery',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await cuisineGalleryAPI.updateCuisineGallery(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating cuisine gallery');
    }
  }
);

// Delete cuisine gallery
export const deleteCuisineGallery = createAsyncThunk(
  'cuisineGallery/deleteCuisineGallery',
  async (id, { rejectWithValue }) => {
    try {
      const response = await cuisineGalleryAPI.deleteCuisineGallery(id);
      return { ...response.data, deletedId: id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting cuisine gallery');
    }
  }
);

// Toggle cuisine gallery status
export const toggleCuisineGalleryStatus = createAsyncThunk(
  'cuisineGallery/toggleCuisineGalleryStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await cuisineGalleryAPI.toggleCuisineGalleryStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error toggling cuisine gallery status');
    }
  }
);

const initialState = {
  data: null,
  galleries: [],
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
      // Fetch active cuisine gallery
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
      // Fetch all cuisine galleries
      .addCase(fetchAllCuisineGalleries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCuisineGalleries.fulfilled, (state, action) => {
        state.loading = false;
        state.galleries = action.payload.data || [];
      })
      .addCase(fetchAllCuisineGalleries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single cuisine gallery by ID
      .addCase(fetchCuisineGalleryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuisineGalleryById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
      })
      .addCase(fetchCuisineGalleryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create cuisine gallery
      .addCase(createCuisineGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCuisineGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.galleries.unshift(action.payload.data);
        state.success = true;
      })
      .addCase(createCuisineGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update cuisine gallery
      .addCase(updateCuisineGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCuisineGallery.fulfilled, (state, action) => {
        state.loading = false;
        const updatedGallery = action.payload.data;
        const index = state.galleries.findIndex(g => g._id === updatedGallery._id);
        if (index !== -1) {
          state.galleries[index] = updatedGallery;
        }
        state.data = updatedGallery;
        state.success = true;
      })
      .addCase(updateCuisineGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete cuisine gallery
      .addCase(deleteCuisineGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCuisineGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.galleries = state.galleries.filter(g => g._id !== action.payload.deletedId);
        state.success = true;
      })
      .addCase(deleteCuisineGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle cuisine gallery status
      .addCase(toggleCuisineGalleryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleCuisineGalleryStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedGallery = action.payload.data;
        const index = state.galleries.findIndex(g => g._id === updatedGallery._id);
        if (index !== -1) {
          state.galleries[index] = updatedGallery;
        }
        state.success = true;
      })
      .addCase(toggleCuisineGalleryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSuccess, clearError } = cuisineGallerySlice.actions;
export default cuisineGallerySlice.reducer;
