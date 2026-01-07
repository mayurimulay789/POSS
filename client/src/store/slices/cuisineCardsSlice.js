import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cuisineCardsAPI from '../api/cuisineCardsAPI';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchCuisineCards = createAsyncThunk(
  'cuisineCards/fetchCuisineCards',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all hotel images and filter for isCuisineCard: true
      const response = await cuisineCardsAPI.fetchCuisineCards();
      const allImages = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const cuisineCards = allImages.filter(img => img.isCuisineCard === true);
      return cuisineCards;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching cuisine cards');
    }
  }
);

export const fetchCuisineBackground = createAsyncThunk(
  'cuisineCards/fetchCuisineBackground',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cuisineCardsAPI.fetchCuisineBackground();
      return response.data;
    } catch (error) {
      // Silently handle 404 - no cuisine gallery background uploaded yet
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || 'Error fetching cuisine background');
    }
  }
);

const cuisineCardsSlice = createSlice({
  name: 'cuisineCards',
  initialState: {
    cards: [],
    loading: false,
    error: null,
    background: null,
    backgroundLoading: false,
    backgroundError: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCuisineCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuisineCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchCuisineCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCuisineBackground.pending, (state) => {
        state.backgroundLoading = true;
        state.backgroundError = null;
      })
      .addCase(fetchCuisineBackground.fulfilled, (state, action) => {
        state.backgroundLoading = false;
        state.background = action.payload;
      })
      .addCase(fetchCuisineBackground.rejected, (state, action) => {
        state.backgroundLoading = false;
        state.backgroundError = action.payload;
      });
  }
});

export default cuisineCardsSlice.reducer;
