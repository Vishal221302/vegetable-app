import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/user/cart');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const addToCartApi = createAsyncThunk('cart/addToCartApi', async ({ productId, quantity, price, name, image }, { rejectWithValue }) => {
  try {
    const response = await api.post('/user/cart', { productId, quantity });
    return { items: response.data, price, name, image }; // We might need extra info for local state if API only returns IDs
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const removeFromCartApi = createAsyncThunk('cart/removeFromCartApi', async (productId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/user/cart/${productId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateQuantityApi = createAsyncThunk('cart/updateQuantityApi', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.post('/user/cart', { productId, quantity, updateType: 'set' }); // I'll update backend to handle set
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalAmount: 0,
    totalCount: 0,
    loading: false,
    error: null
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.map(item => ({
          ...(item.product || {}),
          id: item.product?._id || item.product,
          quantity: item.quantity
        }));
        state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
        state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
        state.loading = false;
      })
      .addCase(addToCartApi.fulfilled, (state, action) => {
        state.items = (action.payload.items || []).map(item => {
          const product = item.product && typeof item.product === 'object' ? item.product : {};
          return {
            ...product,
            id: product._id || item.product,
            quantity: item.quantity,
            price: product.price || action.payload.price || 0,
            name: product.name || action.payload.name || 'Unknown Product',
            image: product.image || action.payload.image || ''
          };
        });
        state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
        state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
      })
      .addCase(removeFromCartApi.fulfilled, (state, action) => {
        state.items = (action.payload || []).map(item => ({
          ...(item.product && typeof item.product === 'object' ? item.product : {}),
          id: item.product?._id || item.product,
          quantity: item.quantity
        }));
        state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
        state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
      })
      .addCase(updateQuantityApi.fulfilled, (state, action) => {
        state.items = (action.payload || []).map(item => ({
          ...(item.product && typeof item.product === 'object' ? item.product : {}),
          id: item.product?._id || item.product,
          quantity: item.quantity
        }));
        state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
        state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
      });
  }
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
