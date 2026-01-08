import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chargeAPI from '../api/chargeAPI';

// Async Thunks
export const getAllCharges = createAsyncThunk(
  'charges/getAllCharges',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await chargeAPI.getAllCharges(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch charges'
      );
    }
  }
);

export const getChargeById = createAsyncThunk(
  'charges/getChargeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await chargeAPI.getChargeById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch charge'
      );
    }
  }
);

export const createCharge = createAsyncThunk(
  'charges/createCharge',
  async (chargeData, { rejectWithValue }) => {
    try {
      const response = await chargeAPI.createCharge(chargeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create charge'
      );
    }
  }
);

export const updateCharge = createAsyncThunk(
  'charges/updateCharge',
  async ({ id, chargeData }, { rejectWithValue }) => {
    try {
      const response = await chargeAPI.updateCharge(id, chargeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update charge'
      );
    }
  }
);

export const deleteCharge = createAsyncThunk(
  'charges/deleteCharge',
  async (id, { rejectWithValue }) => {
    try {
      await chargeAPI.deleteCharge(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete charge'
      );
    }
  }
);

export const toggleChargeStatus = createAsyncThunk(
  'charges/toggleChargeStatus',
  async ({ id, active }, { rejectWithValue }) => {
    try {
      const response = await chargeAPI.toggleChargeStatus(id, active);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle charge status'
      );
    }
  }
);

export const getSystemCharges = createAsyncThunk(
  'charges/getSystemCharges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chargeAPI.getSystemCharges();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch system charges'
      );
    }
  }
);

export const getOptionalCharges = createAsyncThunk(
  'charges/getOptionalCharges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chargeAPI.getOptionalCharges();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch optional charges'
      );
    }
  }
);

export const getSystemChargesSummary = createAsyncThunk(
  'charges/getSystemChargesSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chargeAPI.getSystemChargesSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch system charges summary'
      );
    }
  }
);

export const calculateBillCharges = createAsyncThunk(
  'charges/calculateBillCharges',
  async ({ subtotal, selectedOptionalCharges = [] }, { rejectWithValue }) => {
    try {
      const response = await chargeAPI.calculateBillCharges(subtotal, selectedOptionalCharges);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to calculate bill charges'
      );
    }
  }
);

// Initial State
const initialState = {
  charges: [],
  systemCharges: [],
  optionalCharges: [],
  systemChargesSummary: {
    totalSystemChargeRate: 0,
    totalSystemChargesAmount: 0
  },
  currentCharge: null,
  billCalculation: null,
  loading: false,
  error: null,
  success: null,
  filters: {
    category: '',
    active: ''
  }
};

