import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/user/wishlist');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const toggleWishlistApi = createAsyncThunk('wishlist/toggleWishlistApi', async (product, { rejectWithValue }) => {
  try {
    const productId = product._id || product.id;
    const response = await api.post('/user/wishlist', { productId });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(toggleWishlistApi.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
