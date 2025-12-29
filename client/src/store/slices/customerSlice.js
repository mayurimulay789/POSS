import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerAPI from '../api/customerAPI';

// Async Thunks
export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await customerAPI.createCustomer(customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create customer'
      );
    }
  }
);

export const getCustomers = createAsyncThunk(
  'customers/getCustomers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch customers'
      );
    }
  }
);

export const getMyCustomers = createAsyncThunk(
  'customers/getMyCustomers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getMyCustomers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your customers'
      );
    }
  }
);

export const getCustomersByMembershipType = createAsyncThunk(
  'customers/getCustomersByMembershipType',
  async ({ type, params = {} }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomersByMembershipType(type, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch customers by membership type'
      );
    }
  }
);

export const searchCustomers = createAsyncThunk(
  'customers/searchCustomers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await customerAPI.searchCustomers(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search customers'
      );
    }
  }
);

export const getCustomer = createAsyncThunk(
  'customers/getCustomer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomer(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch customer'
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.updateCustomer(id, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update customer'
      );
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await customerAPI.deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete customer'
      );
    }
  }
);

export const toggleCustomerStatus = createAsyncThunk(
  'customers/toggleCustomerStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.toggleCustomerStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update customer status'
      );
    }
  }
);

export const renewMembership = createAsyncThunk(
  'customers/renewMembership',
  async ({ id, months = 12 }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.renewMembership(id, months);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to renew membership'
      );
    }
  }
);

export const getCustomerStats = createAsyncThunk(
  'customers/getCustomerStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomerStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch customer statistics'
      );
    }
  }
);

export const exportCustomers = createAsyncThunk(
  'customers/exportCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.exportCustomers();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to export customers'
      );
    }
  }
);

export const importCustomers = createAsyncThunk(
  'customers/importCustomers',
  async (customers, { rejectWithValue }) => {
    try {
      const response = await customerAPI.importCustomers(customers);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to import customers'
      );
    }
  }
);

// Initial State
const initialState = {
  customers: [],
  myCustomers: [],
  filteredCustomers: [],
  currentCustomer: null,
  stats: {}, // For detailed stats from getCustomerStats
  listStats: {}, // For simple stats from getCustomers (renamed from stats)
  loading: false,
  error: null,
  success: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    search: '',
    status: '',
    membership_type: '',
    city: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  searchResults: []
};

