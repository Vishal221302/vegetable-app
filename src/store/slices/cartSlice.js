import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { getDiscountedPrice } from '../../utils/theme';

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

export const syncCartWithServer = createAsyncThunk('cart/syncCartWithServer', async (cartItems, { rejectWithValue }) => {
  try {
    const response = await api.post('/user/cart/sync', { cartItems });
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
    },
    addToCartLocal: (state, action) => {
      const { productId, quantity, price, name, image } = action.payload;
      const existingIdx = state.items.findIndex(item => item.id === productId);
      if (existingIdx > -1) {
        state.items[existingIdx].quantity += quantity || 1;
      } else {
        state.items.push({
          id: productId,
          productId,
          quantity: quantity || 1,
          price,
          name,
          image
        });
      }
      state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
      state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
    },
    removeFromCartLocal: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
      state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
    },
    updateQuantityLocal: (state, action) => {
      const { productId, quantity } = action.payload;
      const existingIdx = state.items.findIndex(item => item.id === productId);
      if (existingIdx > -1) {
        state.items[existingIdx].quantity = quantity;
      }
      state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
      state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.map(item => {
          const product = item.product || {};
          const finalPrice = getDiscountedPrice(product.price || 0, product.tag);
          return {
            ...product,
            id: product._id || item.product,
            quantity: item.quantity,
            price: finalPrice,
            originalPrice: product.price || 0
          };
        });
        state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
        state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
        state.loading = false;
      })
      .addCase(addToCartApi.fulfilled, (state, action) => {
        state.items = (action.payload.items || []).map(item => {
          const product = item.product && typeof item.product === 'object' ? item.product : {};
          const basePrice = product.price || action.payload.price || 0;
          const finalPrice = getDiscountedPrice(basePrice, product.tag);
          return {
            ...product,
            id: product._id || item.product,
            quantity: item.quantity,
            price: finalPrice,
            originalPrice: basePrice,
            name: product.name || action.payload.name || 'Unknown Product',
            image: product.image || action.payload.image || ''
          };
        });
        state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
        state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
      })
      .addCase(removeFromCartApi.fulfilled, (state, action) => {
        state.items = (action.payload || []).map(item => {
          const product = item.product && typeof item.product === 'object' ? item.product : {};
          const finalPrice = getDiscountedPrice(product.price || 0, product.tag);
          return {
            ...product,
            id: product._id || item.product,
            quantity: item.quantity,
            price: finalPrice,
            originalPrice: product.price || 0
          };
        });
        state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
        state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
      })
      .addCase(updateQuantityApi.fulfilled, (state, action) => {
        state.items = (action.payload || []).map(item => {
          const product = item.product && typeof item.product === 'object' ? item.product : {};
          const finalPrice = getDiscountedPrice(product.price || 0, product.tag);
          return {
            ...product,
            id: product._id || item.product,
            quantity: item.quantity,
            price: finalPrice,
            originalPrice: product.price || 0
          };
        });
        state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
        state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.items = (action.payload || []).map(item => {
          const product = item.product && typeof item.product === 'object' ? item.product : {};
          const finalPrice = getDiscountedPrice(product.price || 0, product.tag);
          return {
            ...product,
            id: product._id || item.product,
            quantity: item.quantity,
            price: finalPrice,
            originalPrice: product.price || 0
          };
        });
        state.totalAmount = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
        state.totalCount = state.items.reduce((total, item) => total + item.quantity, 0);
      });
  }
});

export const { clearCart, addToCartLocal, removeFromCartLocal, updateQuantityLocal } = cartSlice.actions;
export default cartSlice.reducer;
