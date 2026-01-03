import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import contactUsAPI from '../api/contactUsAPI';

export const fetchContactUs = createAsyncThunk(
  'contactUs/fetchContactUs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactUsAPI.fetchContactUs();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching contact us');
    }
  }
);

export const updateContactUs = createAsyncThunk(
  'contactUs/updateContactUs',
  async (data, { rejectWithValue }) => {
    try {
      const response = await contactUsAPI.updateContactUs(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating contact us');
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  success: false
};

const contactUsSlice = createSlice({
  name: 'contactUs',
  initialState,
  reducers: {
    clearSuccess: (state) => { state.success = false; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactUs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactUs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
      })
      .addCase(fetchContactUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateContactUs.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateContactUs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
        state.success = true;
      })
      .addCase(updateContactUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { clearSuccess, clearError } = contactUsSlice.actions;
export default contactUsSlice.reducer;
