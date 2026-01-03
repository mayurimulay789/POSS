
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hotelImageAPI from '../api/hotelImageAPI';

export const fetchHotelImages = createAsyncThunk(
  'hotelImage/fetchHotelImages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hotelImageAPI.fetchHotelImages();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching hotel images');
    }
  }
);

export const uploadHotelImages = createAsyncThunk(
  'hotelImage/uploadHotelImages',
  async (files, { rejectWithValue }) => {
    try {
      const response = await hotelImageAPI.uploadHotelImages(files);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error uploading hotel images');
    }
  }
);

export const updateHotelImage = createAsyncThunk(
  'hotelImage/updateHotelImage',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await hotelImageAPI.updateHotelImage(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating hotel image');
    }
  }
);

export const deleteHotelImage = createAsyncThunk(
  'hotelImage/deleteHotelImage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hotelImageAPI.deleteHotelImage(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting hotel image');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  success: false
};

const hotelImageSlice = createSlice({
  name: 'hotelImage',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = false; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotelImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelImages.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
      })
      .addCase(fetchHotelImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadHotelImages.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadHotelImages.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload.data || action.payload)) {
          state.items.push(...(action.payload.data || action.payload));
        } else {
          state.items.push(action.payload.data || action.payload);
        }
        state.success = true;
      })
      .addCase(uploadHotelImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateHotelImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateHotelImage.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;
        const idx = state.items.findIndex(i => i._id === updated._id);
        if (idx > -1) state.items[idx] = updated;
        state.success = true;
      })
      .addCase(updateHotelImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteHotelImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteHotelImage.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.data?._id || action.payload._id;
        state.items = state.items.filter(i => i._id !== deletedId);
        state.success = true;
      })
      .addCase(deleteHotelImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSuccess, clearError } = hotelImageSlice.actions;
export default hotelImageSlice.reducer;
