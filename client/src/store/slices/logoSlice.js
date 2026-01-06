import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as logoAPI from '../api/logoAPI';

export const fetchLogo = createAsyncThunk('logo/fetchLogo', async (_, { rejectWithValue }) => {
  try {
    return await logoAPI.fetchLogo();
  } catch (error) {
    return rejectWithValue(error.message || 'Error fetching logo');
  }
});

export const uploadLogo = createAsyncThunk('logo/uploadLogo', async (file, { rejectWithValue }) => {
  try {
    return await logoAPI.uploadLogo(file);
  } catch (error) {
    return rejectWithValue(error.message || 'Error uploading logo');
  }
});
export const deleteLogo = createAsyncThunk('logo/deleteLogo', async (_, { rejectWithValue }) => {
  try {
    await logoAPI.deleteLogo();
    return '';
  } catch (error) {
    return rejectWithValue(error.message || 'Error deleting logo');
  }
});

const logoSlice = createSlice({
  name: 'logo',
  initialState: {
    logoUrl: '',
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearLogoSuccess: (state) => { state.success = false; },
    clearLogoError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.logoUrl = action.payload;
      })
      .addCase(fetchLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.logoUrl = action.payload;
        state.success = true;
      })
      .addCase(uploadLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteLogo.fulfilled, (state) => {
        state.loading = false;
        state.logoUrl = '';
        state.success = true;
      })
      .addCase(deleteLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearLogoSuccess, clearLogoError } = logoSlice.actions;
export default logoSlice.reducer;