// Charge Slice
const chargeSlice = createSlice({
  name: 'charges',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentCharge: (state) => {
      state.currentCharge = null;
    },
    clearBillCalculation: (state) => {
      state.billCalculation = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        active: ''
      };
    },
    resetChargeState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Charges
      .addCase(getAllCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.charges = action.payload.data;
        state.error = null;
      })
      .addCase(getAllCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.charges = [];
      })

      // Get Charge By ID
      .addCase(getChargeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChargeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCharge = action.payload.data;
        state.error = null;
      })
      .addCase(getChargeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentCharge = null;
      })

      // Create Charge
      .addCase(createCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.charges.unshift(action.payload.data);
        state.success = action.payload.message || 'Charge created successfully';
        state.error = null;
      })
      .addCase(createCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })

      // Update Charge
      .addCase(updateCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCharge.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCharge = action.payload.data;
        
        // Update in charges array
        const index = state.charges.findIndex(c => c._id === updatedCharge._id);
        if (index !== -1) {
          state.charges[index] = updatedCharge;
        }
        
        // Update in systemCharges array
        if (updatedCharge.category === 'systemcharge') {
          const sysIndex = state.systemCharges.findIndex(c => c._id === updatedCharge._id);
          if (sysIndex !== -1) {
            state.systemCharges[sysIndex] = updatedCharge;
          }
        }
        
        // Update in optionalCharges array
        if (updatedCharge.category === 'optionalcharge') {
          const optIndex = state.optionalCharges.findIndex(c => c._id === updatedCharge._id);
          if (optIndex !== -1) {
            state.optionalCharges[optIndex] = updatedCharge;
          }
        }
        
        if (state.currentCharge && state.currentCharge._id === updatedCharge._id) {
          state.currentCharge = updatedCharge;
        }
        
        state.success = action.payload.message || 'Charge updated successfully';
        state.error = null;
      })
      .addCase(updateCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })

      // Delete Charge
      .addCase(deleteCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteCharge.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        
        // Remove from charges array
        state.charges = state.charges.filter(c => c._id !== deletedId);
        
        // Remove from systemCharges array
        state.systemCharges = state.systemCharges.filter(c => c._id !== deletedId);
        
        // Remove from optionalCharges array
        state.optionalCharges = state.optionalCharges.filter(c => c._id !== deletedId);
        
        if (state.currentCharge && state.currentCharge._id === deletedId) {
          state.currentCharge = null;
        }
        
        state.success = 'Charge deleted successfully';
        state.error = null;
      })
      .addCase(deleteCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })

      // Toggle Charge Status
      .addCase(toggleChargeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(toggleChargeStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCharge = action.payload.data;
        
        // Update in charges array
        const index = state.charges.findIndex(c => c._id === updatedCharge._id);
        if (index !== -1) {
          state.charges[index] = updatedCharge;
        }
        
        // Update in systemCharges or optionalCharges array
        if (updatedCharge.category === 'systemcharge') {
          const sysIndex = state.systemCharges.findIndex(c => c._id === updatedCharge._id);
          if (sysIndex !== -1) {
            state.systemCharges[sysIndex] = updatedCharge;
          }
        } else if (updatedCharge.category === 'optionalcharge') {
          const optIndex = state.optionalCharges.findIndex(c => c._id === updatedCharge._id);
          if (optIndex !== -1) {
            state.optionalCharges[optIndex] = updatedCharge;
          }
        }
        
        state.success = action.payload.message || 'Charge status updated successfully';
        state.error = null;
      })
      .addCase(toggleChargeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })

      // Get System Charges
      .addCase(getSystemCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSystemCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.systemCharges = action.payload.data;
        state.error = null;
      })
      .addCase(getSystemCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.systemCharges = [];
      })

      // Get Optional Charges
      .addCase(getOptionalCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOptionalCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.optionalCharges = action.payload.data;
        state.error = null;
      })
      .addCase(getOptionalCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.optionalCharges = [];
      })

      // Get System Charges Summary
      .addCase(getSystemChargesSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSystemChargesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.systemChargesSummary = action.payload.systemchargeSummary;
        state.error = null;
      })
      .addCase(getSystemChargesSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.systemChargesSummary = {
          totalSystemChargeRate: 0,
          totalSystemChargesAmount: 0
        };
      })

      // Calculate Bill Charges
      .addCase(calculateBillCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateBillCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.billCalculation = action.payload;
        state.error = null;
      })
      .addCase(calculateBillCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.billCalculation = null;
      });
  }
});

// Export actions
export const {
  clearError,
  clearSuccess,
  clearCurrentCharge,
  clearBillCalculation,
  setFilters,
  clearFilters,
  resetChargeState
} = chargeSlice.actions;

// Export selectors
export const selectCharges = (state) => state.charges.charges;
export const selectSystemCharges = (state) => state.charges.systemCharges;
export const selectOptionalCharges = (state) => state.charges.optionalCharges;
export const selectSystemChargesSummary = (state) => state.charges.systemChargesSummary;
export const selectCurrentCharge = (state) => state.charges.currentCharge;
export const selectBillCalculation = (state) => state.charges.billCalculation;
export const selectChargeLoading = (state) => state.charges.loading;
export const selectChargeError = (state) => state.charges.error;
export const selectChargeSuccess = (state) => state.charges.success;
export const selectChargeFilters = (state) => state.charges.filters;

export default chargeSlice.reducer;