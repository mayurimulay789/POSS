import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import contactUsAPI from '../api/contactUsAPI';

// Fetch active contact us (public)
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

// Fetch all contact us (protected)
export const fetchAllContactUs = createAsyncThunk(
  'contactUs/fetchAllContactUs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactUsAPI.fetchAllContactUs();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching contacts');
    }
  }
);

// Fetch single contact us by ID
export const fetchContactUsById = createAsyncThunk(
  'contactUs/fetchContactUsById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contactUsAPI.fetchContactUsById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching contact us');
    }
  }
);

// Create new contact us
export const createContactUs = createAsyncThunk(
  'contactUs/createContactUs',
  async (data, { rejectWithValue }) => {
    try {
      const response = await contactUsAPI.createContactUs(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating contact us');
    }
  }
);

// Update contact us
export const updateContactUs = createAsyncThunk(
  'contactUs/updateContactUs',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await contactUsAPI.updateContactUs(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating contact us');
    }
  }
);

// Delete contact us
export const deleteContactUs = createAsyncThunk(
  'contactUs/deleteContactUs',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contactUsAPI.deleteContactUs(id);
      return { ...response.data, deletedId: id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting contact us');
    }
  }
);

// Toggle contact us status
export const toggleContactUsStatus = createAsyncThunk(
  'contactUs/toggleContactUsStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contactUsAPI.toggleContactUsStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error toggling contact us status');
    }
  }
);

const initialState = {
  data: null,
  contacts: [],
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
      // Fetch active contact us
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
      // Fetch all contact us
      .addCase(fetchAllContactUs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllContactUs.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload.data || [];
      })
      .addCase(fetchAllContactUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single contact us by ID
      .addCase(fetchContactUsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactUsById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
      })
      .addCase(fetchContactUsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create contact us
      .addCase(createContactUs.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createContactUs.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts.unshift(action.payload.data);
        state.success = true;
      })
      .addCase(createContactUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update contact us
      .addCase(updateContactUs.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateContactUs.fulfilled, (state, action) => {
        state.loading = false;
        const updatedContact = action.payload.data;
        const index = state.contacts.findIndex(c => c._id === updatedContact._id);
        if (index !== -1) {
          state.contacts[index] = updatedContact;
        }
        state.data = updatedContact;
        state.success = true;
      })
      .addCase(updateContactUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete contact us
      .addCase(deleteContactUs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContactUs.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = state.contacts.filter(c => c._id !== action.payload.deletedId);
        state.success = true;
      })
      .addCase(deleteContactUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle contact us status
      .addCase(toggleContactUsStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleContactUsStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedContact = action.payload.data;
        const index = state.contacts.findIndex(c => c._id === updatedContact._id);
        if (index !== -1) {
          state.contacts[index] = updatedContact;
        }
        state.success = true;
      })
      .addCase(toggleContactUsStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSuccess, clearError } = contactUsSlice.actions;
export default contactUsSlice.reducer;
