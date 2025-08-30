import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSessionId } from "@/utils/session";
import { toast } from "react-toastify";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper function to get the appropriate identifier
const getCartIdentifier = (getState) => {
  const state = getState();
  const user = state.auth?.user;
  
  if (user && user.id) {
    return { user_id: user.id };
  } else {
    return { session_id: getSessionId() };
  }
};

// ✅ Add to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (payload, thunkAPI) => {
    const identifier = getCartIdentifier(thunkAPI.getState);
    const data = { ...payload, ...identifier };

    try {
      const res = await fetch(`${apiBaseUrl}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result.message || "Failed to add to cart");
        throw new Error(result.message || "Failed to add to cart");
      } else {
        toast.success(result.message);
        // Refresh cart data after adding
        await thunkAPI.dispatch(fetchCart());
      }

      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Remove from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, thunkAPI) => {
    const identifier = getCartIdentifier(thunkAPI.getState);
    const payload = { item_id: itemId, ...identifier };
    
    try {
      const res = await fetch(`${apiBaseUrl}/cart/cartitem/destroy`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to remove from cart");
        throw new Error(result.message || "Failed to remove from cart");
      } else {
        toast.success(result.message || "Item removed from cart");
        // Refresh cart data after removing
        await thunkAPI.dispatch(fetchCart());
      }
      
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Update quantity
export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async (data, thunkAPI) => {
    const identifier = getCartIdentifier(thunkAPI.getState);
    const payload = { ...data, ...identifier };
    
    try {
      const res = await fetch(`${apiBaseUrl}/cart/update-quantity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to update cart quantity");
        throw new Error(result.message || "Failed to update cart quantity");
      } else {
        toast.success(result.message || "Cart updated");
        // Refresh cart data after updating
        await thunkAPI.dispatch(fetchCart());
      }
      
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Get cart data
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const user = state.auth?.user;
      
      let url;
      if (user && user.id) {
        // If user is logged in, use user_id
        url = `${apiBaseUrl}/cart?user_id=${user.id}`;
      } else {
        // If user is not logged in, use session_id
        url = `${apiBaseUrl}/cart?session_id=${getSessionId()}`;
      }
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error("Failed to fetch cart");
      }
      
      const result = await res.json();
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [], // Always start with empty array
    total: 0,
    items_count: 0,
    loading: false,
    error: null,
  },
  reducers: {
    // Clear cart reducer
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.items_count = 0;
    },
    // Add this reducer to handle cart transfer from session to user
    transferCart: (state) => {
      // This can be called after login to transfer session cart to user cart
      // The actual transfer logic should happen on the backend
      // This just triggers a cart refresh
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
        // Don't update items here, let fetchCart handle it
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.loading = false;
        // Don't update items here, let fetchCart handle it
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Update quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state) => {
        state.loading = false;
        // Don't update items here, let fetchCart handle it
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Fetch cart - This is where we properly handle the response
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handle different response structures from your API
        const payload = action.payload;
        
        if (payload && payload.data) {
          // If API returns { data: { items: [...], total: ..., items_count: ... } }
          state.items = Array.isArray(payload.data.items) ? payload.data.items : [];
          state.total = payload.data.total || 0;
          state.items_count = payload.data.items_count || 0;
        } else if (Array.isArray(payload)) {
          // If API returns items array directly
          state.items = payload;
          state.total = payload.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
          state.items_count = payload.length;
        } else if (payload && Array.isArray(payload.items)) {
          // If API returns { items: [...], total: ..., items_count: ... }
          state.items = payload.items;
          state.total = payload.total || 0;
          state.items_count = payload.items_count || 0;
        } else {
          // Fallback: ensure items is always an array
          state.items = [];
          state.total = 0;
          state.items_count = 0;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Keep items as empty array on error
        state.items = [];
        state.total = 0;
        state.items_count = 0;
      });
  },
});

export const { clearCart, transferCart } = cartSlice.actions;
export default cartSlice.reducer;