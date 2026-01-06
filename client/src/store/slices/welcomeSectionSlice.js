import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import welcomeSectionAPI from '../api/welcomeSectionAPI';

// Fetch active welcome section (public)
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

// Fetch all welcome sections (protected)
export const fetchAllWelcomeSections = createAsyncThunk(
  'welcomeSection/fetchAllWelcomeSections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await welcomeSectionAPI.fetchAllWelcomeSections();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching welcome sections');
    }
  }
);

// Fetch single welcome section by ID
export const fetchWelcomeSectionById = createAsyncThunk(
  'welcomeSection/fetchWelcomeSectionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await welcomeSectionAPI.fetchWelcomeSectionById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching welcome section');
    }
  }
);

// Create new welcome section
export const createWelcomeSection = createAsyncThunk(
  'welcomeSection/createWelcomeSection',
  async (data, { rejectWithValue }) => {
    try {
      const response = await welcomeSectionAPI.createWelcomeSection(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating welcome section');
    }
  }
);

// Update welcome section
export const updateWelcomeSection = createAsyncThunk(
  'welcomeSection/updateWelcomeSection',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await welcomeSectionAPI.updateWelcomeSection(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating welcome section');
    }
  }
);

// Delete welcome section
export const deleteWelcomeSection = createAsyncThunk(
  'welcomeSection/deleteWelcomeSection',
  async (id, { rejectWithValue }) => {
    try {
      const response = await welcomeSectionAPI.deleteWelcomeSection(id);
      return { ...response.data, deletedId: id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting welcome section');
    }
  }
);

// Toggle welcome section status
export const toggleWelcomeSectionStatus = createAsyncThunk(
  'welcomeSection/toggleWelcomeSectionStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await welcomeSectionAPI.toggleWelcomeSectionStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error toggling welcome section status');
    }
  }
);

const initialState = {
  data: null,
  sections: [],
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
      // Fetch active welcome section
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
      // Fetch all welcome sections
      .addCase(fetchAllWelcomeSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllWelcomeSections.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = action.payload.data || [];
      })
      .addCase(fetchAllWelcomeSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single welcome section by ID
      .addCase(fetchWelcomeSectionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWelcomeSectionById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
      })
      .addCase(fetchWelcomeSectionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create welcome section
      .addCase(createWelcomeSection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createWelcomeSection.fulfilled, (state, action) => {
        state.loading = false;
        state.sections.unshift(action.payload.data);
        state.success = true;
      })
      .addCase(createWelcomeSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update welcome section
      .addCase(updateWelcomeSection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateWelcomeSection.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSection = action.payload.data;
        const index = state.sections.findIndex(s => s._id === updatedSection._id);
        if (index !== -1) {
          state.sections[index] = updatedSection;
        }
        state.data = updatedSection;
        state.success = true;
      })
      .addCase(updateWelcomeSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete welcome section
      .addCase(deleteWelcomeSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWelcomeSection.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = state.sections.filter(s => s._id !== action.payload.deletedId);
        state.success = true;
      })
      .addCase(deleteWelcomeSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle welcome section status
      .addCase(toggleWelcomeSectionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWelcomeSectionStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSection = action.payload.data;
        const index = state.sections.findIndex(s => s._id === updatedSection._id);
        if (index !== -1) {
          state.sections[index] = updatedSection;
        }
        state.success = true;
      })
      .addCase(toggleWelcomeSectionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSuccess, clearError } = welcomeSectionSlice.actions;
export default welcomeSectionSlice.reducer;
