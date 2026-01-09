
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import aboutUsAPI from '../api/aboutUsAPI';
// Fetch all About Us entries (admin/merchant)
export const fetchAllAboutUs = createAsyncThunk(
  'aboutUs/fetchAllAboutUs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aboutUsAPI.fetchAllAboutUs();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching all about us');
    }
  }
);

export const createAboutUs = createAsyncThunk(
  'aboutUs/createAboutUs',
  async (data, { rejectWithValue }) => {
    try {
      const response = await aboutUsAPI.createAboutUs(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating about us');
    }
  }
);

export const deleteAboutUs = createAsyncThunk(
  'aboutUs/deleteAboutUs',
  async (id, { rejectWithValue }) => {
    try {
      const response = await aboutUsAPI.deleteAboutUs(id);
      return { ...response.data, deletedId: id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting about us entry');
    }
  }
);

export const toggleAboutUsStatus = createAsyncThunk(
  'aboutUs/toggleAboutUsStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await aboutUsAPI.toggleAboutUsStatus(id, status);
      return { ...response.data, toggledId: id, newStatus: status };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error toggling status');
    }
  }
);

export const deleteAboutUsMainField = createAsyncThunk(
  'aboutUs/deleteMainField',
  async (field, { rejectWithValue }) => {
    try {
      const response = await aboutUsAPI.deleteMainField(field);
      return { ...response.data, deletedField: field };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting field');
    }
  }
);

export const deleteAboutUsArrayItem = createAsyncThunk(
  'aboutUs/deleteArrayItem',
  async ({ field, id }, { rejectWithValue }) => {
    try {
      const response = await aboutUsAPI.deleteArrayItem(field, id);
      return { ...response.data, deletedField: field, deletedId: id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting item');
    }
  }
);

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
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await aboutUsAPI.updateAboutUs(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating about us');
    }
  }
);

const initialState = {
  data: [],
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
      if (!state.data) state.data = {};
      state.data[action.payload.field] = action.payload.value;
    },
    setAboutUsFields: (state, action) => {
      if (!state.data) state.data = {};
      Object.assign(state.data, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAboutUs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAboutUs.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.data) state.data = [];
        if (Array.isArray(state.data)) {
          state.data.push(action.payload.data || action.payload);
        }
        state.success = true;
      })
      .addCase(createAboutUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteAboutUs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAboutUs.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.data)) {
          state.data = state.data.filter(entry => entry._id !== action.payload.deletedId);
        }
        state.success = true;
      })
      .addCase(deleteAboutUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(toggleAboutUsStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleAboutUsStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.data)) {
          const entry = state.data.find(e => e._id === action.payload.toggledId);
          if (entry) entry.isActive = action.payload.newStatus;
        }
        state.success = true;
      })
      .addCase(toggleAboutUsStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(fetchAboutUs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAboutUs.fulfilled, (state, action) => {
        state.loading = false;
        // Only set active entry for public view
        const result = action.payload.data || action.payload;
        state.data = Array.isArray(result) ? result : (result ? [result] : []);
      })
      .addCase(fetchAllAboutUs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAboutUs.fulfilled, (state, action) => {
        state.loading = false;
        // Set all entries for management view
        const result = action.payload.data || action.payload;
        state.data = Array.isArray(result) ? result : (result ? [result] : []);
      })
      .addCase(fetchAllAboutUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      })
      .addCase(deleteAboutUsMainField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAboutUsMainField.fulfilled, (state, action) => {
        state.loading = false;
        if (state.data && action.payload.deletedField) {
          delete state.data[action.payload.deletedField];
        }
        state.success = true;
      })
      .addCase(deleteAboutUsMainField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteAboutUsArrayItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAboutUsArrayItem.fulfilled, (state, action) => {
        state.loading = false;
        const { deletedField, deletedId } = action.payload;
        if (state.data && Array.isArray(state.data[deletedField])) {
          state.data[deletedField] = state.data[deletedField].filter(item => item._id !== deletedId);
        }
        state.success = true;
      })
      .addCase(deleteAboutUsArrayItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { clearSuccess, clearError, setAboutUsField, setAboutUsFields } = aboutUsSlice.actions;
export default aboutUsSlice.reducer;