// Customer Slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        membership_type: '',
        city: '',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
    },
    resetCustomerState: (state) => {
      return initialState;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload.data);
        state.myCustomers.unshift(action.payload.data);
        state.success = action.payload.message || 'Customer created successfully';
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Get Customers
      .addCase(getCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.data;
        state.pagination = {
          current: action.payload.currentPage || 1,
          pages: action.payload.totalPages || 1,
          total: action.payload.total || 0,
          hasNext: (action.payload.currentPage || 1) < (action.payload.totalPages || 1),
          hasPrev: (action.payload.currentPage || 1) > 1
        };
        // Store list stats separately - don't overwrite detailed stats
        state.listStats = action.payload.listStats || {};
        state.error = null;
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.customers = [];
      })
      
      // Get My Customers
      .addCase(getMyCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.myCustomers = action.payload.data;
        state.pagination = {
          current: action.payload.currentPage || 1,
          pages: action.payload.totalPages || 1,
          total: action.payload.total || 0,
          hasNext: (action.payload.currentPage || 1) < (action.payload.totalPages || 1),
          hasPrev: (action.payload.currentPage || 1) > 1
        };
        state.error = null;
      })
      .addCase(getMyCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.myCustomers = [];
      })
      
      // Get Customers by Membership Type
      .addCase(getCustomersByMembershipType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomersByMembershipType.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredCustomers = action.payload.data;
        state.pagination = {
          current: action.payload.currentPage || 1,
          pages: action.payload.totalPages || 1,
          total: action.payload.total || 0,
          hasNext: (action.payload.currentPage || 1) < (action.payload.totalPages || 1),
          hasPrev: (action.payload.currentPage || 1) > 1
        };
        state.error = null;
      })
      .addCase(getCustomersByMembershipType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.filteredCustomers = [];
      })
      
      // Search Customers
      .addCase(searchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
        state.error = null;
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.searchResults = [];
      })
      
      // Get Single Customer
      .addCase(getCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload.data;
        state.error = null;
      })
      .addCase(getCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentCustomer = null;
      })
      
      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCustomer = action.payload.data;
        
        // Update in customers array
        const index = state.customers.findIndex(c => c._id === updatedCustomer._id);
        if (index !== -1) {
          state.customers[index] = updatedCustomer;
        }
        
        // Update in myCustomers array
        const myIndex = state.myCustomers.findIndex(c => c._id === updatedCustomer._id);
        if (myIndex !== -1) {
          state.myCustomers[myIndex] = updatedCustomer;
        }
        
        // Update in filteredCustomers array
        const filteredIndex = state.filteredCustomers.findIndex(c => c._id === updatedCustomer._id);
        if (filteredIndex !== -1) {
          state.filteredCustomers[filteredIndex] = updatedCustomer;
        }
        
        if (state.currentCustomer && state.currentCustomer._id === updatedCustomer._id) {
          state.currentCustomer = updatedCustomer;
        }
        
        state.success = action.payload.message || 'Customer updated successfully';
        state.error = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        
        // Remove from customers array
        state.customers = state.customers.filter(c => c._id !== deletedId);
        
        // Remove from myCustomers array
        state.myCustomers = state.myCustomers.filter(c => c._id !== deletedId);
        
        // Remove from filteredCustomers array
        state.filteredCustomers = state.filteredCustomers.filter(c => c._id !== deletedId);
        
        // Remove from searchResults array
        state.searchResults = state.searchResults.filter(c => c._id !== deletedId);
        
        if (state.currentCustomer && state.currentCustomer._id === deletedId) {
          state.currentCustomer = null;
        }
        
        state.success = 'Customer deleted successfully';
        state.error = null;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Toggle Customer Status
      .addCase(toggleCustomerStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(toggleCustomerStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCustomer = action.payload.data;
        
        // Update in all arrays
        [state.customers, state.myCustomers, state.filteredCustomers, state.searchResults].forEach(array => {
          const index = array.findIndex(c => c._id === updatedCustomer._id);
          if (index !== -1) {
            array[index] = updatedCustomer;
          }
        });
        
        if (state.currentCustomer && state.currentCustomer._id === updatedCustomer._id) {
          state.currentCustomer = updatedCustomer;
        }
        
        state.success = action.payload.message || 'Customer status updated successfully';
        state.error = null;
      })
      .addCase(toggleCustomerStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Renew Membership
      .addCase(renewMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(renewMembership.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCustomer = action.payload.data;
        
        // Update in all arrays
        [state.customers, state.myCustomers, state.filteredCustomers, state.searchResults].forEach(array => {
          const index = array.findIndex(c => c._id === updatedCustomer._id);
          if (index !== -1) {
            array[index] = updatedCustomer;
          }
        });
        
        if (state.currentCustomer && state.currentCustomer._id === updatedCustomer._id) {
          state.currentCustomer = updatedCustomer;
        }
        
        state.success = action.payload.message || 'Membership renewed successfully';
        state.error = null;
      })
      .addCase(renewMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      
      // Get Customer Stats
      .addCase(getCustomerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data; // Store detailed stats here
        state.error = null;
      })
      .addCase(getCustomerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = {};
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentCustomer,
  setFilters,
  clearFilters,
  resetCustomerState,
  clearSearchResults
} = customerSlice.actions;

// Selectors
export const selectCustomers = (state) => state.customers.customers;
export const selectMyCustomers = (state) => state.customers.myCustomers;
export const selectFilteredCustomers = (state) => state.customers.filteredCustomers;
export const selectCurrentCustomer = (state) => state.customers.currentCustomer;
export const selectCustomerStats = (state) => state.customers.stats; // Detailed stats from getCustomerStats
export const selectCustomerListStats = (state) => state.customers.listStats; // Simple stats from getCustomers
export const selectCustomerLoading = (state) => state.customers.loading;
export const selectCustomerError = (state) => state.customers.error;
export const selectCustomerSuccess = (state) => state.customers.success;
export const selectCustomerPagination = (state) => state.customers.pagination;
export const selectCustomerFilters = (state) => state.customers.filters;
export const selectSearchResults = (state) => state.customers.searchResults;

export default customerSlice.reducer;